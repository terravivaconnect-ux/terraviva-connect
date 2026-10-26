'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import PostCard from '@/components/PostCard';
import { POST_SELECT } from '@/components/Feed';
import { supabase } from '@/lib/supabase';
import { useT } from '@/lib/i18n';
function Inner({ me }) {
  const { t } = useT();
  const [posts, setPosts] = useState(null);
  const load = async () => {
    const { data: s } = await supabase.from('saved_posts').select('post_id').eq('user_id', me.id).order('created_at', { ascending: false });
    const ids = (s || []).map(x => x.post_id);
    if (!ids.length) return setPosts([]);
    const { data } = await supabase.from('posts').select(POST_SELECT).in('id', ids);
    setPosts(data || []);
  };
  useEffect(() => { load(); }, []);
  return (<div><h2>{t("Saved posts")}</h2>{posts === null && <p className="muted">{t("Loading…")}</p>}
    {posts && !posts.length && <div className="card muted">Nothing saved yet. Use 🔖 Save on any post.</div>}
    {posts && posts.map(p => <PostCard key={p.id} post={p} me={me} savedInit onChange={load} />)}</div>);
}
export default function Saved() { return <Shell>{me => <Inner me={me} />}</Shell>; }
