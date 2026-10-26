'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';
const KINDS = [['all', 'All'], ['job', 'Jobs'], ['volunteer', 'Volunteer'], ['grant', 'Grants'], ['training', 'Training'], ['fellowship', 'Fellowships']];
function Inner({ me }) {
  const [list, setList] = useState([]); const [k, setK] = useState('all'); const [show, setShow] = useState(false); const [err, setErr] = useState('');
  const [f, setF] = useState({ title: '', organization: '', kind: 'job', location: '', description: '', apply_url: '', deadline: '' });
  const load = async () => { let q = supabase.from('opportunities').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(50); if (k !== 'all') q = q.eq('kind', k); const { data } = await q; setList(data || []); };
  useEffect(() => { load(); }, [k]);
  const set = key => e => setF({ ...f, [key]: e.target.value });
  const create = async (e) => { e.preventDefault(); setErr(''); const row = { ...f, poster_id: me.id, deadline: f.deadline || null };
    const { error } = await supabase.from('opportunities').insert(row); if (error) return setErr(error.message); setShow(false); load(); };
  const del = async (id) => { if (confirm('Remove this opportunity?')) { await supabase.from('opportunities').delete().eq('id', id); load(); } };
  return (<div><div style={{ display: 'flex', justifyContent: 'space-between' }}><h2>Opportunities</h2><button onClick={() => setShow(!show)}>{show ? 'Close' : '+ Post opportunity'}</button></div>
    {show && <form className="card" onSubmit={create}>{err && <div className="err">{err}</div>}
      <input placeholder="Title" value={f.title} onChange={set('title')} required /><div className="row"><input placeholder="Organization" value={f.organization} onChange={set('organization')} />
        <select value={f.kind} onChange={set('kind')}>{KINDS.slice(1).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <div className="row"><input placeholder="Location" value={f.location} onChange={set('location')} /><input type="date" value={f.deadline} onChange={set('deadline')} /></div>
      <textarea rows={4} placeholder="Description" value={f.description} onChange={set('description')} /><input placeholder="Apply link or email" value={f.apply_url} onChange={set('apply_url')} /><button>Publish</button></form>}
    <div className="tabs">{KINDS.map(([v, l]) => <button key={v} className={k === v ? 'on' : ''} onClick={() => setK(v)}>{l}</button>)}</div>
    {!list.length && <div className="card muted">No opportunities yet.</div>}
    {list.map(o => (<div className="card" key={o.id}><h3>{o.title}</h3><div className="muted">{o.organization} {o.location && '· ' + o.location}</div>
      <span className="badge b-pro" style={{ marginLeft: 0 }}>{o.kind}</span> {o.deadline && <small className="muted">Deadline: {o.deadline}</small>}
      <p className="post-body">{o.description}</p>
      <div style={{ display: 'flex', gap: '.5rem' }}>{o.apply_url && <a className="btn" href={/^https?:/.test(o.apply_url) ? o.apply_url : 'mailto:' + o.apply_url} target="_blank" rel="noreferrer">Apply</a>}
        {o.poster_id === me.id && <button className="link" onClick={() => del(o.id)}>🗑 Remove</button>}</div></div>))}</div>);
}
export default function Opportunities() { return <Shell>{me => <Inner me={me} />}</Shell>; }
