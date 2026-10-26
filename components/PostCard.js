'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, fullName, timeAgo } from '@/lib/supabase';
import Avatar from './Avatar';
import Badges from './Badges';
import RichText from './RichText';
import MediaGallery from './MediaGallery';
import Comments from './Comments';
import { useT } from '@/lib/i18n';

export const REACTIONS = [['like', '👍', 'Like'], ['love', '❤️', 'Love'], ['insightful', '💡', 'Insightful'], ['support', '🤝', 'Support'], ['celebrate', '🎉', 'Celebrate'], ['curious', '🤔', 'Curious']];
const EMOJI = Object.fromEntries(REACTIONS.map(r => [r[0], r[1]]));

export default function PostCard({ post, me, onChange, savedInit = false }) {
  const { t } = useT();
  const [open, setOpen] = useState(false); const [cm, setCm] = useState([]); const [txt, setTxt] = useState('');
  const [rx, setRx] = useState(post.reactions || []); const [picker, setPicker] = useState(false);
  const [saved, setSaved] = useState(savedInit); const [ccount, setCcount] = useState(post.comments?.[0]?.count || 0);
  const [editing, setEditing] = useState(false); const [body, setBody] = useState(post.body); const [shown, setShown] = useState(post.body);
  const [votes, setVotes] = useState(post.poll_votes || []);
  const [o, setO] = useState(null);
  const a = post.author; const mine = rx.find(r => r.user_id === me.id);
  const kinds = [...new Set(rx.map(r => r.kind))].slice(0, 3);
  const opts = [...(post.poll_options || [])].sort((x, y) => x.position - y.position);
  const myVote = votes.find(v => v.user_id === me.id);

  useEffect(() => {
    if (!post.repost_of) return;
    supabase.from('posts').select('id,body,created_at,author:profiles!posts_author_id_fkey(username,first_name,last_name,avatar_url), post_media(*)').eq('id', post.repost_of).maybeSingle().then(({ data }) => { if (data) setO(data); });
  }, [post.repost_of]);

  const react = async (kind) => {
    setPicker(false);
    if (mine && mine.kind === kind) {
      setRx(rx.filter(r => r.user_id !== me.id));
      await supabase.from('reactions').delete().match({ post_id: post.id, user_id: me.id });
    } else {
      setRx([...rx.filter(r => r.user_id !== me.id), { user_id: me.id, kind, user: me }]);
      await supabase.from('reactions').upsert({ post_id: post.id, user_id: me.id, kind });
    }
  };
  const toggle = () => setOpen(!open);
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
  const share = () => { navigator.clipboard?.writeText(`${location.origin}/post/${post.id}`); alert('Link copied'); };
  const repost = async () => {
    const c = prompt('Add your thoughts (optional):'); if (c === null) return;
    const { error } = await supabase.from('posts').insert({ author_id: me.id, body: c.trim() || '🔁 Reposted', repost_of: post.repost_of || post.id });
    if (error) alert(error.message); else onChange?.();
  };
  const saveEdit = async () => {
    if (!body.trim()) return;
    const { error } = await supabase.from('posts').update({ body: body.trim(), updated_at: new Date().toISOString() }).eq('id', post.id);
    if (!error) { setShown(body.trim()); setEditing(false); }
  };
  const vote = async (o) => {
    if (myVote) return;
    const { error } = await supabase.from('poll_votes').insert({ post_id: post.id, user_id: me.id, option_id: o.id });
    if (!error) setVotes([...votes, { user_id: me.id, option_id: o.id }]);
  };

  return (
    <div className="card">
      <div className="post-h">
        <Avatar p={a} />
        <div className="meta"><Link href={`/profile/${a?.username}`}><b>{fullName(a)}<Badges p={a} /></b></Link>
          <small>{a?.headline ? a.headline + ' · ' : ''}{timeAgo(post.created_at)}{post.community ? ` · in ${post.community.name}` : ''}</small></div>
        {post.type !== 'text' && <span className="badge b-pro">{post.type.replace('_', ' ')}</span>}
      </div>
      {editing ? <div><textarea rows={4} value={body} onChange={e => setBody(e.target.value)} maxLength={5000} />
        <button onClick={saveEdit}>{t("Save")}</button> <button className="sec" onClick={() => { setEditing(false); setBody(shown); }}>{t("Cancel")}</button></div>
        : <div className="post-body"><RichText text={shown} /></div>}

      {post.type === 'poll' && opts.length > 0 && <div className="poll">
        {opts.map(op => { const n = votes.filter(v => v.option_id === op.id).length; const pct = votes.length ? Math.round(n * 100 / votes.length) : 0;
          return myVote ? <div key={op.id} className="bar"><div className="fill" style={{ width: pct + '%' }} /><span>{op.label}{myVote.option_id === op.id ? ' ✓' : ''}</span><b>{pct}%</b></div>
            : <button key={op.id} type="button" className="sec opt" onClick={() => vote(op)}>{op.label}</button>; })}
        <small className="muted">{votes.length} votes</small></div>}

      <MediaGallery media={post.post_media} />

      {o && <div className="quote"><div className="post-h"><Avatar p={o.author} size={28} /><b>{fullName(o.author)}</b><small>{timeAgo(o.created_at)}</small></div>
        <div className="post-body"><RichText text={o.body} /></div><MediaGallery media={o.post_media} /></div>}

      {(rx.length > 0 || ccount > 0) && <div className="stats">
        {rx.length > 0 && <div className="rx-sum">
          <span className="emo">{kinds.map(k => <span key={k}>{EMOJI[k]}</span>)}</span>
          <span className="faces">{rx.slice(0, 5).map(r => <span key={r.user_id} title={fullName(r.user)}><Avatar p={r.user} size={22} /></span>)}</span>
          <small className="muted">{rx.length}</small></div>}
        <small className="muted">{ccount} comments</small></div>}

      <div className="actions">
        <div className="rx-wrap" onMouseEnter={() => setPicker(true)} onMouseLeave={() => setPicker(false)}>
          {picker && <div className="picker">{REACTIONS.map(([k, e, l]) => <button type="button" key={k} title={l} onClick={() => react(k)}>{e}</button>)}</div>}
          <button className="link" style={mine ? { color: 'var(--teal)' } : {}} onClick={() => react(mine ? mine.kind : 'like')}>
            {mine ? `${EMOJI[mine.kind]} ${REACTIONS.find(r => r[0] === mine.kind)[2]}` : t("👍 Like")}</button>
          <button type="button" className="link" onClick={() => setPicker(!picker)}>▾</button>
        </div>
        <button className="link" onClick={toggle}>{t("💬 Comment")}</button>
        <button className="link" onClick={repost}>{t("🔁 Repost")}</button>
        <button className="link" onClick={share}>{t("🔗 Share")}</button>
        <button className="link" onClick={save}>{saved ? t("🔖 Saved") : t("🔖 Save")}</button>
        {post.author_id === me.id ? <><button className="link" onClick={() => setEditing(true)}>{t("✏️ Edit")}</button><button className="link" onClick={del}>{t("🗑 Delete")}</button></>
          : <button className="link" onClick={report}>{t("🚩 Report")}</button>}
      </div>
      {open && <Comments postId={post.id} me={me} onAdded={() => setCcount(ccount + 1)} />}
    </div>
  );
}
