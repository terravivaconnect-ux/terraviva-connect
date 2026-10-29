'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import MediaGallery from '@/components/MediaGallery';
import { supabase, uploadFile, fullName } from '@/lib/supabase';
import { useT } from '@/lib/i18n';

const CATS = ['General', 'Sustainable Agriculture', 'Youth and Women Empowerment', 'Environmental Conservation', 'Reproductive Health Education', 'Climate Change', 'Training Materials', 'Research and Reports'];
const kindOf = (f) => f.type.startsWith('image') ? 'image' : f.type.startsWith('video') ? 'video' : 'document';
const BLANK = { title: '', description: '', category: CATS[0], link: '' };

function Inner({ me }) {
  const { t, lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const [list, setList] = useState([]); const [q, setQ] = useState(''); const [cat, setCat] = useState('all'); const [show, setShow] = useState(false);
  const [f, setF] = useState(BLANK); const [file, setFile] = useState(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const [open, setOpen] = useState({}); const [editId, setEditId] = useState(null); const [editKind, setEditKind] = useState(null);
  const load = async () => {
    const { data } = await supabase.from('resources').select('*, uploader:profiles!resources_uploader_id_fkey(first_name,last_name,username)').eq('is_published', true).order('created_at', { ascending: false }).limit(100);
    setList(data || []);
  };
  useEffect(() => { load(); }, []);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const close = () => { setShow(false); setEditId(null); setEditKind(null); setF(BLANK); setFile(null); setErr(''); };
  const startEdit = (r) => { setEditId(r.id); setEditKind(r.kind); setF({ title: r.title || '', description: r.description || '', category: r.category, link: r.kind === 'link' ? r.url : '' }); setShow(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const save = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      if (editId) {
        const patch = { title: f.title.trim(), description: f.description || null, category: f.category };
        if (editKind === 'link') patch.url = f.link.trim();
        const { error } = await supabase.from('resources').update(patch).eq('id', editId); if (error) throw error;
      } else {
        let url = f.link.trim(), kind = 'link', file_name = null;
        if (file) { url = await uploadFile('resources', me.id, file); kind = kindOf(file); file_name = file.name; }
        if (!url) throw new Error('Attach a file or paste a link.');
        const { error } = await supabase.from('resources').insert({ uploader_id: me.id, title: f.title.trim(), description: f.description || null, category: f.category, kind, url, file_name });
        if (error) throw error;
      }
      close(); load();
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  const del = async (id) => { if (confirm(t("Delete this resource?"))) { await supabase.from('resources').delete().eq('id', id); load(); } };
  const shown = list.filter(r => (cat === 'all' || r.category === cat) && (!q || (r.title + ' ' + (r.description || '')).toLowerCase().includes(q.toLowerCase())));
  return (<div>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}><h2>{t("Resource Library")}</h2><button onClick={() => (show ? close() : setShow(true))}>{show ? t("Close") : t("+ Add resource")}</button></div>
    {show && <form className="card" onSubmit={save}>{err && <div className="err">{err}</div>}
      <input placeholder={t("Title")} value={f.title} onChange={set('title')} required /><textarea rows={4} placeholder={t("Description")} value={f.description} onChange={set('description')} />
      <select value={f.category} onChange={set('category')}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
      {!editId && <input type="file" accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" onChange={e => setFile(e.target.files[0])} />}
      {(!editId || editKind === 'link') && <input placeholder={t("…or paste a link (website, YouTube, Drive)")} value={f.link} onChange={set('link')} />}
      {editId && editKind !== 'link' && <p className="muted">{L('To replace the file, delete this resource and add it again.', 'Kubadilisha faili, futa rasilimali hii kisha uiongeze tena.')}</p>}
      <button disabled={busy}>{busy ? t("Uploading…") : editId ? t("Save changes") : t("Publish")}</button>{editId && <> <button type="button" className="sec" onClick={close}>{t("Cancel")}</button></>}</form>}
    <div className="row"><input placeholder={t("Search resources…")} value={q} onChange={e => setQ(e.target.value)} />
      <select value={cat} onChange={e => setCat(e.target.value)}><option value="all">{t("All categories")}</option>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
    {!shown.length && <div className="card muted">{t("No resources found.")}</div>}
    <div className="grid">{shown.map(r => (<div className="card" key={r.id} style={open[r.id] ? { gridColumn: '1 / -1' } : {}}>
      <span className="badge b-pro" style={{ marginLeft: 0 }}>{r.category}</span><h3 style={{ marginTop: '.4rem' }}>{r.title}</h3>
      <p className="muted">{r.description}</p><small className="muted">By {fullName(r.uploader)}</small>
      <div style={{ marginTop: '.5rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        {r.kind === 'link' ? <a className="btn" href={r.url} target="_blank" rel="noreferrer">{t("Open link")}</a>
          : <button onClick={() => setOpen({ ...open, [r.id]: !open[r.id] })}>{open[r.id] ? t("Close preview") : t("View")}</button>}
        {r.uploader_id === me.id && <button className="link" onClick={() => startEdit(r)}>✏️ {L('Edit', 'Hariri')}</button>}
        {(r.uploader_id === me.id || me.role !== 'member') && <button className="link" onClick={() => del(r.id)}>{t("🗑 Delete")}</button>}</div>
      {open[r.id] && r.kind !== 'link' && <MediaGallery media={[{ id: r.id, url: r.url, kind: r.kind, name: r.file_name || r.title }]} />}</div>))}</div>
  </div>);
}
export default function Resources() { return <Shell>{me => <Inner me={me} />}</Shell>; }
