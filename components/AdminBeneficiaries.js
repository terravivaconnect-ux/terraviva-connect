'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useT } from '@/lib/i18n';

// Reads lines like:  jane@mail.com Jane Doe  |  jane@mail.com, Jane Doe  |  Jane Doe <jane@mail.com>
const parse = (text) => {
  const seen = new Set(); const out = [];
  text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).forEach(l => {
    const m = l.match(/[^\s,;<>()"']+@[^\s,;<>()"']+\.[^\s,;<>()"']+/);
    if (!m) return;
    const email = m[0].toLowerCase(); if (seen.has(email)) return; seen.add(email);
    const name = l.replace(m[0], ' ').replace(/[,;<>()"'\t]+/g, ' ').replace(/\s+/g, ' ').trim();
    out.push({ email, full_name: name || null });
  });
  return out;
};

export default function AdminBeneficiaries() {
  const { t, lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const [txt, setTxt] = useState(''); const [rows, setRows] = useState([]); const [msg, setMsg] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const load = async () => {
    const { data, error } = await supabase.rpc('beneficiary_status');
    if (error) setErr(error.message); else setRows(data || []);
  };
  useEffect(() => { load(); }, []);

  const importRows = async () => {
    setErr(''); setMsg(''); setBusy(true);
    try {
      const parsed = parse(txt);
      if (!parsed.length) throw new Error(L('No valid email found. Example: jane@mail.com Jane Doe', 'Hakuna barua pepe sahihi. Mfano: jane@mail.com Jane Doe'));
      const { data, error } = await supabase.rpc('import_beneficiaries', { rows: parsed });
      if (error) throw error;
      const waiting = data.waiting || [];
      setMsg(L(`${data.verified} member(s) received the Beneficiary badge now. ${data.added} new email(s) added to the list.`, `Wanachama ${data.verified} wamepewa beji ya Mnufaika sasa. Barua pepe mpya ${data.added} zimeongezwa kwenye orodha.`)
        + (waiting.length ? ' ' + L(`Not registered yet (they will get the badge automatically after they sign up and confirm their email): ${waiting.join(', ')}`, `Bado hawajajisajili (watapewa beji kiotomatiki wakijisajili na kuthibitisha barua pepe): ${waiting.join(', ')}`) : ''));
      setTxt(''); load();
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };

  return (<div>
    <div className="card"><h3>{t("Beneficiary registry")} ({rows.length})</h3>
      <p className="muted">{L('Type one beneficiary per line: email and name. Members with that confirmed email receive the 🌱 Beneficiary badge immediately and are notified.', 'Andika mnufaika mmoja kwa kila mstari: barua pepe na jina. Wanachama wenye barua pepe hiyo iliyothibitishwa hupewa beji ya 🌱 Mnufaika papo hapo na kujulishwa.')}</p>
      {err && <div className="err">{err}</div>}{msg && <div className="ok">{msg}</div>}
      <textarea rows={6} placeholder={'jane@example.com Jane Doe\njohn@example.com John Doe'} value={txt} onChange={e => setTxt(e.target.value)} />
      <button disabled={busy || !txt.trim()} onClick={importRows}>{busy ? t("Importing…") : t("Import and verify")}</button></div>
    {rows.map(r => (<div className="card item" key={r.reg_id}>
      <div><b>{r.reg_name || '—'}</b><br /><small className="muted">{r.reg_email}{r.reg_username ? ' · @' + r.reg_username : ''}</small></div>
      <div>{r.reg_verified ? <span className="tbadge ben"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#fff" opacity=".25" /><path d="M7 12.5l3.2 3.2L17 8.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>{L('Badge given', 'Amepewa beji')}</span>
        : <span className="badge b-org">{r.reg_member ? L('Member, not verified', 'Mwanachama, hajathibitishwa') : L('Waiting to sign up', 'Anasubiri kujisajili')}</span>}</div>
    </div>))}
  </div>);
}
