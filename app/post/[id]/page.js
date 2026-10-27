'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Shell from '@/components/Shell';
import PostCard from '@/components/PostCard';
import { POST_SELECT } from '@/components/Feed';
import { supabase } from '@/lib/supabase';
import { useT } from '@/lib/i18n';
function Inner({ me }) {
  const { t } = useT();
  const { id } = useParams(); const [post, setPost] = useState(null); const [nf, setNf] = useState(false);
  const load = async () => { const { data } = await supabase.from('posts').select(POST_SELECT).eq('id', id).maybeSingle(); data ? setPost(data) : setNf(true); };
  useEffect(() => { load(); }, [id]);
  return (<div><Link href="/">{t("← Home")}</Link><div style={{ height: '.7rem' }} />
    {nf && <div className="card">{t("This post was removed or is not visible to you.")}</div>}
    {!post && !nf && <p className="muted">{t("Loading…")}</p>}
    {post && <PostCard post={post} me={me} onChange={load} />}</div>);
}
export default function PostPage() { return <Shell>{me => <Inner me={me} />}</Shell>; }
