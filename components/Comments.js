'use client';
import { useEffect, useState } from 'react';
import { supabase, fullName, timeAgo } from '@/lib/supabase';
import Avatar from './Avatar';
import RichText from './RichText';
import AutoTextarea from './AutoTextarea';
import { useT } from '@/lib/i18n';

export default function Comments({ postId, me, onAdded }) {
  const { t, lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const [list, setList] = useState([]); const [txt, setTxt] = useState(''); const [reply, setReply] = useState(null); const [rt, setRt] = useState(''); const [editId, setEditId] = useState(null); const [et, setEt] = useState('');
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
  const del = async (c) => { if (confirm(t("Delete this comment?"))) { await supabase.from('comments').delete().eq('id', c.id); load(); } };
  const saveEdit = async () => {
    if (!et.trim()) return;
    const { error } = await supabase.from('comments').update({ body: et.trim() }).eq('id', editId);
    if (!error) { setEditId(null); setEt(''); load(); }
  };
  const sendNew = () => { add(txt); setTxt(''); };
  const row = (c, topId) => {
    const liked = c.comment_likes.some(l => l.user_id === me.id);
    const sendReply = () => { add(rt, topId); setReply(null); setRt(''); };
    return (<div className="cmt" key={c.id}><Avatar p={c.author} size={30} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {editId === c.id
          ? <div><AutoTextarea autoFocus value={et} onChange={setEt} onSubmit={saveEdit} maxLength={2000} />
              <button type="button" onClick={saveEdit}>{t("Save")}</button> <button type="button" className="sec" onClick={() => setEditId(null)}>{t("Cancel")}</button></div>
          : <div className="bub"><b>{fullName(c.author)}</b> <small className="muted">{timeAgo(c.created_at)}{c.edited_at ? ` · ${L('edited', 'imehaririwa')}` : ''}</small><div><RichText text={c.body} /></div></div>}
        <div>
          <button className="link" style={liked ? { color: 'var(--teal)' } : {}} onClick={() => like(c)}>👍 {c.comment_likes.length || ''} {t("Like")}</button>
          <button className="link" onClick={() => { setReply(c.id); setRt('@' + c.author.username + ' '); }}>{t("Reply")}</button>
          {c.author_id === me.id && <button className="link" onClick={() => { setEditId(c.id); setEt(c.body); }}>✏️ {L('Edit', 'Hariri')}</button>}
          {c.author_id === me.id && <button className="link" onClick={() => del(c)}>{t("Delete")}</button>}
        </div>
        {reply === c.id && <form onSubmit={(e) => { e.preventDefault(); sendReply(); }} style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-end' }}>
          <AutoTextarea autoFocus value={rt} onChange={setRt} onSubmit={sendReply} maxLength={2000} style={{ flex: 1 }} /><button>{t("Reply")}</button></form>}
        {!c.parent_id && list.filter(r => r.parent_id === c.id).map(r => row(r, c.id))}
      </div></div>);
  };
  return (<div>
    {list.filter(c => !c.parent_id).map(c => row(c, c.id))}
    <form onSubmit={(e) => { e.preventDefault(); sendNew(); }} style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem', alignItems: 'flex-end' }}>
      <AutoTextarea value={txt} onChange={setTxt} onSubmit={sendNew} placeholder={t("Write a comment… use @username to mention")} maxLength={2000} style={{ flex: 1 }} /><button>{t("Send")}</button></form>
  </div>);
}
