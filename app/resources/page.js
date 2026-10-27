'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import MediaGallery from '@/components/MediaGallery';
import { supabase, uploadFile, fullName } from '@/lib/supabase';
import { useT } from '@/lib/i18n';

const CATS = ['General', 'Sustainable Agriculture', 'Youth and Women Empowerment', 'Environmental Conservation', 'Reproductive Health Education', 'Climate Change', 'Training Materials', 'Research and Reports'];
const kindOf = (f) => f.type.startsWith('image') ? 'image' : f.type.startsWith('video') ? 'video' : 'document';

function Inner({ me }) {
  const { t } = useT();
  const [list, setList] = useState([]); const [q, setQ] = useState(''); const [cat, setCat] = useState('all'); const [show, setShow] = useState(false);
  const [f, setF] = useState({ title: '', description: '', category: CATS[0], link: '' }); const [file, setFile] = useState(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const [open, setOpen] = useState({});
  const load = async () => {
    const { data } = await supabase.from('resources').select('*, uploader:profiles!resources_uploader_id_fkey(first_name,last_name,username)').eq('is_published', true).order('created_at', { ascending: false }).limit(100);
    setList(data || []);
  };
  useEffect(() => { load(); }, []);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const add = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      let url = f.link.trim(), kind = 'link', file_name = null;
      if (file) { url = await uploadFile('resources', me.id, file); kind = kindOf(file); file_name = file.name; }
      if (!url) throw new Error('Attach a file or paste a link.');
      const { error } = await supabase.from('resources').insert({ uploader_id: me.id, title: f.title.trim(), description: f.description || null, category: f.category, kind, url, file_name });
      if (error) throw error;
      setF({ title: '', description: '', category: CATS[0], link: '' }); setFile(null); setShow(false); load();
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  const del = async (id) => { if (confirm(t("Delete this resource?"))) { await supabase.from('resources').delete().eq('id', id); load(); } };
  const shown = list.filter(r => (cat === 'all' || r.category === cat) && (!q || (r.title + ' ' + (r.description || '')).toLowerCase().includes(q.toLowerCase())));
  return (<div>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}><h2>{t("Resource Library")}</h2><button onClick={() => setShow(!show)}>{show ? t("Close") : t("+ Add resource")}</button></div>
    {show && <form className="card" onSubmit={add}>{err && <div className="err">{err}</div>}
      <input placeholder={t("Title")} value={f.title} onChange={set('title')} required /><textarea rows={3} placeholder={t("Description")} value={f.description} onChange={set('description')} />
      <select value={f.category} onChange={set('category')}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
      <input type="file" accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" onChange={e => setFile(e.target.files[0])} />
      <input placeholder={t("…or paste a link (website, YouTube, Drive)")} value={f.link} onChange={set('link')} /><button disabled={busy}>{busy ? t("Uploading…") : t("Publish")}</button></form>}
    <div className="row"><input placeholder={t("Search resources…")} value={q} onChange={e => setQ(e.target.value)} />
      <select value={cat} onChange={e => setCat(e.target.value)}><option value="all">{t("All categories")}</option>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
    {!shown.length && <div className="card muted">{t("No resources found.")}</div>}
    <div className="grid">{shown.map(r => (<div className="card" key={r.id} style={open[r.id] ? { gridColumn: '1 / -1' } : {}}>
      <span className="badge b-pro" style={{ marginLeft: 0 }}>{r.category}</span><h3 style={{ marginTop: '.4rem' }}>{r.title}</h3>
      <p className="muted">{r.description}</p><small className="muted">By {fullName(r.uploader)}</small>
      <div style={{ marginTop: '.5rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        {r.kind === 'link' ? <a className="btn" href={r.url} target="_blank" rel="noreferrer">{t("Open link")}</a>
          : <button onClick={() => setOpen({ ...open, [r.id]: !open[r.id] })}>{open[r.id] ? t("Close preview") : t("View")}</button>}
        {(r.uploader_id === me.id || me.role !== 'member') && <button className="link" onClick={() => del(r.id)}>{t("🗑 Delete")}</button>}</div>
      {open[r.id] && r.kind !== 'link' && <MediaGallery media={[{ id: r.id, url: r.url, kind: r.kind, name: r.file_name || r.title }]} />}</div>))}</div>
  </div>);
}
export default function Resources() { return <Shell>{me => <Inner me={me} />}</Shell>; }
