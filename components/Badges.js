'use client';
import { useT } from '@/lib/i18n';

const Leaf = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill="#fff" opacity=".25" />
    <path d="M12 19v-7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M12 13c-3.6 0-5.2-2.3-5.2-4.7 3.1 0 5.2 1.7 5.2 4.7z" fill="#fff" />
    <path d="M12 11.6c0-3.1 1.9-5 5.2-5 0 2.9-1.7 5-5.2 5z" fill="#fff" />
  </svg>
);
const Check = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill="#fff" opacity=".25" />
    <path d="M7 12.5l3.2 3.2L17 8.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Building = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill="#fff" opacity=".25" />
    <path d="M7 17V8.5L12 6l5 2.5V17M10 17v-3h4v3M9.5 10.5h1M13.5 10.5h1" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Badges({ p }) {
  const { lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  if (!p) return null;
  return (<>
    {p.is_beneficiary_verified && <span className="tbadge ben" title={L('Verified Terraviva Beneficiary', 'Mnufaika Aliyethibitishwa wa Terraviva')}><Leaf />{L('Beneficiary', 'Mnufaika')}</span>}
    {p.is_professional_verified && <span className="tbadge pro" title={L('Verified Professional', 'Mtaalamu Aliyethibitishwa')}><Check />{L('Professional', 'Mtaalamu')}</span>}
    {p.is_org_verified && <span className="tbadge org" title={L('Verified Organization', 'Shirika Lililothibitishwa')}><Building />{L('Organization', 'Shirika')}</span>}
  </>);
}
