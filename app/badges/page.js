'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Shell from '@/components/Shell';
import { useT } from '@/lib/i18n';
import { timeAgo } from '@/lib/supabase';
import {
  CATEGORY_LABELS, CATEGORY_ORDER, GENERAL_RULES, STATUS_INFO, STATUS_TONE, getBadgeInfo, pick,
} from '@/lib/badgeInfo';
import { fetchBadgeTypes, fetchMyBadges, requestBadge, withdrawBadgeRequest } from '@/lib/badges';

const OPEN = ['pending', 'under_review', 'more_info', 'verified', 'suspended', 'revoked'];
const CAN_WITHDRAW = ['pending', 'more_info', 'rejected', 'expired'];

function Inner({ me }) {
  const { lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const [types, setTypes] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);

  const load = useCallback(async () => {
    setErr('');
    try {
      const [t, m] = await Promise.all([fetchBadgeTypes(), fetchMyBadges(me.id)]);
      setTypes(t); setMine(m);
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  }, [me.id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!msg) return undefined; const t = setTimeout(() => setMsg(''), 3500); return () => clearTimeout(t); }, [msg]);

  const typeById = useMemo(() => Object.fromEntries(types.map((t) => [t.id, t])), [types]);
  const mineByBadge = useMemo(() => Object.fromEntries(mine.map((m) => [m.badge_id, m])), [mine]);
  const groups = useMemo(() => {
    const s = q.trim().toLowerCase();
    return CATEGORY_ORDER.map((cat) => ({
      cat,
      items: types.filter((t) => t.category === cat && (!s || t.name.toLowerCase().includes(s) || getBadgeInfo(t.id, lang).meaning.toLowerCase().includes(s))),
    })).filter((g) => g.items.length);
  }, [types, q, lang]);

  const withdraw = async (m) => {
    if (!confirm(L('Withdraw this request?', 'Unataka kuondoa ombi hili?'))) return;
    try { await withdrawBadgeRequest(m.id); setMsg(L('Request withdrawn.', 'Ombi limeondolewa.')); load(); } catch (e) { setErr(e.message); }
  };

  if (loading) return <p className="muted">{L('Loading…', 'Inapakia…')}</p>;

  return (
    <div>
      <h2>{L('Badges', 'Beji')}</h2>
      <p className="muted">{L('A badge shows a verified role or contribution. Pick a badge, read the criteria, then send your evidence.', 'Beji inaonyesha nafasi au mchango wako uliothibitishwa. Chagua beji, soma vigezo, kisha tuma ushahidi.')}</p>
      {err && <div className="err">{err}</div>}
      {msg && <div className="ok">{msg}</div>}

      <div className="card">
        <h3>{L('My badges', 'Beji zangu')}</h3>
        {!mine.length ? <p className="muted">{L('You have not requested any badge yet. Choose one below.', 'Bado hujaomba beji yoyote. Chagua moja hapa chini.')}</p>
          : mine.map((m) => {
            const type = typeById[m.badge_id];
            const st = STATUS_INFO[m.status];
            const note = m.badge_private?.message_to_user;
            return (
              <div className="item" key={m.id} style={{ flexDirection: 'column' }}>
                <div>
                  <span className="xbadge" style={{ marginLeft: 0 }}>✔ {type?.name || m.badge_id}</span>{' '}
                  <span className={'stat ' + (STATUS_TONE[m.status] || '')}>{st ? pick(st, lang) : m.status}</span>{' '}
                  <small className="muted">{timeAgo(m.updated_at)}</small>
                </div>
                {st && <small className="muted">{lang === 'sw' ? st[3] : st[2]}</small>}
                {note && <div className="quote"><b>{L('Message from admin', 'Ujumbe kutoka kwa Admin')}:</b> {note}</div>}
                {m.status === 'verified' && m.expires_at && <small className="muted">{L('Expires', 'Inaisha')}: {new Date(m.expires_at).toLocaleDateString()}</small>}
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  {['more_info', 'rejected', 'expired'].includes(m.status) && type?.requestable && <button onClick={() => setSel(type)}>{L('Send again', 'Tuma ombi tena')}</button>}
                  {CAN_WITHDRAW.includes(m.status) && <button className="link" onClick={() => withdraw(m)}>{L('Withdraw request', 'Ondoa ombi')}</button>}
                </div>
              </div>
            );
          })}
      </div>

      <div className="card">
        <h3>{L('Important rules', 'Kanuni muhimu')}</h3>
        <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
          {GENERAL_RULES.map((r) => <li key={r[0]} style={{ marginBottom: '.4rem' }}>{pick(r, lang)}</li>)}
        </ul>
      </div>

      <h3>{L('Request a badge', 'Omba beji')}</h3>
      <input type="search" placeholder={L('Search badges, e.g. Volunteer or MP', 'Tafuta beji, mfano Volunteer au Mbunge')} value={q} onChange={(e) => setQ(e.target.value)} />
      {!groups.length && <p className="muted">{L('No badge found.', 'Hakuna beji iliyopatikana.')}</p>}
      {groups.map(({ cat, items }) => (
        <div key={cat} className="sect">
          <h4>{pick(CATEGORY_LABELS[cat], lang)}</h4>
          <div className="bgrid">
            {items.map((t) => {
              const info = getBadgeInfo(t.id, lang);
              const ex = mineByBadge[t.id];
              const blocked = ex && OPEN.includes(ex.status);
              return (
                <div className="card" key={t.id}>
                  <span className="xbadge" style={{ marginLeft: 0 }}>✔ {t.name}</span>
                  <p>{info.meaning}</p>
                  {blocked ? <span className={'stat ' + (STATUS_TONE[ex.status] || '')}>{pick(STATUS_INFO[ex.status], lang)}</span>
                    : t.requestable ? <button onClick={() => setSel(t)}>{L('Read criteria & request', 'Soma vigezo na uombe')}</button>
                    : <small className="muted">{L('Granted by admins only', 'Hutolewa na Admin pekee')}</small>}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {sel && <RequestDialog badge={sel} L={L} lang={lang} onClose={() => setSel(null)}
        onDone={() => { setSel(null); setMsg(L('Request sent. It is waiting for verification.', 'Ombi limetumwa. Linasubiri uthibitisho.')); load(); }} />}
    </div>
  );
}

function RequestDialog({ badge, L, lang, onClose, onDone }) {
  const info = getBadgeInfo(badge.id, lang);
  const [detail, setDetail] = useState('');
  const [evText, setEvText] = useState('');
  const [evUrl, setEvUrl] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!evText.trim() && !evUrl.trim()) return setErr(L('Add a description of your evidence or a link.', 'Weka angalau maelezo ya ushahidi au kiungo (link).'));
    if (!consent) return setErr(L('Please agree to the use of your evidence.', 'Tafadhali kubali matumizi ya ushahidi wako.'));
    setBusy(true);
    try { await requestBadge({ badgeId: badge.id, detail, evidenceText: evText, evidenceUrl: evUrl }); onDone(); }
    catch (er) { setErr(er.message); setBusy(false); }
  };

  return (
    <div className="mdl-bg" role="dialog" aria-modal="true" onClick={onClose}>
      <form className="mdl" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>{L('Request', 'Omba')} {badge.name}</h3>
        <p><b>{L('Meaning', 'Maana')}:</b> {info.meaning}</p>
        <p><b>{L('Evidence required', 'Ushahidi unaohitajika')}:</b> {info.evidence}</p>
        <input placeholder={L('Your role or organisation (optional)', 'Nafasi au taasisi yako (si lazima)')} value={detail} onChange={(e) => setDetail(e.target.value)} />
        <textarea rows={4} placeholder={L('Describe your evidence, or how an admin can verify it', 'Eleza ushahidi wako au jinsi Admin anavyoweza kuuthibitisha')} value={evText} onChange={(e) => setEvText(e.target.value)} />
        <input type="url" placeholder={L('Link to evidence (https://…)', 'Kiungo cha ushahidi (https://…)')} value={evUrl} onChange={(e) => setEvUrl(e.target.value)} />
        <label style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-start', fontSize: '.9rem' }}>
          <input type="checkbox" style={{ width: 'auto', marginTop: 4, marginBottom: 0 }} checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>{L('I agree that admins review this evidence. It is visible to admins only and never on my public profile.', 'Nakubali Admin akague ushahidi huu. Unaonekana kwa Admin pekee na haujawekwa kwenye wasifu wa umma.')}</span>
        </label>
        {err && <div className="err" style={{ marginTop: '.6rem' }}>{err}</div>}
        <p style={{ marginTop: '.8rem' }}>
          <button type="button" className="sec" onClick={onClose}>{L('Close', 'Funga')}</button>{' '}
          <button disabled={busy}>{busy ? '…' : L('Send request', 'Tuma ombi')}</button>
        </p>
      </form>
    </div>
  );
}

export default function BadgesPage() { return <Shell>{(me) => <Inner me={me} />}</Shell>; }
