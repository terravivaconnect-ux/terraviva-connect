'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import BadgePills from '@/components/BadgePills';

/*
 * Beji zote za mtu (Professional, Organization, Beneficiary, Founder, CEO n.k.) zinaonyesha kwa muonekano mmoja mpya:
 * rangi na nembo kulingana na cheo, kila mahali jina lake linapoonekana.
 * Kama kipengele cha `p` hakina badge_ids (mfano machapisho, maoni, miradi, utafutaji),
 * beji zinatafutwa kwa id au username, kwa maombi machache yaliyokusanywa pamoja na kuhifadhiwa.
 */
const FIELDS = 'id,username,badge_ids';
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
  const p = useFullProfile(base);
  if (!p) return null;
  return <BadgePills ids={p.badge_ids} />;
}
