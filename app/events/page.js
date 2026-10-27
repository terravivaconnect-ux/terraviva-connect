'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';
import { useT } from '@/lib/i18n';
function Inner({ me }) {
  const { t } = useT();
  const [list, setList] = useState([]); const [rsvp, setRsvp] = useState([]); const [show, setShow] = useState(false); const [err, setErr] = useState('');
  const [f, setF] = useState({ title: '', description: '', location: '', link: '', starts_at: '' });
  const load = async () => {
    const { data } = await supabase.from('events').select('*, host:profiles!events_host_id_fkey(first_name,last_name,username)').gte('starts_at', new Date(Date.now() - 864e5).toISOString()).order('starts_at').limit(50); setList(data || []);
    const { data: r } = await supabase.from('event_rsvps').select('event_id,user_id'); setRsvp(r || []);
  };
  useEffect(() => { load(); }, []);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const create = async (e) => { e.preventDefault(); setErr('');
    const { error } = await supabase.from('events').insert({ ...f, host_id: me.id, starts_at: new Date(f.starts_at).toISOString() });
    if (error) return setErr(error.message); setShow(false); setF({ title: '', description: '', location: '', link: '', starts_at: '' }); load(); };
  const toggle = async (id, going) => { going ? await supabase.from('event_rsvps').delete().match({ event_id: id, user_id: me.id }) : await supabase.from('event_rsvps').insert({ event_id: id, user_id: me.id }); load(); };
  const del = async (id) => { if (confirm(t("Delete event?"))) { await supabase.from('events').delete().eq('id', id); load(); } };
  return (<div><div style={{ display: 'flex', justifyContent: 'space-between' }}><h2>{t("Events")}</h2><button onClick={() => setShow(!show)}>{show ? t("Close") : t("+ Create event")}</button></div>
    {show && <form className="card" onSubmit={create}>{err && <div className="err">{err}</div>}
      <input placeholder={t("Event title")} value={f.title} onChange={set('title')} required /><textarea rows={3} placeholder={t("Description")} value={f.description} onChange={set('description')} />
      <div className="row"><input placeholder={t("Location (or Online)")} value={f.location} onChange={set('location')} /><input type="datetime-local" value={f.starts_at} onChange={set('starts_at')} required /></div>
      <input placeholder={t("Meeting / registration link (optional)")} value={f.link} onChange={set('link')} /><button>{t("Publish event")}</button></form>}
    {!list.length && <div className="card muted">{t("No upcoming events.")}</div>}
    {list.map(ev => { const going = rsvp.some(r => r.event_id === ev.id && r.user_id === me.id); const n = rsvp.filter(r => r.event_id === ev.id).length;
      return (<div className="card" key={ev.id}><h3>{ev.title}</h3>
        <div className="muted">📅 {new Date(ev.starts_at).toLocaleString()} {ev.location && '· 📍 ' + ev.location}</div>
        <p className="post-body">{ev.description}</p><small className="muted">Hosted by {ev.host?.first_name} {ev.host?.last_name} · {n} going</small>
        <div style={{ marginTop: '.6rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          <button className={going ? 'sec' : ''} onClick={() => toggle(ev.id, going)}>{going ? t("✓ Going") : t("I will attend")}</button>
          {ev.link && <a className="btn sec" href={ev.link} target="_blank" rel="noreferrer">{t("Open link")}</a>}
          {ev.host_id === me.id && <button className="link" onClick={() => del(ev.id)}>{t("🗑 Delete")}</button>}</div></div>); })}</div>);
}
export default function Events() { return <Shell>{me => <Inner me={me} />}</Shell>; }
