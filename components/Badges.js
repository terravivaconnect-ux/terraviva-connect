'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useT } from '@/lib/i18n';
import BadgePills from '@/components/BadgePills';

const Leaf = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill="#fff" opacity=".25" />
    <path d="M12 19v-7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M12 13c-3.6 0-5.2-2.3-5.2-4.7 3.1 0 5.2 1.7 5.2 4.7z" fill="#fff" />
    <path d="M12 11.6c0-3.1 1.9-5 5.2-5 0 2.9-1.7 5-5.2 5z" fill="#fff" />
  </svg>
);
const Check = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill="#fff" opacity=".25" />
    <path d="M7 12.5l3.2 3.2L17 8.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Building = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill="#fff" opacity=".25" />
    <path d="M7 17V8.5L12 6l5 2.5V17M10 17v-3h4v3M9.5 10.5h1M13.5 10.5h1" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/*
 * Beji zote za mtu zinaonyesha kila mahali jina lake linapoonekana.
 * Kama kipengele cha `p` hakina badge_ids (mfano machapisho, maoni, miradi, utafutaji),
 * beji zinatafutwa kwa id au username, kwa maombi machache yaliyokusanywa pamoja na kuhifadhiwa.
 */
const FIELDS = 'id,username,badge_ids,is_beneficiary_verified,is_professional_verified,is_org_verified';
const cache = new Map();   // 'id:<id>' | 'u:<username>' -> row | null
const waiting = new Map(); // key -> Set<callback>
let timer = null;

async function resolve(col, values, prefix) {
  if (!values.length) return;
  let rows = [];
  try {
    const { data } = await supabase.from('profiles').select(FIELDS).in(col, values);
    rows = data || [];
  } catch { /* hakuna beji za ziada */ }
  const byVal = new Map(rows.map((r) => [r[col], r]));
  values.forEach((v) => {
    const key = prefix + v;
    const row = byVal.get(v) || null;
    cache.set(key, row);
    (waiting.get(key) || []).forEach((cb) => cb(row));
    waiting.delete(key);
  });
}

function flush() {
  timer = null;
  const keys = [...waiting.keys()];
  resolve('id', keys.filter((k) => k.startsWith('id:')).map((k) => k.slice(3)), 'id:');
  resolve('username', keys.filter((k) => k.startsWith('u:')).map((k) => k.slice(2)), 'u:');
}

function useFullProfile(p) {
  const key = !p || p.badge_ids !== undefined ? null : p.id ? 'id:' + p.id : p.username ? 'u:' + p.username : null;
  const [row, setRow] = useState(() => (key && cache.has(key) ? cache.get(key) : undefined));
  useEffect(() => {
    if (!key) return undefined;
    if (cache.has(key)) { setRow(cache.get(key)); return undefined; }
    const cb = (r) => setRow(r);
    if (!waiting.has(key)) waiting.set(key, new Set());
    waiting.get(key).add(cb);
    if (!timer) timer = setTimeout(flush, 40);
    return () => { waiting.get(key)?.delete(cb); };
  }, [key]);
  return key && row ? { ...p, ...row } : p;
}

export default function Badges({ p: base }) {
  const { lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const p = useFullProfile(base);
  if (!p) return null;
  return (<>
    {p.is_beneficiary_verified && <span className="tbadge ben" title={L('Verified Terraviva Beneficiary', 'Mnufaika Aliyethibitishwa wa Terraviva')}><Leaf />{L('Beneficiary', 'Mnufaika')}</span>}
    {p.is_professional_verified && <span className="tbadge pro" title={L('Verified Professional', 'Mtaalamu Aliyethibitishwa')}><Check />{L('Professional', 'Mtaalamu')}</span>}
    {p.is_org_verified && <span className="tbadge org" title={L('Verified Organization', 'Shirika Lililothibitishwa')}><Building />{L('Organization', 'Shirika')}</span>}
    <BadgePills ids={p.badge_ids} />
  </>);
}
