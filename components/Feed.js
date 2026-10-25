'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabase, uploadFile } from '@/lib/supabase';
import PostCard from './PostCard';
import Avatar from './Avatar';

const TYPES = [['text', 'Post'], ['question', 'Question'], ['advice', 'Agricultural advice'], ['awareness', 'Environmental awareness'], ['research', 'Research summary'], ['project_update', 'Project update'], ['story', 'Success story'], ['opportunity', 'Opportunity']];
const SELECT = '*, author:profiles!posts_author_id_fkey(id,username,first_name,last_name,headline,avatar_url,is_beneficiary_verified,is_professional_verified,is_org_verified), reactions(user_id), comments(count), community:communities(name,slug)';

export default function Feed({ me, communityId, canPost = true }) {
  const [posts, setPosts] = useState([]); const [tab, setTab] = useState('all'); const [loading, setLoading] = useState(true);
  const [body, setBody] = useState(''); const [type, setType] = useState('text'); const [file, setFile] = useState(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const [limit, setLimit] = useState(15);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('posts').select(SELECT).eq('is_removed', false).order('created_at', { ascending: false }).limit(limit);
    if (communityId) q = q.eq('community_id', communityId);
    else if (tab === 'following') {
      const { data: f } = await supabase.from('follows').select('following_id').eq('follower_id', me.id);
      q = q.in('author_id', [me.id, ...(f || []).map(x => x.following_id)]);
    } else if (tab !== 'all') q = q.eq('type', tab);
    const { data } = await q; setPosts(data || []); setLoading(false);
  }, [communityId, tab, limit, me.id]);
  useEffect(() => { load(); }, [load]);

  const publish = async (e) => {
    e.preventDefault(); if (!body.trim()) return; setBusy(true); setErr('');
    try {
      let media_url = null, media_kind = null;
      if (file) {
        if (file.size > 25 * 1024 * 1024) throw new Error('File too large (max 25 MB).');
        media_url = await uploadFile('post-media', me.id, file);
        media_kind = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'document';
      }
      const { error } = await supabase.from('posts').insert({ author_id: me.id, body: body.trim(), type: media_kind && type === 'text' ? media_kind : type, community_id: communityId || null, media_url, media_kind });
      if (error) throw error;
      setBody(''); setFile(null); setType('text'); load();
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  return (<div>
    {canPost && <form className="card" onSubmit={publish}>
      <div className="post-h"><Avatar p={me} /><b>Share knowledge with the community</b></div>
      {err && <div className="err">{err}</div>}
      <textarea rows={3} placeholder="What would you like to share or ask?" value={body} onChange={e => setBody(e.target.value)} maxLength={5000} />
      <div className="row" style={{ alignItems: 'center' }}>
        <select style={{ margin: 0 }} value={type} onChange={e => setType(e.target.value)}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <input style={{ margin: 0 }} type="file" accept="image/*,video/*,.pdf,.doc,.docx" onChange={e => setFile(e.target.files[0])} />
        <button disabled={busy || !body.trim()} style={{ flex: '0 0 auto' }}>{busy ? 'Posting…' : 'Publish'}</button>
      </div>
    </form>}
    {!communityId && <div className="tabs">{[['all', 'All posts'], ['following', 'Following'], ['question', 'Questions'], ['advice', 'Agri advice'], ['awareness', 'Awareness'], ['opportunity', 'Opportunities']].map(([k, l]) =>
      <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>}
    {loading && !posts.length && <p className="muted">Loading…</p>}
    {!loading && !posts.length && <div className="card muted">No posts yet. Be the first to share something!</div>}
    {posts.map(p => <PostCard key={p.id} post={p} me={me} onChange={load} />)}
    {posts.length >= limit && <button className="sec" onClick={() => setLimit(limit + 15)}>Load more</button>}
  </div>);
}
