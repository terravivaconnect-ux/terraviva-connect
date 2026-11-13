'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import Badges from '@/components/Badges';
import { supabase, fullName, timeAgo } from '@/lib/supabase';
import { useT } from '@/lib/i18n';

const csvCell = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';

/** Orodha ya wanufaika: wanachama wenye beji ya Beneficiary pekee. Beji yenyewe inatolewa kwenye tab ya Badges. */
export default function AdminBeneficiaries({ onOpenBadges }) {
  const { lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const [rows, setRows] = useState(null); const [err, setErr] = useState(''); const [q, setQ] = useState(''); const [country, setCountry] = useState('all');

  useEffect(() => { supabase.rpc('admin_beneficiaries').then(({ data, error }) => (error ? setErr(error.message) : setRows(data || []))); }, []);

  const countries = useMemo(() => [...new Set((rows || []).map(r => (r.country || '').trim()).filter(Boolean))].sort(), [rows]);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (rows || []).filter(r =>
      (country === 'all' || (r.country || '').trim() === country) &&
      (!s || `${fullName(r)} ${r.username} ${r.region || ''} ${r.district || ''} ${r.phone || ''} ${r.headline || ''}`.toLowerCase().includes(s)));
  }, [rows, q, country]);

  const exportCsv = () => {
    const head = ['Name', 'Username', 'Country', 'Region', 'District', 'Phone', 'Interest', 'Joined', 'Beneficiary since'];
    const lines = [head.map(csvCell).join(',')].concat(shown.map(r => [fullName(r), r.username, r.country, r.region, r.district, r.phone, r.interest,
      r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : '', r.badge_since ? new Date(r.badge_since).toISOString().slice(0, 10) : ''].map(csvCell).join(',')));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = 'terraviva-beneficiaries.csv'; a.click();
  };

  if (err) return <div className="err">{err}</div>;
  if (!rows) return <p className="muted">{L('Loading…', 'Inapakia…')}</p>;

  return (
    <div>
      <p className="muted">
        {L('Members who hold the Beneficiary badge. The badge itself is granted in the Badges tab.', 'Wanachama wenye beji ya Beneficiary (Mnufaika). Beji yenyewe inatolewa kwenye tab ya Badges.')}
        {onOpenBadges && <> <button className="link" style={{ padding: 0 }} onClick={onOpenBadges}>{L('Open Badges', 'Fungua Badges')} →</button></>}
      </p>
      <div className="stat-grid">
        <div className="stat"><b>{rows.length}</b><small className="muted">{L('Beneficiaries', 'Wanufaika')}</small></div>
        <div className="stat"><b>{countries.length}</b><small className="muted">{L('Countries', 'Nchi')}</small></div>
        <div className="stat"><b>{rows.filter(r => r.created_at && Date.now() - new Date(r.created_at).getTime() < 30 * 864e5).length}</b><small className="muted">{L('New members (30 days)', 'Wapya (siku 30)')}</small></div>
      </div>
      <div className="row">
        <input type="search" placeholder={L('Search name, username, region, phone…', 'Tafuta jina, username, mkoa, simu…')} value={q} onChange={e => setQ(e.target.value)} />
        <select value={country} onChange={e => setCountry(e.target.value)}>
          <option value="all">{L('All countries', 'Nchi zote')}</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <small className="muted">{L(`${shown.length} of ${rows.length} beneficiaries`, `Wanufaika ${shown.length} kati ya ${rows.length}`)}</small>{' '}
      {shown.length > 0 && <button className="link" onClick={exportCsv}>⬇ {L('Download CSV', 'Pakua CSV')}</button>}

      <div className="card" style={{ padding: '0 1rem', marginTop: '.6rem' }}>
        {!shown.length && <p className="muted">{rows.length ? L('No beneficiaries match your search.', 'Hakuna mnufaika anayelingana na utafutaji.') : L('No beneficiaries yet. Grant the Beneficiary badge from the Badges tab and they will appear here.', 'Bado hakuna wanufaika. Toa beji ya Beneficiary kwenye tab ya Badges nao wataonekana hapa.')}</p>}
        {shown.map(r => (
          <div key={r.id} style={{ display: 'flex', gap: '.7rem', alignItems: 'center', flexWrap: 'wrap', padding: '.7rem 0', borderBottom: '1px solid var(--bd)' }}>
            <Avatar p={r} size={44} />
            <div style={{ flex: '1 1 240px', minWidth: 0 }}>
              <Link href={`/profile/${r.username}`}><b>{fullName(r)}</b></Link><Badges p={r} />
              <div><small className="muted">@{r.username}{r.headline ? ' · ' + r.headline : ''}</small></div>
              <div><small className="muted">📍 {[r.district, r.region, r.country].filter(Boolean).join(', ') || '—'}{r.phone ? ' · 📞 ' + r.phone : ''}</small></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {r.status !== 'active' && <div><span className="badge" style={{ marginLeft: 0, background: '#fdecea', color: 'var(--red)' }}>{r.status}</span></div>}
              <small className="muted">{L('Joined', 'Alijiunga')} {timeAgo(r.created_at)}</small>
              {r.badge_since && <div><small className="muted">{L('Beneficiary since', 'Mnufaika tangu')} {new Date(r.badge_since).toLocaleDateString()}</small></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
