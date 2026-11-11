'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useT } from '@/lib/i18n';
import { getBadgeInfo } from '@/lib/badgeInfo';

// Majina ya beji huchukuliwa mara moja na kuhifadhiwa kwa matumizi ya kila mahali.
let cache = null;
let inflight = null;

export function useBadgeTypes() {
  const [types, setTypes] = useState(cache || {});
  useEffect(() => {
    if (cache) return;
    if (!inflight) {
      inflight = supabase.from('badge_types').select('id,name,category,rank').eq('active', true).then(({ data }) => {
        if (data) cache = Object.fromEntries(data.map((b) => [b.id, b]));
        inflight = null;
        return cache;
      });
    }
    inflight.then((c) => { if (c) setTypes(c); });
  }, []);
  return types;
}

/** Beji zilizothibitishwa zinazotoka kwenye profiles.badge_ids */
export default function BadgePills({ ids, size }) {
  const types = useBadgeTypes();
  const { lang } = useT();
  if (!ids || !ids.length) return null;
  return (
    <>
      {ids.map((id) => (
        <span key={id} className={'xbadge' + (size === 'sm' ? ' sm' : '')} title={getBadgeInfo(id, lang).meaning}>
          ✔ {types[id]?.name || id}
        </span>
      ))}
    </>
  );
}
