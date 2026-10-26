'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import Badges from '@/components/Badges';
import { supabase, uploadFile, fullName, timeAgo } from '@/lib/supabase';
import { useT } from '@/lib/i18n';

function Project({ p, me, reload }) {
  const { t } = useT();
  const [open, setOpen] = useState(false); const [ups, setUps] = useState([]); const [txt, setTxt] = useState(''); const [prog, setProg] = useState(p.progress);
  const own = p.owner_id === me.id;
  const loadUps = async () => { const { data } = await supabase.from('project_updates').select('*').eq('project_id', p.id).order('created_at', { ascending: false }); setUps(data || []); };
  const toggle = () => { if (!open) loadUps(); setOpen(!open); };
  const post = async (e) => { e.preventDefault(); if (!txt.trim()) return;
    await supabase.from('project_updates').insert({ project_id: p.id, author_id: me.id, body: txt.trim() });
    await supabase.from('projects').update({ progress: +prog }).eq('id', p.id); setTxt(''); loadUps(); reload(); };
  const status = async (s) => { await supabase.from('projects').update({ status: s }).eq('id', p.id); reload(); };
  const del = async () => { if (confirm('Delete this project?')) { await supabase.from('projects').delete().eq('id', p.id); reload(); } };
  return (<div className="card" style={{ padding: 0, overflow: 'hidden' }}>
    {p.cover_url && <img src={p.cover_url} alt="" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} />}
    <div style={{ padding: '1rem' }}>
      <span className="badge b-ben" style={{ marginLeft: 0 }}>{p.status}</span> {p.location && <small className="muted">📍 {p.location}</small>}
      <h3 style={{ marginTop: '.4rem' }}>{p.title}</h3>
      <div>by <Link href={`/profile/${p.owner?.username}`}><b>{fullName(p.owner)}</b></Link> <Badges p={p.owner} /></div>
      <p className="post-body">{p.summary}</p>
      <div className="progress"><div style={{ width: p.progress + '%' }} /></div><small className="muted">{p.progress}% complete</small>
      <div style={{ marginTop: '.5rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        <button className="sec" onClick={toggle}>{open ? 'Hide updates' : 'Progress updates'}</button>
        {own && p.status !== 'completed' && <button className="link" onClick={() => status('completed')}>✓ Mark completed</button>}
        {(own || me.role !== 'member') && <button className="link" onClick={del}>{t("🗑 Delete")}</button>}</div>
      {open && <div style={{ marginTop: '.7rem' }}>
        {own && <form onSubmit={post}><textarea rows={2} placeholder="Share a progress update…" value={txt} onChange={e => setTxt(e.target.value)} />
          <label>Progress: {prog}%<input type="range" min="0" max="100" value={prog} onChange={e => setProg(e.target.value)} /></label><button>Post update</button></form>}
        {!ups.length && <p className="muted">No updates yet.</p>}
        {ups.map(u => <div className="item" key={u.id}><div>{u.body}<br /><small className="muted">{timeAgo(u.created_at)}</small></div></div>)}</div>}
    </div></div>);
}

function Inner({ me }) {
  const { t } = useT();
  const [list, setList] = useState([]); const [show, setShow] = useState(false); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [cover, setCover] = useState(null);
  const [f, setF] = useState({ title: '', summary: '', location: '', status: 'active' });
  const can = ['organization', 'donor'].includes(me.account_type) || me.role !== 'member';
  const load = async () => { const { data } = await supabase.from('projects').select('*, owner:profiles!projects_owner_id_fkey(username,first_name,last_name,is_beneficiary_verified,is_professional_verified,is_org_verified)').order('created_at', { ascending: false }).limit(50); setList(data || []); };
  useEffect(() => { load(); }, []);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const create = async (e) => { e.preventDefault(); setErr(''); setBusy(true);
    try { const cover_url = cover ? await uploadFile('projects', me.id, cover) : null;
      const { error } = await supabase.from('projects').insert({ ...f, owner_id: me.id, cover_url }); if (error) throw error;
      setF({ title: '', summary: '', location: '', status: 'active' }); setCover(null); setShow(false); load();
    } catch (x) { setErr(x.message); } finally { setBusy(false); } };
  return (<div>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}><h2>{t("Projects")}</h2>{can && <button onClick={() => setShow(!show)}>{show ? 'Close' : '+ New project'}</button>}</div>
    {!can && <p className="muted">Organization and donor accounts can publish projects. Everyone can follow progress here.</p>}
    {show && <form className="card" onSubmit={create}>{err && <div className="err">{err}</div>}
      <input placeholder="Project title" value={f.title} onChange={set('title')} required /><textarea rows={4} placeholder="Summary: goals, activities, who benefits" value={f.summary} onChange={set('summary')} />
      <div className="row"><input placeholder="Location" value={f.location} onChange={set('location')} /><select value={f.status} onChange={set('status')}><option value="planning">Planning</option><option value="active">Active</option><option value="completed">Completed</option></select></div>
      <label>Cover photo<input type="file" accept="image/*" onChange={e => setCover(e.target.files[0])} /></label><button disabled={busy}>{busy ? 'Publishing…' : 'Publish project'}</button></form>}
    {!list.length && <div className="card muted">No projects yet.</div>}
    {list.map(p => <Project key={p.id} p={p} me={me} reload={load} />)}</div>);
}
export default function Projects() { return <Shell>{me => <Inner me={me} />}</Shell>; }
