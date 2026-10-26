'use client';
import { useEffect, useState } from 'react';
import { supabase, fullName, timeAgo } from '@/lib/supabase';
import Avatar from './Avatar';
import RichText from './RichText';

export default function Comments({ postId, me, onAdded }) {
  const [list, setList] = useState([]); const [txt, setTxt] = useState(''); const [reply, setReply] = useState(null); const [rt, setRt] = useState('');
  const load = async () => {
    const { data } = await supabase.from('comments').select('*, author:profiles!comments_author_id_fkey(id,username,first_name,last_name,avatar_url), comment_likes(user_id)').eq('post_id', postId).eq('is_removed', false).order('created_at');
    setList(data || []);
  };
  useEffect(() => { load(); }, [postId]);
  const add = async (body, parent) => {
    if (!body.trim()) return;
    const { error } = await supabase.from('comments').insert({ post_id: postId, author_id: me.id, parent_id: parent || null, body: body.trim() });
    if (!error) { onAdded?.(); load(); }
  };
  const like = async (c) => {
    const liked = c.comment_likes.some(l => l.user_id === me.id);
    if (liked) await supabase.from('comment_likes').delete().match({ comment_id: c.id, user_id: me.id });
    else await supabase.from('comment_likes').insert({ comment_id: c.id, user_id: me.id });
    load();
  };
  const del = async (c) => { if (confirm('Delete this comment?')) { await supabase.from('comments').delete().eq('id', c.id); load(); } };
  const row = (c, topId) => {
    const liked = c.comment_likes.some(l => l.user_id === me.id);
    return (<div className="cmt" key={c.id}><Avatar p={c.author} size={30} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="bub"><b>{fullName(c.author)}</b> <small className="muted">{timeAgo(c.created_at)}</small><div><RichText text={c.body} /></div></div>
        <div>
          <button className="link" style={liked ? { color: 'var(--teal)' } : {}} onClick={() => like(c)}>👍 {c.comment_likes.length || ''} Like</button>
          <button className="link" onClick={() => { setReply(c.id); setRt('@' + c.author.username + ' '); }}>Reply</button>
          {c.author_id === me.id && <button className="link" onClick={() => del(c)}>Delete</button>}
        </div>
        {reply === c.id && <form onSubmit={(e) => { e.preventDefault(); add(rt, topId); setReply(null); setRt(''); }} style={{ display: 'flex', gap: '.5rem' }}>
          <input style={{ margin: 0 }} autoFocus value={rt} onChange={e => setRt(e.target.value)} maxLength={2000} /><button>Reply</button></form>}
        {!c.parent_id && list.filter(r => r.parent_id === c.id).map(r => row(r, c.id))}
      </div></div>);
  };
  return (<div>
    {list.filter(c => !c.parent_id).map(c => row(c, c.id))}
    <form onSubmit={(e) => { e.preventDefault(); add(txt); setTxt(''); }} style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
      <input style={{ margin: 0 }} placeholder="Write a comment… use @username to mention" value={txt} onChange={e => setTxt(e.target.value)} maxLength={2000} /><button>Send</button></form>
  </div>);
}
