import { initials } from '@/lib/supabase';
export default function Avatar({ p, size = 40 }) {
  const st = { width: size, height: size, fontSize: size / 2.5 };
  return p?.avatar_url ? <img className="avatar" style={st} src={p.avatar_url} alt="" /> : <div className="avatar ph" style={st}>{initials(p)}</div>;
}
