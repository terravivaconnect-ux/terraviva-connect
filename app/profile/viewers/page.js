'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import Avatar from '@/components/Avatar';
import BadgePills from '@/components/BadgePills';
import { fullName, timeAgo } from '@/lib/supabase';
import { useT } from '@/lib/i18n';
import { fetchProfileViewers } from '@/lib/badges';

const DAY = 864e5;

function Inner() {
  const { lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const [viewers, setViewers] = useState(null);
  const [err, setErr] = useState('');
  const [range, setRange] = useState('30');

  useEffect(() => {
    let alive = true;
    fetchProfileViewers(200).then((v) => alive && setViewers(v)).catch((e) => alive && setErr(e.message));
    return () => { alive = false; };
  }, []);

  const list = useMemo(() => {
    if (!viewers) return [];
    if (range === 'all') return viewers;
    const cutoff = Date.now() - Number(range) * DAY;
    return viewers.filter((v) => new Date(v.last_viewed_at).getTime() >= cutoff);
  }, [viewers, range]);
  const total = list.reduce((n, v) => n + Number(v.view_count || 0), 0);

  if (err) return <div className="err">{err}</div>;
  if (!viewers) return <p className="muted">{L('Loading…', 'Inapakia…')}</p>;

  return (
    <div>
      <h2>{L('Who viewed your profile', 'Walioangalia wasifu wako')}</h2>
      <p className="muted">{L(`${list.length} different people, ${total} views in total.`, `Watu ${list.length} tofauti, jumla ya mara ${total}.`)}</p>
      <div className="tabs">
        {[['7', L('7 days', 'Siku 7')], ['30', L('30 days', 'Siku 30')], ['all', L('All time', 'Zote')]].map(([k, label]) => (
          <button key={k} className={range === k ? 'on' : ''} onClick={() => setRange(k)}>{label}</button>
        ))}
      </div>
      {!list.length ? (
        <div className="card muted">
          <p>{L('Nobody has viewed your profile in this period yet.', 'Bado hakuna aliyeangalia wasifu wako katika kipindi hiki.')}</p>
          <p>{L('Complete your profile and join in the community so people can find you.', 'Kamilisha wasifu wako na ushiriki kwenye jamii ili watu wakuone.')}</p>
        </div>
      ) : (
        <div className="card">
          {list.map((v, i) => {
            const inner = (
              <>
                <Avatar p={v} size={44} />
                <div className="meta">
                  <b>{fullName(v)} {v.badge_ids?.length > 0 && <BadgePills ids={v.badge_ids.slice(0, 2)} size="sm" />}</b>
                  {v.headline && <small>{v.headline}</small>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <small>{timeAgo(v.last_viewed_at)}</small>
                  {Number(v.view_count) > 1 && <small>{L(`${v.view_count} times`, `mara ${v.view_count}`)}</small>}
                </div>
              </>
            );
            const key = v.viewer_id || `anon-${i}`;
            return v.is_anonymous || !v.username
              ? <div key={key} className="vrow">{inner}</div>
              : <Link key={key} className="vrow" href={`/profile/${v.username}`}>{inner}</Link>;
          })}
        </div>
      )}
      <small className="muted">{L('People you blocked, or who blocked you, are hidden. People whose profile you are not allowed to see appear as "Private user".', 'Watu uliowazuia, au waliokuzuia, hawaonekani. Watu ambao huruhusiwi kuona wasifu wao wanaonekana kama "Mtumiaji wa faragha".')}</small>
    </div>
  );
}
export default function ProfileViewers() { return <Shell>{() => <Inner />}</Shell>; }
