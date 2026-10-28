'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import MediaGallery from '@/components/MediaGallery';
import { supabase, uploadFile, checkFile, timeAgo } from '@/lib/supabase';
import { useT } from '@/lib/i18n';

const KINDS = [['all', 'All'], ['job', 'Jobs'], ['volunteer', 'Volunteer'], ['grant', 'Grants'], ['training', 'Training'], ['fellowship', 'Fellowships']];
const EMPTY = { title: '', organization: '', kind: 'job', location: '', description: '', apply_url: '', deadline: '' };
const isEmail = (s) => /^\S+@\S+\.\S+$/.test((s || '').trim());
const isClosed = (o) => o.deadline && new Date(o.deadline + 'T23:59:59') < new Date();

function ApplyForm({ o, me, onClose }) {
  const { lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const [f, setF] = useState({ full_name: `${me.first_name || ''} ${me.last_name || ''}`.trim(), email: '', phone: me.phone || '', message: '' });
  const [cv, setCv] = useState(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [done, setDone] = useState(null);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (data?.user?.email) setF(x => ({ ...x, email: x.email || data.user.email })); }); }, []);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (f.message.trim().length < 10) return setErr(L('Please write a short message (at least 10 characters).', 'Tafadhali andika ujumbe mfupi (angalau herufi 10).'));
    setBusy(true);
    try {
      let cv_url = null;
      if (cv) { const bad = checkFile(cv); if (bad) throw new Error(bad); cv_url = await uploadFile('applications', me.id, cv); }
      const { data, error } = await supabase.from('applications').insert({ opportunity_id: o.id, applicant_id: me.id, full_name: f.full_name.trim(), email: f.email.trim(), phone: f.phone.trim() || null, message: f.message.trim(), cv_url }).select('id').single();
      if (error) throw new Error(error.code === '23505' ? L('You have already applied for this opportunity.', 'Tayari umeshatuma maombi ya fursa hii.') : error.message);
      let sent = false;
      if (isEmail(o.apply_url)) {
        const { data: { session } } = await supabase.auth.getSession();
        try {
          const res = await fetch('/api/apply-email', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ applicationId: data.id }) });
          sent = !!(await res.json()).sent;
        } catch (x) { sent = false; }
      }
      setDone(sent ? 'sent' : 'saved');
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  if (done) return (<div className="ok" style={{ marginTop: '.6rem' }}>
    {done === 'sent' ? L('✓ Your application was sent to the organization by email.', '✓ Maombi yako yametumwa kwa shirika kupitia barua pepe.') : L('✓ Your application was submitted and is visible to the organization inside Terraviva Connect.', '✓ Maombi yako yametumwa na shirika litayaona ndani ya Terraviva Connect.')}
    <div><button type="button" className="link" onClick={onClose}>{L('Close', 'Funga')}</button></div></div>);
  return (<form onSubmit={submit} style={{ marginTop: '.7rem', borderTop: '1px solid var(--bd)', paddingTop: '.7rem' }}>
    <h4>{L('Apply for', 'Omba nafasi ya')}: {o.title}</h4>
    {err && <div className="err">{err}</div>}
    <div className="row"><input placeholder={L('Full name', 'Jina kamili')} value={f.full_name} onChange={set('full_name')} required minLength={2} /><input type="email" placeholder={L('Your email', 'Barua pepe yako')} value={f.email} onChange={set('email')} required /></div>
    <input placeholder={L('Phone (optional)', 'Simu (si lazima)')} value={f.phone} onChange={set('phone')} />
    <textarea rows={6} placeholder={L('Why are you a good fit? Introduce yourself and your experience.', 'Kwa nini unafaa? Jitambulishe na eleza uzoefu wako.')} value={f.message} onChange={set('message')} maxLength={5000} required />
    <label>{L('CV or supporting document (PDF/Word, optional)', 'CV au nyaraka nyingine (PDF/Word, si lazima)')}<input type="file" accept=".pdf,.doc,.docx,image/*" onChange={e => setCv(e.target.files[0])} /></label>
    <button disabled={busy}>{busy ? L('Sending…', 'Inatuma…') : L('Send application', 'Tuma maombi')}</button> <button type="button" className="sec" onClick={onClose}>{L('Cancel', 'Ghairi')}</button>
  </form>);
}

function Applications({ o }) {
  const { lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const [list, setList] = useState(null);
  const load = async () => { const { data } = await supabase.from('applications').select('*').eq('opportunity_id', o.id).order('created_at', { ascending: false }); setList(data || []); };
  useEffect(() => { load(); }, []);
  const setStatus = async (a, status) => { await supabase.from('applications').update({ status }).eq('id', a.id); load(); };
  if (!list) return <p className="muted">…</p>;
  return (<div style={{ marginTop: '.6rem' }}>
    {!list.length && <p className="muted">{L('No applications yet.', 'Hakuna maombi bado.')}</p>}
    {list.map(a => (<div className="card" key={a.id} style={{ background: 'var(--bg)' }}>
      <b>{a.full_name}</b> <small className="muted">· {timeAgo(a.created_at)}</small><br />
      <small><a href={`mailto:${a.email}`}>{a.email}</a>{a.phone ? ' · ' + a.phone : ''}</small>
      <p>{a.message}</p>
      {a.cv_url && <MediaGallery compact media={[{ id: a.id, url: a.cv_url, kind: /\.(png|jpe?g|webp|gif)$/i.test(a.cv_url) ? 'image' : 'document', name: 'CV' }]} />}
      <select value={a.status} onChange={e => setStatus(a, e.target.value)} style={{ marginTop: '.5rem' }}>
        <option value="new">{L('New', 'Mpya')}</option><option value="seen">{L('Seen', 'Imeonekana')}</option><option value="shortlisted">{L('Shortlisted', 'Imechaguliwa')}</option><option value="declined">{L('Declined', 'Imekataliwa')}</option></select>
    </div>))}
  </div>);
}

function Inner({ me }) {
  const { t, lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const [list, setList] = useState([]); const [k, setK] = useState('all'); const [show, setShow] = useState(false); const [err, setErr] = useState('');
  const [f, setF] = useState(EMPTY); const [editId, setEditId] = useState(null); const [applyFor, setApplyFor] = useState(null); const [appsFor, setAppsFor] = useState(null);
  const load = async () => { let q = supabase.from('opportunities').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(50); if (k !== 'all') q = q.eq('kind', k); const { data } = await q; setList(data || []); };
  useEffect(() => { load(); }, [k]);
  const set = key => e => setF({ ...f, [key]: e.target.value });
  const startEdit = (o) => { setEditId(o.id); setF({ title: o.title || '', organization: o.organization || '', kind: o.kind, location: o.location || '', description: o.description || '', apply_url: o.apply_url || '', deadline: o.deadline || '' }); setShow(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const close = () => { setShow(false); setEditId(null); setF(EMPTY); setErr(''); };
  const save = async (e) => {
    e.preventDefault(); setErr('');
    const row = { ...f, deadline: f.deadline || null, apply_url: f.apply_url.trim() };
    const { error } = editId ? await supabase.from('opportunities').update(row).eq('id', editId) : await supabase.from('opportunities').insert({ ...row, poster_id: me.id });
    if (error) return setErr(error.message); close(); load();
  };
  const del = async (id) => { if (confirm(t("Remove this opportunity?"))) { await supabase.from('opportunities').delete().eq('id', id); load(); } };
  return (<div><div style={{ display: 'flex', justifyContent: 'space-between' }}><h2>{t("Opportunities")}</h2><button onClick={() => (show ? close() : setShow(true))}>{show ? t("Close") : t("+ Post opportunity")}</button></div>
    {show && <form className="card" onSubmit={save}>{err && <div className="err">{err}</div>}
      <input placeholder={t("Title")} value={f.title} onChange={set('title')} required /><div className="row"><input placeholder={t("Organization")} value={f.organization} onChange={set('organization')} />
        <select value={f.kind} onChange={set('kind')}>{KINDS.slice(1).map(([v, l]) => <option key={v} value={v}>{t(l)}</option>)}</select></div>
      <div className="row"><input placeholder={t("Location")} value={f.location} onChange={set('location')} /><input type="date" value={f.deadline} onChange={set('deadline')} /></div>
      <textarea rows={5} placeholder={t("Description")} value={f.description} onChange={set('description')} />
      <input placeholder={L('Email to receive applications (or a link to an external application page)', 'Barua pepe ya kupokea maombi (au kiungo cha ukurasa wa nje wa maombi)')} value={f.apply_url} onChange={set('apply_url')} />
      <button>{editId ? t("Save changes") : t("Publish")}</button>{editId && <> <button type="button" className="sec" onClick={close}>{t("Cancel")}</button></>}</form>}
    <div className="tabs">{KINDS.map(([v, l]) => <button key={v} className={k === v ? 'on' : ''} onClick={() => setK(v)}>{t(l)}</button>)}</div>
    {!list.length && <div className="card muted">{t("No opportunities yet.")}</div>}
    {list.map(o => { const mine = o.poster_id === me.id; const closed = isClosed(o); return (<div className="card" key={o.id}><h3>{o.title}</h3><div className="muted">{o.organization} {o.location && '· ' + o.location}</div>
      <span className="badge b-pro" style={{ marginLeft: 0 }}>{o.kind}</span> {closed && <span className="badge b-org">{L('Closed', 'Imefungwa')}</span>} {o.deadline && <small className="muted">{L('Deadline', 'Mwisho')}: {o.deadline}</small>}
      <p className="post-body">{o.description}</p>
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        {!mine && !closed && o.apply_url && (isEmail(o.apply_url)
          ? <button onClick={() => setApplyFor(applyFor === o.id ? null : o.id)}>{t("Apply")}</button>
          : <a className="btn" href={o.apply_url} target="_blank" rel="noreferrer">{t("Apply")}</a>)}
        {mine && <button className="sec" onClick={() => setAppsFor(appsFor === o.id ? null : o.id)}>{L('Applications', 'Maombi yaliyotumwa')}</button>}
        {mine && <button className="link" onClick={() => startEdit(o)}>✏️ {L('Edit', 'Hariri')}</button>}
        {(mine || me.role !== 'member') && <button className="link" onClick={() => del(o.id)}>{t("Remove")}</button>}</div>
      {applyFor === o.id && <ApplyForm o={o} me={me} onClose={() => setApplyFor(null)} />}
      {appsFor === o.id && <Applications o={o} />}</div>); })}</div>);
}
export default function Opportunities() { return <Shell>{me => <Inner me={me} />}</Shell>; }
