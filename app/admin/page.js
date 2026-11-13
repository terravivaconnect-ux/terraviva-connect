'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import Avatar from '@/components/Avatar';
import Badges from '@/components/Badges';
import AdminStats from '@/components/AdminStats';
import AdminBeneficiaries from '@/components/AdminBeneficiaries';
import AdminBadges from '@/components/AdminBadges';
import AdminMaintenance from '@/components/AdminMaintenance';
import { supabase, fullName, timeAgo } from '@/lib/supabase';
import { useT } from '@/lib/i18n';

const TABS = { stats: 'Statistics', reports: 'Reports', users: 'Users', beneficiaries: 'Beneficiaries', badges: 'Badges', communities: 'Communities', maintenance: 'Maintenance' };

function Inner({ me }) {
  const { t, lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const [tab, setTab] = useState('stats');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [coms, setComs] = useState([]);
  const [nc, setNc] = useState({ name: '', description: '', privacy: 'public' });
  const [ec, setEc] = useState(null);
  const [uq, setUq] = useState(''); const [ust, setUst] = useState('all');
  const [rf, setRf] = useState('open'); const [rlimit, setRlimit] = useState(50);
  const isAdmin = me.role === 'admin';

  const load = async () => {
    const { data: r } = await supabase.from('reports').select('*, reporter:profiles!reports_reporter_id_fkey(username)').order('created_at', { ascending: false }).limit(rlimit);
    setReports(r || []);
    const { data: u } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
    setUsers(u || []);
    const { data: c } = await supabase.from('communities').select('*').order('name');
    setComs(c || []);
  };
  useEffect(() => { load(); }, [rlimit]);

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

  const delUser = async (uid, name) => {
    if (!confirm(L(`Permanently delete ${name} and all their content? This cannot be undone.`, `Unataka kumfuta ${name} na maudhui yake yote kabisa? Hili haliwezi kurudishwa.`))) return;
    const { error } = await supabase.rpc('admin_delete_user', { uid });
    if (error) return alert(error.message);
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

  const saveCom = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('communities').update({ name: ec.name.trim(), description: ec.description, privacy: ec.privacy }).eq('id', ec.id);
    if (error) return alert(error.message);
    setEc(null); load();
  };

  const toggleCom = async (c) => {
    await supabase.from('communities').update({ is_active: !c.is_active }).eq('id', c.id);
    load();
  };

  return (
    <div>
      <h2>{t("Administration")}</h2>
      <div className="tabs">
        {Object.keys(TABS).filter(k => isAdmin || !['beneficiaries', 'badges', 'maintenance'].includes(k)).map(k => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {k === 'maintenance' ? L('Maintenance', 'Matengenezo') : t(TABS[k])}{k === 'reports' && reports.filter(x => x.status === 'open').length > 0 ? ` (${reports.filter(x => x.status === 'open').length})` : ''}
          </button>
        ))}
      </div>

      {tab === 'stats' && <AdminStats />}
      {tab === 'beneficiaries' && isAdmin && <AdminBeneficiaries onOpenBadges={() => setTab('badges')} />}
      {tab === 'maintenance' && isAdmin && <AdminMaintenance />}
      {tab === 'badges' && isAdmin && <AdminBadges />}

      {tab === 'reports' && (
        <div>
          <p className="muted">{L('Reports sent by members (🚩 Report on posts and profiles) and account deletion requests. They are kept until you delete them, and the newest are shown first.', 'Ripoti zilizotumwa na wanachama (🚩 Ripoti kwenye machapisho na wasifu) pamoja na maombi ya kufutiwa akaunti. Zinabaki hadi uzifute, na za hivi karibuni zinaonekana kwanza.')}</p>
          <div className="tabs">
            {[['open', 'Open', 'Zilizo wazi'], ['actioned', 'Actioned', 'Zilizoshughulikiwa'], ['dismissed', 'Dismissed', 'Zilizopuuzwa'], ['all', 'All', 'Zote']].map(([k, en, sw]) => (
              <button key={k} className={rf === k ? 'on' : ''} onClick={() => setRf(k)}>{L(en, sw)}</button>))}
          </div>
          {!reports.filter(r => rf === 'all' || r.status === rf).length && <div className="card muted">{t("No reports.")}</div>}
          {reports.filter(r => rf === 'all' || r.status === rf).map(r => (
            <div className="card" key={r.id}>
              <b>{r.target_type}</b> · <span className="badge b-org">{r.status}</span>{' '}
              <small className="muted">by @{r.reporter?.username} · {timeAgo(r.created_at)}</small>
              <p>{r.reason}</p>
              {r.reason === 'ACCOUNT DELETION REQUEST' && isAdmin && r.target_id !== me.id && (
                <button className="red" onClick={() => delUser(r.target_id, '@' + r.reporter?.username)}>{L('Delete account permanently', 'Futa akaunti kabisa')}</button>
              )}
              {r.status === 'open' && (
                <div>
                  <button className="red" onClick={() => act(r, 'actioned')}>{t("Remove content")}</button>{' '}
                  <button className="sec" onClick={() => act(r, 'dismissed')}>{t("Dismiss")}</button>
                </div>
              )}
            </div>
          ))}
          {reports.length >= rlimit && <p><button className="sec" onClick={() => setRlimit(rlimit + 50)}>{L('Load more', 'Pakia zaidi')}</button></p>}
        </div>
      )}

      {tab === 'users' && (() => {
        const q = uq.trim().toLowerCase();
        const shown = users.filter(u =>
          (ust === 'all' || (ust === 'staff' ? u.role !== 'member' : u.status === ust)) &&
          (!q || `${fullName(u)} ${u.username} ${u.country || ''} ${u.headline || ''}`.toLowerCase().includes(q)));
        return (
          <div>
            <input type="search" placeholder={L('Search name, username, country…', 'Tafuta jina, username, nchi…')} value={uq} onChange={e => setUq(e.target.value)} />
            <div className="tabs">
              {[['all', 'All', 'Wote'], ['active', 'Active', 'Wanaofanya kazi'], ['suspended', 'Suspended', 'Waliosimamishwa'], ['staff', 'Staff', 'Wasimamizi']].map(([k, en, sw]) => (
                <button key={k} className={ust === k ? 'on' : ''} onClick={() => setUst(k)}>{L(en, sw)}</button>))}
            </div>
            <small className="muted">{L(`${shown.length} of ${users.length} users`, `Watumiaji ${shown.length} kati ya ${users.length}`)}
              {isAdmin && <> · <button className="link" style={{ padding: 0 }} onClick={() => setTab('badges')}>{L('Badges and moderator roles are managed in the Badges tab', 'Beji na nafasi ya msimamizi msaidizi zinasimamiwa kwenye tab ya Badges')} →</button></>}</small>
            <div className="card" style={{ padding: '0 1rem', marginTop: '.6rem' }}>
              {!shown.length && <p className="muted">{L('No users match your search.', 'Hakuna mtumiaji anayelingana na utafutaji.')}</p>}
              {shown.map(u => (
                <div key={u.id} style={{ display: 'flex', gap: '.7rem', alignItems: 'center', flexWrap: 'wrap', padding: '.7rem 0', borderBottom: '1px solid var(--bd)' }}>
                  <Avatar p={u} size={42} />
                  <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                    <Link href={`/profile/${u.username}`}><b>{fullName(u)}</b></Link><Badges p={u} />
                    <div><small className="muted">@{u.username} · {u.country || '—'} · {timeAgo(u.created_at)}</small></div>
                  </div>
                  <div style={{ display: 'flex', gap: '.3rem', alignItems: 'center' }}>
                    <span className="badge b-pro" style={{ marginLeft: 0 }}>{u.role}</span>
                    {u.status === 'active'
                      ? <span className="badge b-ben" style={{ marginLeft: 0 }}>{u.status}</span>
                      : <span className="badge" style={{ marginLeft: 0, background: '#fdecea', color: 'var(--red)' }}>{u.status}</span>}
                  </div>
                  {isAdmin && u.id !== me.id && (
                    <div style={{ display: 'flex', gap: '.4rem' }}>
                      <button className={u.status === 'suspended' ? 'sec' : 'red'} onClick={() => upd(u, { status: u.status === 'suspended' ? 'active' : 'suspended' }, 'toggle_suspend')}>
                        {u.status === 'suspended' ? t("Reactivate") : t("Suspend")}
                      </button>
                      <button className="link" onClick={() => delUser(u.id, fullName(u))}>🗑 {L('Delete', 'Futa')}</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

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
          {ec && (
            <form className="card" onSubmit={saveCom}>
              <h3>{L('Edit community', 'Hariri jumuiya')}</h3>
              <input placeholder={t("Name")} value={ec.name} onChange={e => setEc({ ...ec, name: e.target.value })} required />
              <textarea rows={4} placeholder={t("Description")} value={ec.description || ''} onChange={e => setEc({ ...ec, description: e.target.value })} />
              <select value={ec.privacy} onChange={e => setEc({ ...ec, privacy: e.target.value })}>
                <option value="public">{t("Public")}</option>
                <option value="private">{t("Private")}</option>
                <option value="restricted">{t("Restricted")}</option>
              </select>
              <button>{t("Save changes")}</button> <button type="button" className="sec" onClick={() => setEc(null)}>{t("Cancel")}</button>
            </form>
          )}
          {coms.map(c => (
            <div className="card" key={c.id}>
              <b>{c.name}</b>{' '}
              <small className="muted">{c.privacy} · {c.is_active ? 'active' : 'inactive'}</small>
              {isAdmin && (
                <div>
                  <button className="sec" onClick={() => setEc({ ...c })}>✏️ {L('Edit', 'Hariri')}</button>{' '}
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
