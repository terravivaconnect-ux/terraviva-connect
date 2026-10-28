'use client';
import Shell from '@/components/Shell';
import Feed from '@/components/Feed';
import SidePanel from '@/components/SidePanel';
import { useT } from '@/lib/i18n';
export default function HomeApp() {
  const { t } = useT();
  return (<Shell>{me => (<>
    <div className="hero"><h2>{t('Welcome')}, {me.first_name || me.username} 🌍</h2><div>{t('Connect. Share Knowledge. Empower Communities. Protect Nature.')}</div></div>
    <div className="home-grid"><Feed me={me} /><SidePanel me={me} /></div>
  </>)}</Shell>);
}
