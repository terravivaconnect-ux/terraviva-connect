'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Avatar from '@/components/Avatar';
import { fullName, timeAgo } from '@/lib/supabase';
import { useT } from '@/lib/i18n';
import { STATUS_INFO, STATUS_TONE, getBadgeInfo, pick } from '@/lib/badgeInfo';
import { fetchBadgeRequests, fetchBadgeTypes, findProfileByUsername, grantBadge, reviewBadge } from '@/lib/badges';

const FILTERS = [
  ['pending', 'Pending', 'Zinasubiri'], ['under_review', 'Under review', 'Zinakaguliwa'], ['more_info', 'More info', 'Taarifa zaidi'],
  ['verified', 'Verified', 'Zilizothibitishwa'], ['suspended', 'Suspended', 'Zilizosimamishwa'], ['rejected', 'Rejected', 'Zilizokataliwa'],
  ['revoked', 'Removed', 'Zilizoondolewa'], ['expired', 'Expired', 'Zilizoisha muda'], ['all', 'All', 'Zote'],
];
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
  under_review: ['Start review', 'Anza ukaguzi'], verified: ['Approve', 'Idhinisha'], more_info: ['Request more info', 'Omba taarifa zaidi'],
  rejected: ['Reject', 'Kataa'], suspended: ['Suspend', 'Simamisha'], revoked: ['Remove', 'Ondoa'],
};
const NEEDS_REASON = ['more_info', 'rejected', 'suspended', 'revoked'];
const DANGER = ['rejected', 'revoked', 'suspended'];

export default function AdminBadges() {
  const { lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const [filter, setFilter] = useState('pending');
  const [rows, setRows] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchBadgeTypes().then(setTypes).catch(() => {}); }, []);
  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try { setRows(await fetchBadgeRequests(filter)); } catch (e) { setErr(e.message); } finally { setLoading(false); }
  }, [filter]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!msg) return undefined; const t = setTimeout(() => setMsg(''), 3500); return () => clearTimeout(t); }, [msg]);

  const typeById = useMemo(() => Object.fromEntries(types.map((t) => [t.id, t])), [types]);

  return (
    <div>
      <p className="muted">{L('Review evidence, approve, suspend or remove badges. Every decision is recorded in the history.', 'Kagua ushahidi, idhinisha, simamisha au ondoa beji. Kila uamuzi unarekodiwa kwenye historia.')}</p>
      {err && <div className="err">{err}</div>}
      {msg && <div className="ok">{msg}</div>}
      <div className="tabs">
        {FILTERS.map(([k, en, sw]) => <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{L(en, sw)}</button>)}
      </div>
      {loading ? <p className="muted">{L('Loading…', 'Inapakia…')}</p>
        : !rows.length ? <div className="card muted">{L('No requests in this group.', 'Hakuna maombi katika kundi hili.')}</div>
        : rows.map((r) => (
          <ReviewCard key={r.id} row={r} type={typeById[r.badge_id]} L={L} lang={lang}
            onDone={(m) => { setMsg(m); load(); }} onError={setErr} />
        ))}
      <GrantPanel types={types} L={L} onDone={(m) => { setMsg(m); load(); }} onError={setErr} />
    </div>
  );
}

function ReviewCard({ row, type, L, lang, onDone, onError }) {
  const [action, setAction] = useState(null);
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [expires, setExpires] = useState('');
  const [busy, setBusy] = useState(false);
  const p = row.profiles;
  const ev = row.badge_private;
  const st = STATUS_INFO[row.status];
  const info = getBadgeInfo(row.badge_id, lang);

  const run = async (status) => {
    if (NEEDS_REASON.includes(status) && !message.trim()) { onError(L('Write a reason for the user first.', 'Andika sababu kwa mtumiaji kwanza.')); return; }
    setBusy(true); onError('');
    try {
      await reviewBadge({ id: row.id, status, message, notes, expires });
      setAction(null); setMessage(''); setNotes(''); setExpires('');
      onDone(`${pick(ACTION_LABEL[status], lang)}: ${L('done.', 'imekamilika.')}`);
    } catch (e) { onError(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="card">
      <div className="post-h">
        <Avatar p={p} size={40} />
        <div className="meta">
          <b>{fullName(p)} {p?.username && <small className="muted">@{p.username}</small>}</b>
          <small>{p?.headline}</small>
        </div>
        <small className="muted">{timeAgo(row.updated_at)}</small>
      </div>
      <div>
        <span className="xbadge" style={{ marginLeft: 0 }}>✔ {type?.name || row.badge_id}</span>{' '}
        <span className={'stat ' + (STATUS_TONE[row.status] || '')}>{st ? pick(st, lang) : row.status}</span>
      </div>
      {row.detail && <p>{L('Role/organisation', 'Nafasi/taasisi')}: {row.detail}</p>}

      <details style={{ margin: '.5rem 0' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{L('Submitted evidence', 'Ushahidi uliowasilishwa')}</summary>
        <p className="muted">{L('Required', 'Unaohitajika')}: {info.evidence}</p>
        {ev?.evidence_text ? <p>{ev.evidence_text}</p> : <p className="muted">{L('No text provided.', 'Hakuna maelezo ya maandishi.')}</p>}
        {ev?.evidence_url && <p><a href={ev.evidence_url} target="_blank" rel="noopener noreferrer">{L('Open evidence link', 'Fungua kiungo cha ushahidi')}</a></p>}
        {ev?.consent_at && <small className="muted">{L('Consent given', 'Ridhaa ilitolewa')} {timeAgo(ev.consent_at)}</small>}
        {ev?.message_to_user && <p className="muted">{L('Last message to user', 'Ujumbe wa mwisho kwa mtumiaji')}: {ev.message_to_user}</p>}
      </details>
      {row.expires_at && <small className="muted">{L('Expires', 'Inaisha')}: {new Date(row.expires_at).toLocaleDateString()}</small>}

      {!action ? (
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.6rem' }}>
          {(ACTIONS[row.status] || []).map((s) => (
            <button key={s} className={DANGER.includes(s) ? 'red' : s === 'under_review' ? 'sec' : ''} disabled={busy}
              onClick={() => (s === 'under_review' ? run(s) : setAction(s))}>{pick(ACTION_LABEL[s], lang)}</button>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: '.6rem' }}>
          <h4>{pick(ACTION_LABEL[action], lang)}</h4>
          {NEEDS_REASON.includes(action) && (
            <textarea rows={2} placeholder={L('Short reason shown to the user', 'Sababu fupi itakayoonekana kwa mtumiaji')} value={message} onChange={(e) => setMessage(e.target.value)} />
          )}
          {action === 'verified' && (
            <><small className="muted">{L('Badge end date (optional)', 'Tarehe ya mwisho wa beji (si lazima)')}</small>
              <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} /></>
          )}
          <textarea rows={2} placeholder={L('Internal review notes (admins only)', 'Maelezo ya ukaguzi (ya ndani, kwa Admin pekee)')} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button className="sec" onClick={() => setAction(null)}>{L('Cancel', 'Ghairi')}</button>{' '}
          <button disabled={busy} onClick={() => run(action)}>{busy ? '…' : L('Confirm decision', 'Thibitisha uamuzi')}</button>
        </div>
      )}
    </div>
  );
}

function GrantPanel({ types, L, onDone, onError }) {
  const [username, setUsername] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [detail, setDetail] = useState('');
  const [expires, setExpires] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); onError('');
    if (!username.trim() || !badgeId) { onError(L('Enter a username and choose a badge.', 'Weka username na uchague beji.')); return; }
    setBusy(true);
    try {
      const profile = await findProfileByUsername(username);
      if (!profile) throw new Error(L('No user with that username.', 'Hakuna mtumiaji mwenye username hiyo.'));
      await grantBadge({ userId: profile.id, badgeId, detail, expires, notes });
      setUsername(''); setDetail(''); setNotes(''); setExpires('');
      onDone(L(`Badge granted to ${fullName(profile)}.`, `Beji imetolewa kwa ${fullName(profile)}.`));
    } catch (er) { onError(er.message); } finally { setBusy(false); }
  };

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <h3>{L('Grant a badge directly', 'Toa beji moja kwa moja')}</h3>
      <form onSubmit={submit}>
        <input placeholder={L('Username, e.g. @jina', 'Username, mfano @jina')} value={username} onChange={(e) => setUsername(e.target.value)} />
        <select value={badgeId} onChange={(e) => setBadgeId(e.target.value)}>
          <option value="">{L('Choose a badge…', 'Chagua beji…')}</option>
          {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input placeholder={L('Role/organisation (optional)', 'Nafasi/taasisi (si lazima)')} value={detail} onChange={(e) => setDetail(e.target.value)} />
        <small className="muted">{L('End date (optional)', 'Tarehe ya mwisho (si lazima)')}</small>
        <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
        <textarea rows={2} placeholder={L('Reason (recorded in history)', 'Sababu (inarekodiwa kwenye historia)')} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button disabled={busy}>{busy ? '…' : L('Grant badge', 'Toa beji')}</button>
      </form>
    </div>
  );
}
