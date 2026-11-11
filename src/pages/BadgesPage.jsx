import { useCallback, useEffect, useMemo, useState } from 'react';
import BadgePill from '../components/BadgePill';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  GENERAL_RULES,
  STATUS_INFO,
  getBadgeInfo,
} from '../data/badgeInfo';
import {
  fetchBadgeTypes,
  fetchMyBadges,
  requestBadge,
  withdrawBadgeRequest,
} from '../lib/badgesApi';
import '../styles/badges.css';

const OPEN = ['pending', 'under_review', 'more_info', 'verified', 'suspended', 'revoked'];
const CAN_WITHDRAW = ['pending', 'more_info', 'rejected', 'expired'];

/**
 * Ukurasa wa "Badges zangu" na "Omba Badge".
 * Props: userId (id ya mtumiaji aliyeingia)
 */
export default function BadgesPage({ userId }) {
  const [types, setTypes] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [t, m] = await Promise.all([fetchBadgeTypes(), fetchMyBadges(userId)]);
      setTypes(t);
      setMine(m);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const typeById = useMemo(() => Object.fromEntries(types.map((t) => [t.id, t])), [types]);
  const mineByBadge = useMemo(() => Object.fromEntries(mine.map((m) => [m.badge_id, m])), [mine]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATEGORY_ORDER.map((cat) => ({
      cat,
      items: types.filter(
        (t) =>
          t.category === cat &&
          (!q ||
            t.name.toLowerCase().includes(q) ||
            getBadgeInfo(t.id).meaning.toLowerCase().includes(q))
      ),
    })).filter((g) => g.items.length);
  }, [types, query]);

  const withdraw = async (m) => {
    if (!window.confirm('Unataka kuondoa ombi hili?')) return;
    try {
      await withdrawBadgeRequest(m.id);
      setToast('Ombi limeondolewa.');
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className="tvb-page tvb-muted">Inapakia badges…</div>;

  return (
    <div className="tvb-page">
      <header className="tvb-head">
        <h1>Badges</h1>
        <p className="tvb-muted">
          Badge inaonyesha nafasi au mchango wako uliothibitishwa. Chagua badge, soma vigezo, kisha tuma ushahidi.
        </p>
      </header>

      {error && (
        <div className="tvb-alert" role="alert">
          {error}
        </div>
      )}
      {toast && (
        <div className="tvb-toast" role="status">
          {toast}
        </div>
      )}

      <section className="tvb-section" aria-labelledby="tvb-mine">
        <h2 id="tvb-mine">Badges zangu</h2>
        {mine.length === 0 ? (
          <p className="tvb-muted">Bado hujaomba badge yoyote. Chagua moja hapa chini.</p>
        ) : (
          <ul className="tvb-list">
            {mine.map((m) => {
              const type = typeById[m.badge_id];
              const st = STATUS_INFO[m.status] || { label: m.status, hint: '' };
              const msg = m.badge_private?.message_to_user;
              return (
                <li key={m.id} className="tvb-row">
                  <div className="tvb-row__main">
                    <BadgePill badge={type || { id: m.badge_id, name: m.badge_id }} />
                    <span className={`tvb-status tvb-status--${m.status}`}>{st.label}</span>
                  </div>
                  <p className="tvb-muted">{st.hint}</p>
                  {msg && (
                    <p className="tvb-note">
                      <strong>Ujumbe kutoka kwa Admin:</strong> {msg}
                    </p>
                  )}
                  {m.status === 'verified' && m.expires_at && (
                    <p className="tvb-muted">
                      Inaisha: {new Date(m.expires_at).toLocaleDateString('sw-TZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  <div className="tvb-actions">
                    {['more_info', 'rejected', 'expired'].includes(m.status) && type?.requestable && (
                      <button type="button" className="tvb-btn" onClick={() => setSelected(type)}>
                        Tuma ombi tena
                      </button>
                    )}
                    {CAN_WITHDRAW.includes(m.status) && (
                      <button type="button" className="tvb-btn tvb-btn--ghost" onClick={() => withdraw(m)}>
                        Ondoa ombi
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="tvb-section" aria-labelledby="tvb-rules">
        <h2 id="tvb-rules">Kanuni muhimu</h2>
        <ul className="tvb-rules">
          {GENERAL_RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section className="tvb-section" aria-labelledby="tvb-catalog">
        <h2 id="tvb-catalog">Omba badge</h2>
        <input
          className="tvb-input"
          type="search"
          placeholder="Tafuta badge, mfano: Volunteer au Mbunge"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Tafuta badge"
        />
        {grouped.length === 0 && <p className="tvb-muted">Hakuna badge iliyopatikana.</p>}
        {grouped.map(({ cat, items }) => (
          <div key={cat} className="tvb-cat">
            <h3>{CATEGORY_LABELS[cat]}</h3>
            <ul className="tvb-grid">
              {items.map((t) => {
                const info = getBadgeInfo(t.id);
                const existing = mineByBadge[t.id];
                const blocked = existing && OPEN.includes(existing.status);
                return (
                  <li key={t.id} className="tvb-card">
                    <BadgePill badge={t} />
                    <p>{info.meaning}</p>
                    {blocked ? (
                      <span className={`tvb-status tvb-status--${existing.status}`}>
                        {STATUS_INFO[existing.status]?.label}
                      </span>
                    ) : t.requestable ? (
                      <button type="button" className="tvb-btn" onClick={() => setSelected(t)}>
                        Soma vigezo na uombe
                      </button>
                    ) : (
                      <span className="tvb-muted">Hutolewa na Admin pekee</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      {selected && (
        <RequestDialog
          badge={selected}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            setToast('Ombi limetumwa. Linasubiri uthibitisho.');
            load();
          }}
        />
      )}
    </div>
  );
}

function RequestDialog({ badge, onClose, onDone }) {
  const info = getBadgeInfo(badge.id);
  const [detail, setDetail] = useState('');
  const [evidenceText, setEvidenceText] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!evidenceText.trim() && !evidenceUrl.trim()) {
      setError('Weka angalau maelezo ya ushahidi au kiungo (link).');
      return;
    }
    if (!consent) {
      setError('Tafadhali kubali matumizi ya ushahidi wako.');
      return;
    }
    setBusy(true);
    try {
      await requestBadge({ badgeId: badge.id, detail, evidenceText, evidenceUrl });
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="tvb-overlay" role="dialog" aria-modal="true" aria-labelledby="tvb-dlg-title" onClick={onClose}>
      <form className="tvb-dialog" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2 id="tvb-dlg-title">Omba {badge.name} Badge</h2>
        <dl className="tvb-def">
          <dt>Maana</dt>
          <dd>{info.meaning}</dd>
          <dt>Ushahidi unaohitajika</dt>
          <dd>{info.evidence}</dd>
        </dl>

        <label className="tvb-field">
          <span>Nafasi au taasisi yako (hiari)</span>
          <input className="tvb-input" value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Mfano: Mkurugenzi, Terraviva" />
        </label>
        <label className="tvb-field">
          <span>Maelezo ya ushahidi</span>
          <textarea className="tvb-input" rows={4} value={evidenceText} onChange={(e) => setEvidenceText(e.target.value)} placeholder="Eleza ushahidi wako au jinsi Admin anavyoweza kuuthibitisha." />
        </label>
        <label className="tvb-field">
          <span>Kiungo cha ushahidi (link)</span>
          <input className="tvb-input" type="url" value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} placeholder="https://" />
        </label>

        <label className="tvb-check">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            Nakubali Admin akague ushahidi huu. Utaonekana kwa Admin pekee na hautaonekana kwenye profile ya umma.
          </span>
        </label>

        {error && (
          <div className="tvb-alert" role="alert">
            {error}
          </div>
        )}
        <div className="tvb-actions">
          <button type="button" className="tvb-btn tvb-btn--ghost" onClick={onClose}>
            Funga
          </button>
          <button type="submit" className="tvb-btn" disabled={busy}>
            {busy ? 'Inatuma…' : 'Tuma ombi'}
          </button>
        </div>
      </form>
    </div>
  );
}
