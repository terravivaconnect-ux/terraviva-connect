import { useEffect, useMemo, useState } from 'react';
import BadgePill from '../components/BadgePill';
import { fetchBadgeTypes, fetchProfileViewers, timeAgoSw } from '../lib/badgesApi';
import '../styles/badges.css';

const DAY = 24 * 60 * 60 * 1000;

const initials = (v) =>
  ((v.first_name || '?')[0] + ((v.last_name || '')[0] || '')).toUpperCase();

/**
 * "Walioangalia profile yako" — kila mtumiaji anaona orodha ya watu walioangalia profile yake.
 * Props:
 *   profileHref(viewer) -> njia ya profile ya mtazamaji (default: /profile/<username>)
 *   onOpenProfile(viewer) -> hiari, kama unatumia navigate() badala ya link
 */
export default function ProfileViewersPage({
  profileHref = (v) => `/profile/${v.username}`,
  onOpenProfile,
}) {
  const [viewers, setViewers] = useState(null);
  const [types, setTypes] = useState([]);
  const [error, setError] = useState('');
  const [range, setRange] = useState('30');

  useEffect(() => {
    let alive = true;
    Promise.all([fetchProfileViewers(200), fetchBadgeTypes().catch(() => [])])
      .then(([v, t]) => {
        if (!alive) return;
        setViewers(v);
        setTypes(t);
      })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const typeById = useMemo(() => Object.fromEntries(types.map((t) => [t.id, t])), [types]);

  const filtered = useMemo(() => {
    if (!viewers) return [];
    if (range === 'all') return viewers;
    const cutoff = Date.now() - Number(range) * DAY;
    return viewers.filter((v) => new Date(v.last_viewed_at).getTime() >= cutoff);
  }, [viewers, range]);

  const totalViews = filtered.reduce((n, v) => n + Number(v.view_count || 0), 0);

  if (error) return <div className="tvb-page tvb-alert" role="alert">{error}</div>;
  if (!viewers) return <div className="tvb-page tvb-muted">Inapakia…</div>;

  return (
    <div className="tvb-page">
      <header className="tvb-head">
        <h1>Walioangalia profile yako</h1>
        <p className="tvb-muted">
          Watu {filtered.length} tofauti, jumla ya mara {totalViews}.
        </p>
      </header>

      <div className="tvb-tabs" role="tablist" aria-label="Kipindi">
        {[
          ['7', 'Siku 7'],
          ['30', 'Siku 30'],
          ['all', 'Zote'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={range === key}
            className={`tvb-tab${range === key ? ' is-active' : ''}`}
            onClick={() => setRange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="tvb-empty">
          <p>Bado hakuna aliyeangalia profile yako katika kipindi hiki.</p>
          <p className="tvb-muted">Kamilisha profile yako na ushiriki kwenye jamii ili watu wakuone.</p>
        </div>
      ) : (
        <ul className="tvb-list">
          {filtered.map((v, i) => {
            const body = (
              <>
                <span className="tvb-avatar" aria-hidden="true">
                  {v.avatar_url ? <img src={v.avatar_url} alt="" loading="lazy" /> : initials(v)}
                </span>
                <span className="tvb-viewer__text">
                  <strong>
                    {v.first_name} {v.last_name}
                  </strong>
                  {v.headline && <span className="tvb-muted">{v.headline}</span>}
                  {v.badge_ids?.length > 0 && (
                    <span className="tvb-viewer__badges">
                      {v.badge_ids.slice(0, 3).map((id) => (
                        <BadgePill key={id} size="sm" badge={typeById[id] || { id, name: id }} />
                      ))}
                    </span>
                  )}
                </span>
                <span className="tvb-viewer__meta">
                  <span>{timeAgoSw(v.last_viewed_at)}</span>
                  {Number(v.view_count) > 1 && <span className="tvb-muted">mara {v.view_count}</span>}
                </span>
              </>
            );

            const key = v.viewer_id || `anon-${i}`;
            if (v.is_anonymous || !v.username) {
              return (
                <li key={key} className="tvb-viewer">
                  <div className="tvb-viewer__link">{body}</div>
                </li>
              );
            }
            return (
              <li key={key} className="tvb-viewer">
                {onOpenProfile ? (
                  <button type="button" className="tvb-viewer__link" onClick={() => onOpenProfile(v)}>
                    {body}
                  </button>
                ) : (
                  <a className="tvb-viewer__link" href={profileHref(v)}>
                    {body}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="tvb-muted tvb-foot">
        Watu waliozuia au waliozuiwa nawe hawaonekani. Watumiaji wenye profile ya faragha wanaonekana kama "Mtumiaji wa faragha".
      </p>
    </div>
  );
}
