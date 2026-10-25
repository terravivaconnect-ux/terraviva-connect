'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase, fullName, timeAgo } from '@/lib/supabase';
import Avatar from './Avatar';
import Badges from './Badges';

export default function PostCard({ post, me, onChange }) {
  const [open, setOpen] = useState(false); const [cm, setCm] = useState([]); const [txt, setTxt] = useState('');
  const [likes, setLikes] = useState(post.reactions || []); const [saved, setSaved] = useState(false); const [ccount, setCcount] = useState(post.comments?.[0]?.count || 0);
  const liked = likes.some(r => r.user_id === me.id);
  const a = post.author;

  const like = async () => {
    if (liked) { setLikes(likes.filter(r => r.user_id !== me.id)); await supabase.from('reactions').delete().match({ post_id: post.id, user_id: me.id }); }
    else { setLikes([...likes, { user_id: me.id }]); await supabase.from('reactions').insert({ post_id: post.id, user_id: me.id }); }
  };
  const loadC = async () => {
    const { data } = await supabase.from('comments').select('*, author:profiles!comments_author_id_fkey(id,username,first_name,last_name,avatar_url)').eq('post_id', post.id).order('created_at');
    setCm(data || []);
  };
  const toggle = () => { if (!open) loadC(); setOpen(!open); };
  const send = async (e) => {
    e.preventDefault(); if (!txt.trim()) return;
    const { error } = await supabase.from('comments').insert({ post_id: post.id, author_id: me.id, body: txt.trim() });
    if (!error) { setTxt(''); setCcount(ccount + 1); loadC(); }
  };
  const save = async () => {
    if (saved) await supabase.from('saved_posts').delete().match({ post_id: post.id, user_id: me.id });
    else await supabase.from('saved_posts').insert({ post_id: post.id, user_id: me.id });
    setSaved(!saved);
  };
  const report = async () => {
    const reason = prompt('Why are you reporting this post?'); if (!reason) return;
    await supabase.from('reports').insert({ reporter_id: me.id, target_type: 'post', target_id: post.id, reason }); alert('Thank you. Our moderators will review it.');
  };
  const del = async () => { if (confirm('Delete this post?')) { await supabase.from('posts').delete().eq('id', post.id); onChange?.(); } };
  const share = () => { navigator.clipboard?.writeText(`${location.origin}/?post=${post.id}`); alert('Link copied'); };

  return (
    <div className="card">
      <div className="post-h">
        <Avatar p={a} />
        <div className="meta"><Link href={`/profile/${a?.username}`}><b>{fullName(a)}<Badges p={a} /></b></Link>
          <small>{a?.headline ? a.headline + ' · ' : ''}{timeAgo(post.created_at)}{post.community ? ` · in ${post.community.name}` : ''}</small></div>
        {post.type !== 'text' && <span className="badge b-pro">{post.type.replace('_', ' ')}</span>}
      </div>
      <div className="post-body">{post.body}</div>
      {post.media_url && (post.media_kind === 'image' ? <img className="post-img" src={post.media_url} alt="" loading="lazy" /> :
        post.media_kind === 'video' ? <video className="post-img" src={post.media_url} controls preload="none" /> :
        <a href={post.media_url} target="_blank" rel="noreferrer">📎 Open attachment</a>)}
      <small className="muted">{likes.length} reactions · {ccount} comments</small>
      <div className="actions">
        <button className="link" onClick={like} style={liked ? { color: 'var(--teal)' } : {}}>{liked ? '👍 Liked' : '👍 Like'}</button>
        <button className="link" onClick={toggle}>💬 Comment</button>
        <button className="link" onClick={share}>🔗 Share</button>
        <button className="link" onClick={save}>{saved ? '🔖 Saved' : '🔖 Save'}</button>
        {post.author_id === me.id ? <button className="link" onClick={del}>🗑 Delete</button> : <button className="link" onClick={report}>🚩 Report</button>}
      </div>
      {open && <div>
        {cm.map(c => <div className="cmt" key={c.id}><Avatar p={c.author} size={30} /><div className="bub"><b>{fullName(c.author)}</b> <small className="muted">{timeAgo(c.created_at)}</small><div>{c.body}</div></div></div>)}
        <form onSubmit={send} style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
          <input style={{ margin: 0 }} placeholder="Write a comment…" value={txt} onChange={e => setTxt(e.target.value)} maxLength={2000} /><button>Send</button></form>
      </div>}
    </div>
  );
}
