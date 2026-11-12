'use client';
import Link from 'next/link';
import { useT } from '@/lib/i18n';

// Inaonekana pale ukurasa unapofunguliwa kwa link iliyoshirikiwa (?id=...)
export default function FocusBanner({ href }) {
  const { lang } = useT();
  return (
    <div className="ok" style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', flexWrap: 'wrap' }}>
      <span>{lang === 'sw' ? 'Unaona kipengele kilichoshirikiwa.' : 'You are viewing a shared item.'}</span>
      <Link href={href}>{lang === 'sw' ? 'Ona vyote →' : 'See all →'}</Link>
    </div>
  );
}
