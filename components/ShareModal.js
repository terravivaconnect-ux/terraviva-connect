'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '@/lib/i18n';

/**
 * Dirisha la kushare kitu chochote kinachofaa kushirikiwa nje ya app.
 * type: post | event | opportunity | project | resource | community
 * Link inayoshirikiwa ni /s/<type>/<id> (inaonyesha preview nzuri kisha inamfungulia mtu app).
 */
export default function ShareModal({ type, id, title, preview, onClose }) {
  const { lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const url = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const u = new URL(`/s/${type}/${id}`, window.location.origin);
    u.searchParams.set('utm_source', 'share');
    return u.toString();
  }, [type, id]);

  const text = L(`Check this out on Terraviva Connect: ${title}`, `Angalia hiki kwenye Terraviva Connect: ${title}`);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); }
    catch {
      inputRef.current?.select();
      try { document.execCommand('copy'); setCopied(true); } catch { /* nakili mwenyewe */ }
    }
  };
  const nativeShare = async () => {
    try { await navigator.share({ title, text, url }); } catch { /* ghairi */ }
  };

  const enc = encodeURIComponent;
  const targets = [
    ['WhatsApp', `https://wa.me/?text=${enc(`${text} ${url}`)}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`],
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`],
    ['X', `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`],
    ['Telegram', `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`],
    [L('Email', 'Barua pepe'), `mailto:?subject=${enc(title)}&body=${enc(`${text}\n${url}`)}`],
  ];
  const snippet = (preview || '').replace(/\s+/g, ' ').trim();

  return (
    <div className="mdl-bg" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="mdl" onClick={(e) => e.stopPropagation()}>
        <h3>{L('Share', 'Shiriki')}</h3>
        <div className="card" style={{ marginBottom: '.7rem' }}>
          <b>{title}</b>
          {snippet && <div className="muted">{snippet.length > 140 ? snippet.slice(0, 140) + '…' : snippet}</div>}
        </div>
        <label><small className="muted">{L('Link', 'Link')}</small></label>
        <div className="copyrow">
          <input ref={inputRef} readOnly value={url} onFocus={(e) => e.target.select()} />
          <button type="button" onClick={copy}>{copied ? L('Copied', 'Imenakiliwa') : L('Copy', 'Nakili')}</button>
        </div>
        {canNativeShare && <p style={{ marginTop: '.7rem' }}><button type="button" onClick={nativeShare}>{L('Share via phone', 'Shiriki kupitia simu')}</button></p>}
        <div className="sharegrid">
          {targets.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label}</a>)}
        </div>
        <small className="muted">{L('People need a Terraviva Connect account to open the full content.', 'Watu wanahitaji akaunti ya Terraviva Connect ili kufungua maudhui yote.')}</small>
        <p style={{ marginTop: '.8rem' }}><button type="button" className="sec" onClick={onClose}>{L('Close', 'Funga')}</button></p>
      </div>
    </div>
  );
}

/** Kitufe rahisi: kinafungua ShareModal. */
export function ShareButton({ type, id, title, preview, className = 'link' }) {
  const { lang } = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>🔗 {lang === 'sw' ? 'Shiriki' : 'Share'}</button>
      {open && <ShareModal type={type} id={id} title={title} preview={preview} onClose={() => setOpen(false)} />}
    </>
  );
}
