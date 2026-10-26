'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabase, uploadFile } from '@/lib/supabase';
import PostCard from './PostCard';
import Avatar from './Avatar';

const TYPES = [['text', 'Post'], ['question', 'Question'], ['advice', 'Agricultural advice'], ['awareness', 'Environmental awareness'], ['research', 'Research summary'], ['project_update', 'Project update'], ['story', 'Success story'], ['opportunity', 'Opportunity']];
const A = 'id,username,first_name,last_name,headline,avatar_url,is_beneficiary_verified,is_professional_verified,is_org_verified';
export const POST_SELECT = `*, author:profiles!posts_author_id_fkey(${A}), reactions(user_id,kind,user:profiles(id,username,first_name,last_name,avatar_url)), comments(count), community:communities(name,slug), post_media(*), poll_options(*), poll_votes(user_id,option_id), original:posts!posts_repost_of_fkey(id,body,created_at,author:profiles!posts_author_id_fkey(username,first_name,last_name,avatar_url), post_media(*))`;

const kindOf = (f) => f.type.startsWith('image') ? 'image' : f.type.startsWith('video') ? 'video' : 'document';

function makePoster(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file); const v = document.createElement('video');
    const done = (b) => { URL.revokeObjectURL(url); resolve(b); };
    const t = setTimeout(() => done(null), 8000);
    v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url;
    v.onloadedmetadata = () => { v.currentTime = Math.min(1, (v.duration || 2) / 2); };
    v.onseeked = () => {
      try {
        const c = document.createElement('canvas'); const w = Math.min(v.videoWidth || 640, 960);
        c.width = w; c.height = Math.round(w * (v.videoHeight || 360) / (v.videoWidth || 640));
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
        c.toBlob((b) => { clearTimeout(t); done(b); }, 'image/jpeg', 0.8);
      } catch { clearTimeout(t); done(null); }
    };
    v.onerror = () => { clearTimeout(t); done(null); };
  });
}

export default function Feed({ me, communityId, canPost = true }) {
  const [posts, setPosts] = useState([]); const [saved, setSaved] = useState(new Set()); const [tab, setTab] = useState('all'); const [loading, setLoading] = useState(true);
  const [body, setBody] = useState(''); const [type, setType] = useState('text'); const [files, setFiles] = useState([]); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const [poll, setPoll] = useState(null); const [limit, setLimit] = useState(15);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('posts').select(POST_SELECT).eq('is_removed', false).order('created_at', { ascending: false }).limit(limit);
    if (communityId) q = q.eq('community_id', communityId);
    else if (tab === 'following') {
      const { data: f } = await supabase.from('follows').select('following_id').eq('follower_id', me.id);
      q = q.in('author_id', [me.id, ...(f || []).map(x => x.following_id)]);
    } else if (tab !== 'all') q = q.eq('type', tab);
    const { data, error } = await q;
    if (error) setErr(error.message);
    setPosts(data || []);
    const { data: s } = await supabase.from('saved_posts').select('post_id').eq('user_id', me.id);
    setSaved(new Set((s || []).map(x => x.post_id)));
    setLoading(false);
  }, [communityId, tab, limit, me.id]);
  useEffect(() => { load(); }, [load]);

  const pick = (e) => {
    const add = Array.from(e.target.files || []).filter(f => {
      if (f.size > 50 * 1024 * 1024) { setErr(`${f.name} is larger than 50 MB.`); return false; } return true; });
    setFiles([...files, ...add].slice(0, 10)); e.target.value = '';
  };
  const togglePoll = () => setPoll(poll ? null : ['', '']);

  const publish = async (e) => {
    e.preventDefault(); if (!body.trim()) return; setBusy(true); setErr('');
    try {
      const opts = poll ? poll.map(s => s.trim()).filter(Boolean) : [];
      if (poll && opts.length < 2) throw new Error('A poll needs at least 2 options.');
      const media = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i]; const kind = kindOf(f);
        const url = await uploadFile('post-media', me.id, f); let poster_url = null;
        if (kind === 'video') { const b = await makePoster(f); if (b) poster_url = await uploadFile('post-media', me.id, new File([b], 'poster.jpg', { type: 'image/jpeg' })); }
        media.push({ url, kind, name: f.name, mime: f.type, poster_url, position: i });
      }
      const { data: post, error } = await supabase.from('posts').insert({ author_id: me.id, body: body.trim(), type: poll ? 'poll' : type, community_id: communityId || null }).select('id').single();
      if (error) throw error;
      if (media.length) { const { error: e2 } = await supabase.from('post_media').insert(media.map(m => ({ ...m, post_id: post.id }))); if (e2) throw e2; }
      if (opts.length) { const { error: e3 } = await supabase.from('poll_options').insert(opts.map((label, position) => ({ post_id: post.id, label, position }))); if (e3) throw e3; }
      setBody(''); setFiles([]); setType('text'); setPoll(null); load();
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  return (<div>
    {canPost && <form className="card" onSubmit={publish}>
      <div className="post-h"><Avatar p={me} /><b>Share knowledge with the community</b></div>
      {err && <div className="err">{err}</div>}
      <textarea rows={3} placeholder="What would you like to share or ask? Use #hashtags and @mentions" value={body} onChange={e => setBody(e.target.value)} maxLength={5000} />
      {files.length > 0 && <div className="previews">{files.map((f, i) => (
        <div className="pv" key={i}>
          {f.type.startsWith('image') ? <img src={URL.createObjectURL(f)} alt="" /> : <div className="pv-f">{f.type.startsWith('video') ? '🎬' : '📄'}<small>{f.name.slice(0, 18)}</small></div>}
          <button type="button" className="rm" onClick={() => setFiles(files.filter((_, j) => j !== i))}>✕</button></div>))}</div>}
      {poll && <div style={{ marginBottom: '.5rem' }}>{poll.map((s, i) => (
        <input key={i} placeholder={`Option ${i + 1}`} maxLength={120} value={s} onChange={e => setPoll(poll.map((x, j) => j === i ? e.target.value : x))} />))}
        {poll.length < 4 && <button type="button" className="link" onClick={() => setPoll([...poll, ''])}>+ Add option</button>}</div>}
      <div className="row" style={{ alignItems: 'center' }}>
        <select style={{ margin: 0 }} value={type} onChange={e => setType(e.target.value)}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <label className="btn sec" style={{ margin: 0, textAlign: 'center' }}>📎 Add media / documents
          <input type="file" hidden multiple accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" onChange={pick} /></label>
        <button type="button" className="sec" onClick={togglePoll}>{poll ? 'Remove poll' : '📊 Poll'}</button>
        <button disabled={busy || !body.trim()} style={{ flex: '0 0 auto' }}>{busy ? 'Posting…' : 'Publish'}</button>
      </div>
    </form>}
    {!communityId && <div className="tabs">{[['all', 'All posts'], ['following', 'Following'], ['question', 'Questions'], ['advice', 'Agri advice'], ['awareness', 'Awareness'], ['opportunity', 'Opportunities']].map(([k, l]) =>
      <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>}
    {loading && !posts.length && <p className="muted">Loading…</p>}
    {!loading && !posts.length && <div className="card muted">No posts yet. Be the first to share something!</div>}
    {posts.map(p => <PostCard key={p.id} post={p} me={me} savedInit={saved.has(p.id)} onChange={load} />)}
    {posts.length >= limit && <button className="sec" onClick={() => setLimit(limit + 15)}>Load more</button>}
  </div>);
}
