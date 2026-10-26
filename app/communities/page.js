'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import Feed from '@/components/Feed';
import Avatar from '@/components/Avatar';
import { supabase, fullName } from '@/lib/supabase';
import { useT } from '@/lib/i18n';

function Inner({ me }) {
  const { t } = useT();
  const [list, setList] = useState([]); const [mem, setMem] = useState({}); const [sel, setSel] = useState(null); const [pending, setPending] = useState([]);
  const load = async () => {
    const { data } = await supabase.from('communities').select('*').eq('is_active', true).order('name'); setList(data || []);
    const { data: m } = await supabase.from('community_members').select('community_id,status,role').eq('user_id', me.id);
    setMem(Object.fromEntries((m || []).map(x => [x.community_id, x])));
  };
  useEffect(() => { load(); }, []);
  const isCA = (c) => me.role === 'admin' || (mem[c.id]?.role === 'admin' && mem[c.id]?.status === 'approved');
  const loadPending = async (c) => {
    if (!c || !isCA(c)) return setPending([]);
    const { data } = await supabase.from('community_members').select('user_id,joined_at,user:profiles(id,username,first_name,last_name,avatar_url)').eq('community_id', c.id).eq('status', 'pending');
    setPending(data || []);
  };
  useEffect(() => { loadPending(sel); }, [sel, mem]);
  const join = async (c) => { const { error } = await supabase.from('community_members').insert({ community_id: c.id, user_id: me.id, status: c.privacy === 'public' ? 'approved' : 'pending' }); if (error) alert(error.message); load(); };
  const leave = async (c) => { await supabase.from('community_members').delete().match({ community_id: c.id, user_id: me.id }); setSel(null); load(); };
  const decide = async (c, uid, ok) => {
    if (ok) await supabase.from('community_members').update({ status: 'approved' }).match({ community_id: c.id, user_id: uid });
    else await supabase.from('community_members').delete().match({ community_id: c.id, user_id: uid });
    loadPending(c);
  };
  if (sel) {
    const ok = mem[sel.id]?.status === 'approved';
    return (<div><button className="sec" onClick={() => setSel(null)}>{t("← All communities")}</button>
      <div className="hero" style={{ marginTop: '.8rem' }}><h2>{sel.name}</h2><div>{sel.description}</div></div>
      {isCA(sel) && pending.length > 0 && <div className="card"><h3>Join requests ({pending.length})</h3>
        {pending.map(p => <div className="post-h" key={p.user_id}><Avatar p={p.user} /><div className="meta"><b>{fullName(p.user)}</b><small>@{p.user?.username}</small></div>
          <button onClick={() => decide(sel, p.user_id, true)}>{t("Accept")}</button> <button className="sec" onClick={() => decide(sel, p.user_id, false)}>{t("Decline")}</button></div>)}</div>}
      {sel.privacy !== 'public' && !ok && mem[sel.id]?.status !== 'pending' && <div className="card">This is a {sel.privacy} community. <button onClick={() => join(sel)}>Request to join</button></div>}
      {mem[sel.id]?.status === 'pending' && <div className="card muted">Your request is awaiting approval.</div>}
      {(sel.privacy === 'public' || ok) && <>
        {sel.privacy === 'public' && !ok && <div className="card"><button onClick={() => join(sel)}>Join to post</button></div>}
        <Feed me={me} communityId={sel.id} canPost={ok} />
        {ok && <button className="link" onClick={() => leave(sel)}>Leave community</button>}</>}
    </div>);
  }
  return (<div><h2>{t("Communities")}</h2><div className="grid">{list.map(c => (
    <div className="card" key={c.id}><h3>{c.name}</h3><p className="muted">{c.description}</p><small className="badge b-pro" style={{ marginLeft: 0 }}>{c.privacy}</small>
      <div style={{ marginTop: '.7rem', display: 'flex', gap: '.5rem' }}><button onClick={() => setSel(c)}>{t("Open")}</button>
        {!mem[c.id] ? <button className="sec" onClick={() => join(c)}>{c.privacy === 'public' ? 'Join' : 'Request'}</button> : <small className="muted" style={{ alignSelf: 'center' }}>{mem[c.id].status === 'approved' ? t("✓ Member") : 'Pending'}</small>}</div></div>))}</div></div>);
}
export default function Communities() { return <Shell>{me => <Inner me={me} />}</Shell>; }
