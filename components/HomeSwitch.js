'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import HomeApp from '@/components/HomeApp';

// Visitors (and search engines) see the public landing page; signed-in members see their feed.
export default function HomeSwitch({ landing }) {
  const [mode, setMode] = useState('check');
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setMode(data.session ? 'app' : 'public')); }, []);
  if (mode === 'app') return <HomeApp />;
  return <div className="landing-wrap">{landing}</div>;
}
