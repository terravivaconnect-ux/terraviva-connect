import { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/badges.css';

/**
 * Kitufe cha "Shiriki profile" + dirisha la kushare.
 *
 * Props:
 *   profile: { username, first_name, last_name, headline, visibility }
 *   buildUrl(profile) -> link ya profile (default: <origin>/profile/<username>)
 *   className -> hiari, kubadilisha muonekano wa kitufe
 */
export default function ShareProfile({
  profile,
  buildUrl = (p) => `${window.location.origin}/profile/${p.username}`,
  className = 'tvb-btn tvb-btn--ghost',
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const isPrivate = profile?.visibility === 'private';
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.username || '';

  const url = useMemo(() => {
    if (!profile?.username) return '';
    const u = new URL(buildUrl(profile), window.location.origin);
    u.searchParams.set('utm_source', 'share');
    return u.toString();
  }, [profile, buildUrl]);

  const text = `Angalia profile yangu kwenye Terraviva Connect: ${name}`;
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
      // Njia mbadala kwa vivinjari vya zamani
      inputRef.current?.select();
      try {
        document.execCommand('copy');
        setCopied(true);
      } catch {
        /* mtumiaji anaweza kunakili mwenyewe kutoka kwenye kisanduku */
      }
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: `${name} · Terraviva Connect`, text, url });
    } catch {
      /* mtumiaji alighairi */
    }
  };

  const enc = encodeURIComponent;
  const targets = [
    ['WhatsApp', `https://wa.me/?text=${enc(`${text} ${url}`)}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`],
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`],
    ['X', `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`],
    ['Telegram', `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`],
    ['Barua pepe', `mailto:?subject=${enc(`${name} kwenye Terraviva Connect`)}&body=${enc(`${text}\n${url}`)}`],
  ];

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        Shiriki profile
      </button>

      {open && (
        <div className="tvb-overlay" role="dialog" aria-modal="true" aria-labelledby="tvb-share-title" onClick={() => setOpen(false)}>
          <div className="tvb-dialog" onClick={(e) => e.stopPropagation()}>
            <h2 id="tvb-share-title">Shiriki profile yako</h2>

            {isPrivate ? (
              <p className="tvb-muted">
                Profile yako ni ya faragha, kwa hiyo haiwezi kushirikiwa. Ibadilishe kuwa ya umma kwenye mipangilio ya faragha ukitaka kuishare.
              </p>
            ) : (
              <>
                <div className="tvb-share-card">
                  <strong>{name}</strong>
                  {profile.headline && <span className="tvb-muted">{profile.headline}</span>}
                </div>

                <label className="tvb-field">
                  <span>Link ya profile yako</span>
                  <div className="tvb-share-copy">
                    <input
                      ref={inputRef}
                      className="tvb-input"
                      readOnly
                      value={url}
                      onFocus={(e) => e.target.select()}
                    />
                    <button type="button" className="tvb-btn" onClick={copy}>
                      {copied ? 'Imenakiliwa' : 'Nakili'}
                    </button>
                  </div>
                </label>

                {canNativeShare && (
                  <div className="tvb-actions">
                    <button type="button" className="tvb-btn" onClick={nativeShare}>
                      Shiriki kupitia simu
                    </button>
                  </div>
                )}

                <ul className="tvb-share-grid">
                  {targets.map(([label, href]) => (
                    <li key={label}>
                      <a className="tvb-share-link" href={href} target="_blank" rel="noopener noreferrer">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>

                <p className="tvb-muted">Mtu yeyote mwenye link hii ataona taarifa za umma za profile yako.</p>
              </>
            )}

            <div className="tvb-actions">
              <button type="button" className="tvb-btn tvb-btn--ghost" onClick={() => setOpen(false)}>
                Funga
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
