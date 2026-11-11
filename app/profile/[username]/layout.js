import { supabase } from '@/lib/supabase';
import { SITE_URL, SITE_NAME } from '@/lib/site';

// Inaongeza jina, headline na picha ya mtu kwenye preview ya link ya profile
// (WhatsApp, Facebook, LinkedIn, X, Telegram). Profile za "public" na "active" pekee.
export async function generateMetadata({ params }) {
  let username = '';
  try { username = decodeURIComponent(params.username || ''); } catch { return {}; }
  if (!/^[A-Za-z0-9._-]{2,40}$/.test(username)) return {};

  const { data } = await supabase.rpc('get_public_profile_card', { p_username: username });
  const card = Array.isArray(data) ? data[0] : data;
  if (!card) return {};

  const name = [card.first_name, card.last_name].filter(Boolean).join(' ') || username;
  const description = (card.headline || '').trim() || `Tazama profile ya ${name} kwenye ${SITE_NAME}.`;
  const image = /^https:\/\//i.test(card.avatar_url || '') ? card.avatar_url : '/logo.png';
  const url = `${SITE_URL}/profile/${encodeURIComponent(username)}`;
  const fullTitle = `${name} | ${SITE_NAME}`;

  return {
    title: name,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'profile', url, siteName: SITE_NAME, title: fullTitle, description, images: [{ url: image, alt: name }] },
    twitter: { card: 'summary', title: fullTitle, description, images: [image] },
  };
}

export default function ProfileLayout({ children }) {
  return children;
}
