import { useCallback, useEffect, useMemo, useState } from 'react';
import BadgePill from '../components/BadgePill';
import { STATUS_INFO, getBadgeInfo } from '../data/badgeInfo';
import {
  checkIsAdmin,
  fetchBadgeRequests,
  fetchBadgeTypes,
  findProfileByUsername,
  grantBadge,
  reviewBadge,
  timeAgoSw,
} from '../lib/badgesApi';
import '../styles/badges.css';

const FILTERS = [
  ['pending', 'Zinasubiri'],
  ['under_review', 'Zinakaguliwa'],
  ['more_info', 'Taarifa zaidi'],
  ['verified', 'Zilizothibitishwa'],
  ['suspended', 'Zilizosimamishwa'],
  ['rejected', 'Zilizokataliwa'],
  ['revoked', 'Zilizoondolewa'],
  ['expired', 'Zilizoisha muda'],
  ['all', 'Zote'],
];

// Vitendo vinavyoruhusiwa kwa kila hali ya sasa.
const ACTIONS = {
  pending: ['under_review', 'verified', 'more_info', 'rejected'],
  under_review: ['verified', 'more_info', 'rejected'],
  more_info: ['under_review', 'verified', 'rejected'],
  verified: ['suspended', 'revoked'],
  suspended: ['verified', 'revoked'],
  rejected: ['under_review', 'verified'],
  revoked: ['verified'],
  expired: ['verified', 'revoked'],
};

const ACTION_LABEL = {
  under_review: 'Anza ukaguzi',
  verified: 'Idhinisha',
  more_info: 'Omba taarifa zaidi',
  rejected: 'Kataa',
  suspended: 'Simamisha',
  revoked: 'Ondoa',
};

// Vitendo vinavyohitaji sababu/ujumbe kwa mtumiaji.
const NEEDS_REASON = ['more_info', 'rejected', 'suspended', 'revoked'];

const fullName = (p) => [p?.first_name, p?.last_name].filter(Boolean).join(' ') || p?.username || 'Mtumiaji';

/** Ukurasa wa Admin: Badge Verification & Management. */
export default function AdminBadgesPage() {
  const [allowed, setAllowed] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [rows, setRows] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    checkIsAdmin().then(setAllowed);
    fetchBadgeTypes().then(setTypes).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await fetchBadgeRequests(filter));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (allowed) load();
  }, [allowed, load]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const typeById = useMemo(() => Object.fromEntries(types.map((t) => [t.id, t])), [types]);

  if (allowed === null) return <div className="tvb-page tvb-muted">Inakagua ruhusa…</div>;
  if (!allowed) return <div className="tvb-page tvb-alert">Ukurasa huu ni wa Admin pekee.</div>;

  return (
    <div className="tvb-page">
      <header className="tvb-head">
        <h1>Badge Verification &amp; Management</h1>
        <p className="tvb-muted">Kagua ushahidi, idhinisha, simamisha au ondoa badges. Kila uamuzi unarekodiwa kwenye historia.</p>
      </header>

      {error && <div className="tvb-alert" role="alert">{error}</div>}
      {toast && <div className="tvb-toast" role="status">{toast}</div>}

      <div className="tvb-tabs" role="tablist" aria-label="Chuja kwa hali">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            className={`tvb-tab${filter === key ? ' is-active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="tvb-muted">Inapakia maombi…</p>
      ) : rows.length === 0 ? (
        <p className="tvb-muted">Hakuna maombi katika kundi hili.</p>
      ) : (
        <ul className="tvb-list">
          {rows.map((r) => (
            <ReviewCard
              key={r.id}
              row={r}
              type={typeById[r.badge_id]}
              onDone={(msg) => {
                setToast(msg);
                load();
              }}
              onError={setError}
            />
          ))}
        </ul>
      )}

      <GrantPanel types={types} onDone={(msg) => { setToast(msg); load(); }} onError={setError} />
    </div>
  );
}

function ReviewCard({ row, type, onDone, onError }) {
  const [action, setAction] = useState(null);
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [expires, setExpires] = useState('');
  const [busy, setBusy] = useState(false);
  const p = row.profiles;
  const ev = row.badge_private;
  const st = STATUS_INFO[row.status] || { label: row.status };
  const info = getBadgeInfo(row.badge_id);

  const run = async (status) => {
    if (NEEDS_REASON.includes(status) && !message.trim()) {
      onError('Andika sababu kwa mtumiaji kabla ya kuendelea.');
      return;
    }
    setBusy(true);
    onError('');
    try {
      await reviewBadge({ id: row.id, status, message, notes, expires });
      setAction(null);
      setMessage('');
      setNotes('');
      setExpires('');
      onDone(`${ACTION_LABEL[status]}: imekamilika.`);
    } catch (e) {
      onError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const click = (status) => {
    if (status === 'under_review') return run(status);
    return setAction(status);
  };

  return (
    <li className="tvb-row">
      <div className="tvb-row__main">
        <BadgePill badge={type || { id: row.badge_id, name: row.badge_id }} />
        <span className={`tvb-status tvb-status--${row.status}`}>{st.label}</span>
        <span className="tvb-muted">{timeAgoSw(row.updated_at)}</span>
      </div>

      <p>
        <strong>{fullName(p)}</strong>
        {p?.username && <span className="tvb-muted"> @{p.username}</span>}
        {p?.headline && <span className="tvb-muted"> · {p.headline}</span>}
      </p>
      {row.detail && <p>Nafasi/taasisi: {row.detail}</p>}

      <details className="tvb-evidence">
        <summary>Ushahidi uliowasilishwa</summary>
        <p className="tvb-muted">Unaohitajika: {info.evidence}</p>
        {ev?.evidence_text ? <p className="tvb-pre">{ev.evidence_text}</p> : <p className="tvb-muted">Hakuna maelezo ya maandishi.</p>}
        {ev?.evidence_url && (
          <p>
            <a href={ev.evidence_url} target="_blank" rel="noopener noreferrer">
              Fungua kiungo cha ushahidi
            </a>
          </p>
        )}
        {ev?.consent_at && <p className="tvb-muted">Ridhaa ilitolewa {timeAgoSw(ev.consent_at)}.</p>}
        {ev?.message_to_user && <p className="tvb-note">Ujumbe wa mwisho kwa mtumiaji: {ev.message_to_user}</p>}
      </details>

      {row.expires_at && <p className="tvb-muted">Inaisha: {new Date(row.expires_at).toLocaleDateString('sw-TZ')}</p>}

      {!action && (
        <div className="tvb-actions">
          {(ACTIONS[row.status] || []).map((s) => (
            <button
              key={s}
              type="button"
              className={`tvb-btn${['rejected', 'revoked', 'suspended'].includes(s) ? ' tvb-btn--danger' : ''}`}
              disabled={busy}
              onClick={() => click(s)}
            >
              {ACTION_LABEL[s]}
            </button>
          ))}
        </div>
      )}

      {action && (
        <div className="tvb-panel">
          <h3>{ACTION_LABEL[action]}</h3>
          {NEEDS_REASON.includes(action) && (
            <label className="tvb-field">
              <span>Sababu fupi kwa mtumiaji (inaonekana kwake)</span>
              <textarea className="tvb-input" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} />
            </label>
          )}
          {action === 'verified' && (
            <label className="tvb-field">
              <span>Tarehe ya mwisho wa badge (hiari, acha tupu kama haina muda)</span>
              <input className="tvb-input" type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
            </label>
          )}
          <label className="tvb-field">
            <span>Maelezo ya ukaguzi (ya ndani, kwa Admin)</span>
            <textarea className="tvb-input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <div className="tvb-actions">
            <button type="button" className="tvb-btn tvb-btn--ghost" onClick={() => setAction(null)}>
              Ghairi
            </button>
            <button type="button" className="tvb-btn" disabled={busy} onClick={() => run(action)}>
              {busy ? 'Inatekeleza…' : 'Thibitisha uamuzi'}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

/** Admin anaweza kutoa badge moja kwa moja (mfano Moderator, Pioneer, Top Contributor). */
function GrantPanel({ types, onDone, onError }) {
  const [username, setUsername] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [detail, setDetail] = useState('');
  const [expires, setExpires] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    onError('');
    if (!username.trim() || !badgeId) {
      onError('Weka username na uchague badge.');
      return;
    }
    setBusy(true);
    try {
      const profile = await findProfileByUsername(username);
      if (!profile) throw new Error('Hakuna mtumiaji mwenye username hiyo.');
      await grantBadge({ userId: profile.id, badgeId, detail, expires, notes });
      setUsername('');
      setDetail('');
      setNotes('');
      setExpires('');
      onDone(`Badge imetolewa kwa ${fullName(profile)}.`);
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="tvb-section" aria-labelledby="tvb-grant">
      <h2 id="tvb-grant">Toa badge moja kwa moja</h2>
      <form className="tvb-panel" onSubmit={submit}>
        <label className="tvb-field">
          <span>Username ya mtumiaji</span>
          <input className="tvb-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@jina" />
        </label>
        <label className="tvb-field">
          <span>Badge</span>
          <select className="tvb-input" value={badgeId} onChange={(e) => setBadgeId(e.target.value)}>
            <option value="">Chagua badge…</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="tvb-field">
          <span>Nafasi/taasisi (hiari)</span>
          <input className="tvb-input" value={detail} onChange={(e) => setDetail(e.target.value)} />
        </label>
        <label className="tvb-field">
          <span>Tarehe ya mwisho (hiari)</span>
          <input className="tvb-input" type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
        </label>
        <label className="tvb-field">
          <span>Sababu ya kutoa (inarekodiwa kwenye historia)</span>
          <textarea className="tvb-input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <div className="tvb-actions">
          <button type="submit" className="tvb-btn" disabled={busy}>
            {busy ? 'Inatoa…' : 'Toa badge'}
          </button>
        </div>
      </form>
    </section>
  );
}
