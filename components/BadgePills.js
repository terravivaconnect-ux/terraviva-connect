'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useT } from '@/lib/i18n';
import { getBadgeInfo } from '@/lib/badgeInfo';
import './badge-chips.css';

// Majina, rangi na nembo za beji huchukuliwa mara moja na kuhifadhiwa kwa matumizi ya kila mahali.
let cache = null;
let inflight = null;

export function useBadgeTypes() {
  const [types, setTypes] = useState(cache || {});
  useEffect(() => {
    if (cache) return;
    if (!inflight) {
      inflight = supabase.from('badge_types').select('id,name,category,tone,icon,rank').eq('active', true).then(({ data }) => {
        if (data) cache = Object.fromEntries(data.map((b) => [b.id, b]));
        inflight = null;
        return cache;
      });
    }
    inflight.then((c) => { if (c) setTypes(c); });
  }, []);
  return types;
}

/** Beji moja: rangi na nembo kulingana na cheo. type = safu ya badge_types, au id tu. */
export function BadgeChip({ type, id, size, flush }) {
  const { lang } = useT();
  const bid = type?.id || id;
  return (
    <span className={'bchip t-' + (type?.tone || 'teal') + (size === 'sm' ? ' sm' : '') + (flush ? ' flush' : '')} title={getBadgeInfo(bid, lang).meaning}>
      <span className="bchip-i" aria-hidden="true">{type?.icon || '✔'}</span>{type?.name || id}
    </span>
  );
}

/** Beji zote zilizothibitishwa zinazotoka kwenye profiles.badge_ids */
export default function BadgePills({ ids, size }) {
  const types = useBadgeTypes();
  if (!ids || !ids.length) return null;
  return (
    <>
      {ids.map((id) => <BadgeChip key={id} id={id} type={types[id]} size={size} />)}
    </>
  );
}
