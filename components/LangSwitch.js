'use client';
import { useT } from '@/lib/i18n';
export default function LangSwitch({ style }) {
  const { lang, setLang } = useT();
  return (<span className="langsw" style={style}>
    <button type="button" className={lang === 'en' ? '' : 'sec'} onClick={() => setLang('en')}>EN</button>
    <button type="button" className={lang === 'sw' ? '' : 'sec'} onClick={() => setLang('sw')}>SW</button>
  </span>);
}
