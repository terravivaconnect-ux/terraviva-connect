'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '@/lib/i18n';
import { fullName } from '@/lib/supabase';

/**
 * Kitufe cha "Share profile" + dirisha la kushare.
 * profile: { username, first_name, last_name, headline, visibility }
 */
export default function ShareProfile({ profile, className = 'sec' }) {
  const { lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const visibility = profile?.visibility || 'public';
  const blocked = visibility === 'private' || visibility === 'connections';
  const membersOnly = visibility === 'members';
  const name = fullName(profile);

  const url = useMemo(() => {
    if (!profile?.username || typeof window === 'undefined') return '';
    const u = new URL(`/profile/${encodeURIComponent(profile.username)}`, window.location.origin);
    u.searchParams.set('utm_source', 'share');
    return u.toString();
  }, [profile]);

  const text = L(`Check out my profile on Terraviva Connect: ${name}`, `Angalia wasifu wangu kwenye Terraviva Connect: ${name}`);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  if (!profile?.username) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      inputRef.current?.select();
      try { document.execCommand('copy'); setCopied(true); } catch { /* nakili mwenyewe */ }
    }
  };
  const nativeShare = async () => {
    try { await navigator.share({ title: `${name} | Terraviva Connect`, text, url }); } catch { /* ghairi */ }
  };

  const enc = encodeURIComponent;
  const targets = [
    ['WhatsApp', `https://wa.me/?text=${enc(`${text} ${url}`)}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`],
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`],
    ['X', `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`],
    ['Telegram', `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`],
    [L('Email', 'Barua pepe'), `mailto:?subject=${enc(`${name} | Terraviva Connect`)}&body=${enc(`${text}\n${url}`)}`],
  ];

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>🔗 {L('Share profile', 'Shiriki wasifu')}</button>
      {open && (
        <div className="mdl-bg" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <div className="mdl" onClick={(e) => e.stopPropagation()}>
            <h3>{L('Share your profile', 'Shiriki wasifu wako')}</h3>
            {blocked ? (
              <p className="muted">
                {visibility === 'connections'
                  ? L('Your profile is visible to your connections only, so it cannot be shared by link. ', 'Wasifu wako unaonekana kwa uliowaunganisha pekee, kwa hiyo hauwezi kushirikiwa kwa link. ')
                  : L('Your profile is private, so it cannot be shared. ', 'Wasifu wako ni wa faragha, kwa hiyo hauwezi kushirikiwa. ')}
                {L('Make it public in Settings to share it.', 'Ubadilishe uwe wa umma kwenye Mipangilio ili uushiriki.')}
              </p>
            ) : (
              <>
                <div className="card" style={{ marginBottom: '.7rem' }}>
                  <b>{name}</b>
                  {profile.headline && <div className="muted">{profile.headline}</div>}
                </div>
                {membersOnly && (
                  <div className="ok" style={{ background: '#fff3d6', color: '#a16a00' }}>
                    {L('Your profile is visible to signed-in members only. People without an account will not see the preview.', 'Wasifu wako unaonekana kwa wanachama walioingia pekee. Watu wasio na akaunti hawataona preview.')}
                  </div>
                )}
                <label><small className="muted">{L('Your profile link', 'Link ya wasifu wako')}</small></label>
                <div className="copyrow">
                  <input ref={inputRef} readOnly value={url} onFocus={(e) => e.target.select()} />
                  <button type="button" onClick={copy}>{copied ? L('Copied', 'Imenakiliwa') : L('Copy', 'Nakili')}</button>
                </div>
                {canNativeShare && (
                  <p style={{ marginTop: '.7rem' }}><button type="button" onClick={nativeShare}>{L('Share via phone', 'Shiriki kupitia simu')}</button></p>
                )}
                <div className="sharegrid">
                  {targets.map(([label, href]) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
                  ))}
                </div>
                {!membersOnly && <small className="muted">{L('Anyone with this link can see the public details of your profile.', 'Mtu yeyote mwenye link hii ataona taarifa za umma za wasifu wako.')}</small>}
              </>
            )}
            <p style={{ marginTop: '.8rem' }}><button type="button" className="sec" onClick={() => setOpen(false)}>{L('Close', 'Funga')}</button></p>
          </div>
        </div>
      )}
    </>
  );
}
