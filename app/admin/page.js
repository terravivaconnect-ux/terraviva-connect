'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import AdminStats from '@/components/AdminStats';
import AdminBeneficiaries from '@/components/AdminBeneficiaries';
import { supabase, fullName, timeAgo } from '@/lib/supabase';
import { useT } from '@/lib/i18n';

const TABS = { stats: 'Statistics', reports: 'Reports', users: 'Users', beneficiaries: 'Beneficiaries', communities: 'Communities' };

function Inner({ me }) {
  const { t } = useT();
  const [tab, setTab] = useState('stats');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [coms, setComs] = useState([]);
  const [nc, setNc] = useState({ name: '', description: '', privacy: 'public' });
  const isAdmin = me.role === 'admin';

  const load = async () => {
    const { data: r } = await supabase.from('reports').select('*, reporter:profiles!reports_reporter_id_fkey(username)').order('created_at', { ascending: false }).limit(50);
    setReports(r || []);
    const { data: u } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
    setUsers(u || []);
    const { data: c } = await supabase.from('communities').select('*').order('name');
    setComs(c || []);
  };
  useEffect(() => { load(); }, []);

  const log = (action, target_type, target_id, details) =>
    supabase.from('audit_logs').insert({ actor_id: me.id, action, target_type, target_id, details });

  const act = async (r, status) => {
    if (status === 'actioned') {
      const table = r.target_type === 'post' ? 'posts' : r.target_type === 'comment' ? 'comments' : null;
      if (table) await supabase.from(table).update({ is_removed: true }).eq('id', r.target_id);
    }
    await supabase.from('reports').update({ status }).eq('id', r.id);
    await log('report_' + status, r.target_type, r.target_id, { report: r.id });
    load();
  };

  const upd = async (u, patch, label) => {
    await supabase.from('profiles').update(patch).eq('id', u.id);
    await log(label, 'user', u.id, patch);
    load();
  };

  const addCom = async (e) => {
    e.preventDefault();
    const slug = nc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { error } = await supabase.from('communities').insert({ ...nc, slug, created_by: me.id });
    if (error) alert(error.message);
    setNc({ name: '', description: '', privacy: 'public' });
    load();
  };

  const toggleCom = async (c) => {
    await supabase.from('communities').update({ is_active: !c.is_active }).eq('id', c.id);
    load();
  };

  return (
    <div>
      <h2>{t("Administration")}</h2>
      <div className="tabs">
        {Object.keys(TABS).filter(k => isAdmin || k !== 'beneficiaries').map(k => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {t(TABS[k])}
          </button>
        ))}
      </div>

      {tab === 'stats' && <AdminStats />}
      {tab === 'beneficiaries' && isAdmin && <AdminBeneficiaries />}

      {tab === 'reports' && (
        <div>
          {!reports.length && <div className="card muted">{t("No reports.")}</div>}
          {reports.map(r => (
            <div className="card" key={r.id}>
              <b>{r.target_type}</b> · <span className="badge b-org">{r.status}</span>{' '}
              <small className="muted">by @{r.reporter?.username} · {timeAgo(r.created_at)}</small>
              <p>{r.reason}</p>
              {r.status === 'open' && (
                <div>
                  <button className="red" onClick={() => act(r, 'actioned')}>{t("Remove content")}</button>{' '}
                  <button className="sec" onClick={() => act(r, 'dismissed')}>{t("Dismiss")}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div>
          {users.map(u => (
            <div className="card" key={u.id}>
              <b>{fullName(u)}</b>{' '}
              <small className="muted">@{u.username} · {u.role} · {u.status}</small>
              {isAdmin && u.id !== me.id && (
                <div style={{ marginTop: '.5rem', display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                  <button className="sec" onClick={() => upd(u, { is_beneficiary_verified: !u.is_beneficiary_verified }, 'toggle_beneficiary')}>
                    {u.is_beneficiary_verified ? t("Unverify beneficiary") : t("Verify beneficiary")}
                  </button>
                  <button className="sec" onClick={() => upd(u, { is_professional_verified: !u.is_professional_verified }, 'toggle_professional')}>
                    {u.is_professional_verified ? t("Unverify pro") : t("Verify pro")}
                  </button>
                  <button className="sec" onClick={() => upd(u, { is_org_verified: !u.is_org_verified }, 'toggle_org')}>
                    {u.is_org_verified ? t("Unverify org") : t("Verify org")}
                  </button>
                  <button className="sec" onClick={() => upd(u, { role: u.role === 'moderator' ? 'member' : 'moderator' }, 'toggle_moderator')}>
                    {u.role === 'moderator' ? t("Remove moderator") : t("Make moderator")}
                  </button>
                  <button className="red" onClick={() => upd(u, { status: u.status === 'suspended' ? 'active' : 'suspended' }, 'toggle_suspend')}>
                    {u.status === 'suspended' ? t("Reactivate") : t("Suspend")}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'communities' && (
        <div>
          {isAdmin && (
            <form className="card" onSubmit={addCom}>
              <h3>{t("New community")}</h3>
              <input placeholder={t("Name")} value={nc.name} onChange={e => setNc({ ...nc, name: e.target.value })} required />
              <textarea placeholder={t("Description")} value={nc.description} onChange={e => setNc({ ...nc, description: e.target.value })} />
              <select value={nc.privacy} onChange={e => setNc({ ...nc, privacy: e.target.value })}>
                <option value="public">{t("Public")}</option>
                <option value="private">{t("Private")}</option>
                <option value="restricted">{t("Restricted")}</option>
              </select>
              <button>{t("Create")}</button>
            </form>
          )}
          {coms.map(c => (
            <div className="card" key={c.id}>
              <b>{c.name}</b>{' '}
              <small className="muted">{c.privacy} · {c.is_active ? 'active' : 'inactive'}</small>
              {isAdmin && (
                <div>
                  <button className="sec" onClick={() => toggleCom(c)}>{c.is_active ? t("Deactivate") : t("Activate")}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  return <Shell staffOnly>{me => <Inner me={me} />}</Shell>;
}
