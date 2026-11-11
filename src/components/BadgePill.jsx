import '../styles/badges.css';

/**
 * Alama ndogo ya badge. Inatumika kwenye profile, orodha ya viewers na Admin.
 * badge: { id, name, tone? }
 */
export default function BadgePill({ badge, size = 'md' }) {
  if (!badge) return null;
  return (
    <span className={`tvb-pill tvb-pill--${size}`} data-tone={badge.tone || 'teal'} title={badge.name}>
      <svg className="tvb-pill__icon" viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M10 1.8l2.1 1.5 2.6-.2.9 2.4 2.2 1.4-.7 2.5.7 2.5-2.2 1.4-.9 2.4-2.6-.2L10 18.2l-2.1-1.5-2.6.2-.9-2.4-2.2-1.4.7-2.5-.7-2.5 2.2-1.4.9-2.4 2.6.2L10 1.8z"
          fill="currentColor"
        />
        <path d="M6.9 10.2l2.1 2.1 4.1-4.2" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="tvb-pill__text">{badge.name}</span>
    </span>
  );
}
