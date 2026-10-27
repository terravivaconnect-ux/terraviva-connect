'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
export default function AdminBeneficiaries() {
  const [txt, setTxt] = useState(''); const [rows, setRows] = useState([]); const [total, setTotal] = useState(0); const [msg, setMsg] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const load = async () => {
    const { data, count } = await supabase.from('beneficiary_registry').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(15);
    setRows(data || []); setTotal(count || 0);
  };
  useEffect(() => { load(); }, []);
  const importRows = async () => {
    setErr(''); setMsg(''); setBusy(true);
    try {
      const parsed = txt.split('\n').map(l => l.trim()).filter(Boolean).map(l => { const [email, ...n] = l.split(','); return { email: email.trim().toLowerCase(), full_name: n.join(',').trim() || null }; }).filter(r => /^\S+@\S+\.\S+$/.test(r.email));
      if (!parsed.length) throw new Error('No valid emails found. Use one per line: email,full name');
      const { data: ex } = await supabase.from('beneficiary_registry').select('email'); const have = new Set((ex || []).map(x => (x.email || '').toLowerCase()));
      const fresh = parsed.filter((r, i) => !have.has(r.email) && parsed.findIndex(x => x.email === r.email) === i);
      if (fresh.length) { const { error } = await supabase.from('beneficiary_registry').insert(fresh); if (error) throw error; }
      const { data: n, error: e2 } = await supabase.rpc('sync_beneficiaries'); if (e2) throw e2;
      setMsg(`${fresh.length} new emails added. ${n} existing members received the Beneficiary badge.`); setTxt(''); load();
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  const sync = async () => { const { data, error } = await supabase.rpc('sync_beneficiaries'); error ? setErr(error.message) : setMsg(`${data} members verified.`); };
  return (<div>
    <div className="card"><h3>Beneficiary registry ({total})</h3>
      <p className="muted">Members whose <b>confirmed</b> email is on this list automatically get the 🌱 Beneficiary badge. Paste one per line: <code>email,full name</code>. This list is visible to administrators only.</p>
      {err && <div className="err">{err}</div>}{msg && <div className="ok">{msg}</div>}
      <textarea rows={6} placeholder={'jane@example.com,Jane Doe\njohn@example.com,John Doe'} value={txt} onChange={e => setTxt(e.target.value)} />
      <button disabled={busy} onClick={importRows}>{busy ? 'Importing…' : 'Import and verify'}</button> <button className="sec" onClick={sync}>Re-check existing members</button></div>
    {rows.map(r => <div className="card" key={r.id}>{r.email} <small className="muted">{r.full_name}</small></div>)}
  </div>);
}
