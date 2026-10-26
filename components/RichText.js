import Link from 'next/link';
export default function RichText({ text }) {
  const parts = (text || '').split(/(#[\p{L}\p{N}_]+|@[a-zA-Z0-9_.]{3,30}|https?:\/\/[^\s]+)/gu);
  return (<>{parts.map((s, i) => {
    if (!s) return null;
    if (i % 2 === 0) return s;
    if (s[0] === '#') return <Link key={i} href={`/search?q=${encodeURIComponent(s)}`}>{s}</Link>;
    if (s[0] === '@') return <Link key={i} href={`/profile/${s.slice(1)}`}>{s}</Link>;
    return <a key={i} href={s} target="_blank" rel="noreferrer">{s}</a>;
  })}</>);
}
