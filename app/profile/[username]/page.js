'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Shell from '@/components/Shell';
import Avatar from '@/components/Avatar';
import Badges from '@/components/Badges';
import PostCard from '@/components/PostCard';
import { POST_SELECT } from '@/components/Feed';
import { supabase, fullName } from '@/lib/supabase';
import { useT } from '@/lib/i18n';

const KINDS = [['experience', 'Experience'], ['education', 'Education'], ['certification', 'Certifications'], ['skill', 'Skills']];

function Inner({ me }) {
  const { t, lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const { username } = useParams(); const [p, setP] = useState(null); const [posts, setPosts] = useState([]); const [rel, setRel] = useState({}); const [nf, setNf] = useState(false);
  const [items, setItems] = useState([]); const [recs, setRecs] = useState([]); const [recTxt, setRecTxt] = useState(''); const [views, setViews] = useState(0); const [adding, setAdding] = useState(false);
  const [it, setIt] = useState({ kind: 'experience', title: '', organization: '', description: '', start_year: '', end_year: '' });
  const [editId, setEditId] = useState(null); const [editRec, setEditRec] = useState(null);

  const load = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle();
    if (!data) { setNf(true); return; } setP(data);
    const { data: ps } = await supabase.from('posts').select(POST_SELECT).eq('author_id', data.id).eq('is_removed', false).order('created_at', { ascending: false }).limit(20); setPosts(ps || []);
    const { data: its } = await supabase.from('profile_items').select('*, skill_endorsements(endorser_id)').eq('user_id', data.id).order('start_year', { ascending: false }); setItems(its || []);
    const { data: rc } = await supabase.from('recommendations').select('*, author:profiles!recommendations_author_id_fkey(username,first_name,last_name,avatar_url)').eq('recipient_id', data.id).order('created_at', { ascending: false }); setRecs(rc || []);
    const [f, c, b, fc, fg] = await Promise.all([
      supabase.from('follows').select('follower_id').match({ follower_id: me.id, following_id: data.id }),
      supabase.from('connections').select('*').or(`and(requester_id.eq.${me.id},addressee_id.eq.${data.id}),and(requester_id.eq.${data.id},addressee_id.eq.${me.id})`),
      supabase.from('blocks').select('blocked_id').match({ blocker_id: me.id, blocked_id: data.id }),
      supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', data.id),
      supabase.from('connections').select('id', { count: 'exact', head: true }).eq('status', 'accepted').or(`requester_id.eq.${data.id},addressee_id.eq.${data.id}`)]);
    setRel({ following: !!f.data?.length, conn: c.data?.[0], blocked: !!b.data?.length, followers: fc.count || 0, connections: fg.count || 0 });
    if (data.id === me.id) {
      const { count } = await supabase.from('profile_views').select('id', { count: 'exact', head: true }).eq('profile_id', me.id).gte('viewed_at', new Date(Date.now() - 30 * 864e5).toISOString());
      setViews(count || 0);
    } else {
      const { count } = await supabase.from('profile_views').select('id', { count: 'exact', head: true }).eq('viewer_id', me.id).eq('profile_id', data.id).gte('viewed_at', new Date(Date.now() - 864e5).toISOString());
      if (!count) await supabase.from('profile_views').insert({ viewer_id: me.id, profile_id: data.id });
    }
  };
  useEffect(() => { load(); }, [username]);
  if (nf) return <div className="card">{t("Profile not found or not visible to you.")}</div>;
  if (!p) return <p className="muted">{t("Loading…")}</p>;
  const mine = p.id === me.id;
  const follow = async () => { rel.following ? await supabase.from('follows').delete().match({ follower_id: me.id, following_id: p.id }) : await supabase.from('follows').insert({ follower_id: me.id, following_id: p.id }); load(); };
  const connect = async () => { await supabase.from('connections').insert({ requester_id: me.id, addressee_id: p.id }); load(); };
  const block = async () => { if (!confirm(t("Block this user?"))) return; rel.blocked ? await supabase.from('blocks').delete().match({ blocker_id: me.id, blocked_id: p.id }) : await supabase.from('blocks').insert({ blocker_id: me.id, blocked_id: p.id }); load(); };
  const report = async () => { const reason = prompt(t("Reason for report?")); if (reason) { await supabase.from('reports').insert({ reporter_id: me.id, target_type: 'user', target_id: p.id, reason }); alert(t("Reported.")); } };
  const setK = k => e => setIt({ ...it, [k]: e.target.value });
  const addItem = async (e) => { e.preventDefault();
    const row = { user_id: me.id, kind: it.kind, title: it.title.trim(), organization: it.organization || null, description: it.description || null, start_year: it.start_year ? +it.start_year : null, end_year: it.end_year ? +it.end_year : null };
    const { error } = editId ? await supabase.from('profile_items').update(row).eq('id', editId) : await supabase.from('profile_items').insert(row); if (error) return alert(error.message);
    setIt({ kind: it.kind, title: '', organization: '', description: '', start_year: '', end_year: '' }); setEditId(null); setAdding(false); load(); };
  const startEdit = (x) => { setEditId(x.id); setIt({ kind: x.kind, title: x.title || '', organization: x.organization || '', description: x.description || '', start_year: x.start_year || '', end_year: x.end_year || '' }); setAdding(true); };
  const endorsed = (x) => (x.skill_endorsements || []).some(e => e.endorser_id === me.id);
  const endorse = async (x) => { endorsed(x) ? await supabase.from('skill_endorsements').delete().match({ item_id: x.id, endorser_id: me.id }) : await supabase.from('skill_endorsements').insert({ item_id: x.id, endorser_id: me.id }); load(); };
  const myRec = recs.find(r => r.author_id === me.id);
  const sendRec = async (e) => { e.preventDefault(); const { error } = editRec ? await supabase.from('recommendations').update({ body: recTxt.trim() }).eq('id', editRec) : await supabase.from('recommendations').insert({ recipient_id: p.id, author_id: me.id, body: recTxt.trim() }); if (error) return alert(error.message); setRecTxt(''); setEditRec(null); load(); };
  const approveRec = async (r) => { await supabase.from('recommendations').update({ status: 'approved' }).eq('id', r.id); load(); };
  const delRec = async (r) => { await supabase.from('recommendations').delete().eq('id', r.id); load(); };
  const delItem = async (id) => { await supabase.from('profile_items').delete().eq('id', id); load(); };

  return (<div>
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="cover" style={p.cover_url ? { backgroundImage: `url(${p.cover_url})` } : {}} />
      <div style={{ padding: '1rem' }}>
        <div style={{ marginTop: -50 }}><Avatar p={p} size={90} /></div>
        <h2 style={{ marginTop: '.5rem' }}>{fullName(p)} <Badges p={p} /></h2>
        <div>{p.headline}</div><small className="muted">@{p.username} · {[p.district, p.region, p.country].filter(Boolean).join(', ')}</small>
        <div className="muted" style={{ margin: '.4rem 0' }}>{rel.followers} {t("followers")} · {rel.connections} {t("connections")}{mine && ` · 👁 ${views} profile views (30 days)`}</div>
        {p.bio && <p>{p.bio}</p>}{p.interest && <span className="badge b-pro" style={{ marginLeft: 0 }}>{p.interest}</span>}
        {mine ? <div style={{ marginTop: '.8rem' }}><Link className="btn" href="/settings">{t("Edit profile")}</Link></div> :
          <div style={{ marginTop: '.8rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            {!rel.conn && <button onClick={connect}>{t("Connect")}</button>}{rel.conn?.status === 'pending' && <button className="sec" disabled>{t("Request pending")}</button>}
            <button className="sec" onClick={follow}>{rel.following ? t("Following") : t("Follow")}</button>
            <Link className="btn sec" href={`/messages?to=${p.id}`}>{t("Message")}</Link>
            <button className="link" onClick={block}>{rel.blocked ? t("Unblock") : t("Block")}</button><button className="link" onClick={report}>{t("Report")}</button></div>}
      </div></div>

    {(items.length > 0 || mine) && <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>{t("Background")}</h3>{mine && <button className="sec" onClick={() => { if (adding) setEditId(null); setAdding(!adding); }}>{adding ? t("Close") : t("+ Add")}</button>}</div>
      {adding && <form onSubmit={addItem} style={{ marginBottom: '.8rem' }}>
        <select value={it.kind} onChange={setK('kind')}>{KINDS.map(([v, l]) => <option key={v} value={v}>{l.replace(/s$/, '')}</option>)}</select>
        <input placeholder={it.kind === 'skill' ? t("Skill (e.g. Agroforestry)") : t("Title / Degree / Certificate")} value={it.title} onChange={setK('title')} required />
        {it.kind !== 'skill' && <><input placeholder={t("Organization / School")} value={it.organization} onChange={setK('organization')} />
          <div className="row"><input type="number" placeholder={t("Start year")} value={it.start_year} onChange={setK('start_year')} /><input type="number" placeholder={t("End year (blank = present)")} value={it.end_year} onChange={setK('end_year')} /></div>
          <textarea rows={2} placeholder={t("Description")} value={it.description} onChange={setK('description')} /></>}
        <button>{t("Save")}</button>{editId && <> <button type="button" className="sec" onClick={() => { setEditId(null); setAdding(false); setIt({ kind: 'experience', title: '', organization: '', description: '', start_year: '', end_year: '' }); }}>{t("Cancel")}</button></>}</form>}
      {KINDS.map(([k, label]) => { const list = items.filter(x => x.kind === k); if (!list.length) return null;
        return (<div className="sect" key={k}><h4>{t(label)}</h4>
          {k === 'skill' ? <div>{list.map(x => <span className="skill" key={x.id}>{x.title}<small> {x.skill_endorsements?.length || 0}</small>{!mine && <button className="link" style={{ padding: '0 .3rem' }} title="Endorse" onClick={() => endorse(x)}>{endorsed(x) ? '✓' : '+'}</button>}{mine && <><button className="link" style={{ padding: '0 .3rem' }} onClick={() => startEdit(x)}>✏️</button><button className="link" style={{ padding: '0 .3rem' }} onClick={() => delItem(x.id)}>✕</button></>}</span>)}</div>
            : list.map(x => <div className="item" key={x.id}><div><b>{x.title}</b><div className="muted">{x.organization} {(x.start_year || x.end_year) && `· ${x.start_year || ''} – ${x.end_year || 'Present'}`}</div>{x.description && <div>{x.description}</div>}</div>
              {mine && <span><button className="link" onClick={() => startEdit(x)}>✏️</button><button className="link" onClick={() => delItem(x.id)}>🗑</button></span>}</div>)}</div>); })}
      {!items.length && <p className="muted">{t("Add your experience, education and skills.")}</p>}
    </div>}

    <div className="card"><h3>{t("Recommendations")}</h3>
      {!recs.length && <p className="muted">{t("No recommendations yet.")}</p>}
      {recs.map(r => <div className="item" key={r.id}><div><b>{fullName(r.author)}</b> {r.status === 'pending' && <span className="badge b-org">{t("pending approval")}</span>}<div>{r.body}</div></div>
        <div>{mine && r.status === 'pending' && <button onClick={() => approveRec(r)}>{t("Show on profile")}</button>}{r.author_id === me.id && <button className="link" onClick={() => { setEditRec(r.id); setRecTxt(r.body); }}>✏️</button>}{(mine || r.author_id === me.id) && <button className="link" onClick={() => delRec(r)}>🗑</button>}</div></div>)}
      {!mine && (!myRec || editRec) && <form onSubmit={sendRec} style={{ marginTop: '.6rem' }}><textarea rows={3} minLength={10} maxLength={1500} placeholder={t("Write a recommendation (min 10 characters)")} value={recTxt} onChange={e => setRecTxt(e.target.value)} required /><button>{editRec ? t("Save changes") : t("Send recommendation")}</button>{editRec && <> <button type="button" className="sec" onClick={() => { setEditRec(null); setRecTxt(''); }}>{t("Cancel")}</button><small className="muted"> {L('After editing, the person must approve it again.', 'Baada ya kuhariri, mhusika anapaswa kuidhinisha tena.')}</small></>}</form>}
    </div>

    <h3>{t("Posts")}</h3>{!posts.length && <p className="muted">{t("No posts yet.")}</p>}{posts.map(x => <PostCard key={x.id} post={x} me={me} onChange={load} />)}
  </div>);
}
export default function Profile() { return <Shell>{me => <Inner me={me} />}</Shell>; }
