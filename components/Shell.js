'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import LangSwitch from '@/components/LangSwitch';
import { useT } from '@/lib/i18n';

export const Ctx = { me: null };
const NAV = [['/', '🏠', 'Home'], ['/network', '🤝', 'My Network'], ['/communities', '🌍', 'Communities'], ['/messages', '💬', 'Messages'],
  ['/notifications', '🔔', 'Notifications'], ['/events', '📅', 'Events'], ['/opportunities', '💼', 'Opportunities'], ['/projects', '🌱', 'Projects'], ['/resources', '📚', 'Resources'], ['/saved', '🔖', 'Saved'], ['/search', '🔍', 'Search']];

export default function Shell({ children, staffOnly }) {
  const { t } = useT();
  const router = useRouter(); const path = usePathname();
  const [me, setMe] = useState(null); const [unread, setUnread] = useState(0); const [ready, setReady] = useState(false);

  useEffect(() => {
    let ch;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace('/login');
      const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (p?.status !== 'active') { await supabase.auth.signOut(); return router.replace('/login'); }
      setMe(p); Ctx.me = p; setReady(true);
      const load = async () => {
        const { count } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', p.id).eq('is_read', false);
        setUnread(count || 0);
      };
      load();
      ch = supabase.channel('notif-' + p.id).on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${p.id}` }, load).subscribe();
    })();
    return () => { if (ch) supabase.removeChannel(ch); };
  }, [router]);

  if (!ready) return <div className="auth"><img src="/logo.png" width="120" alt="Terraviva" /></div>;
  if (staffOnly && me.role === 'member') return <div className="main">Not authorised.</div>;
  const logout = async () => { await supabase.auth.signOut(); router.replace('/login'); };
  const items = [...NAV, [`/profile/${me.username}`, '👤', 'My Profile'], ['/settings', '⚙️', 'Settings']];
  if (me.role !== 'member') items.push(['/admin', '🛡️', 'Admin']);
  return (
    <div className="shell">
      <nav className="side">
        <img className="logo" src="/logo.png" alt="Terraviva Connect" />
        {items.map(([h, i, l]) => (
          <Link key={h} href={h} className={'nav' + (path === h ? ' act' : '')}>
            <span>{i}</span><span className="lbl">{t(l)}</span>
            {l === 'Notifications' && unread > 0 && <span className="cnt">{unread}</span>}
          </Link>))}
        <div className="hide-m" style={{ marginTop: 'auto', padding: '.4rem .9rem' }}><LangSwitch /></div>
        <a className="nav hide-m" style={{ cursor: 'pointer' }} onClick={logout}><span>🚪</span><span className="lbl">{t("Log out")}</span></a>
      </nav>
      <main className="main">{typeof children === 'function' ? children(me) : children}</main>
    </div>
  );
}
