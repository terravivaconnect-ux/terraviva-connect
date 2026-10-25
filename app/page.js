'use client';
import Shell from '@/components/Shell';
import Feed from '@/components/Feed';
export default function Home() {
  return (<Shell>{me => (<>
    <div className="hero"><h2>Welcome, {me.first_name || me.username} 🌍</h2><div>Connect. Share Knowledge. Empower Communities. Protect Nature.</div></div>
    <Feed me={me} />
  </>)}</Shell>);
}
