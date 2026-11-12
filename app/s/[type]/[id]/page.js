import { supabase } from '@/lib/supabase';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import ShareRedirect from '@/components/ShareRedirect';

// Ukurasa wa kupokea link zilizoshirikiwa: /s/<type>/<id>
// Unaweka jina, maelezo na picha kwa WhatsApp, Facebook, LinkedIn, X na Telegram,
// kisha unamfungulia mtu kipengele ndani ya app. Hauruhusiwi kuorodheshwa na injini za utafutaji.
const PATHS = {
  post: (id) => `/post/${id}`,
  event: (id) => `/events?id=${id}`,
  opportunity: (id) => `/opportunities?id=${id}`,
  project: (id) => `/projects?id=${id}`,
  resource: (id) => `/resources?id=${id}`,
  community: (id) => `/communities?id=${id}`,
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ROBOTS = { index: false, follow: false };

async function getCard(type, id) {
  if (!PATHS[type] || !UUID.test(id)) return null;
  const { data } = await supabase.rpc('get_share_card', { p_type: type, p_id: id });
  return Array.isArray(data) ? data[0] : data || null;
}

export async function generateMetadata({ params }) {
  const card = await getCard(params.type, params.id);
  if (!card) return { robots: ROBOTS };
  const url = `${SITE_URL}/s/${params.type}/${params.id}`;
  const description = (card.description || '').trim() || SITE_NAME;
  const hasImage = /^https:\/\//i.test(card.image_url || '');
  const image = hasImage ? card.image_url : '/logo.png';
  const fullTitle = `${card.title} | ${SITE_NAME}`;
  return {
    title: card.title,
    description,
    robots: ROBOTS,
    alternates: { canonical: url },
    openGraph: { type: 'article', url, siteName: SITE_NAME, title: fullTitle, description, images: [{ url: image, alt: card.title }] },
    twitter: { card: hasImage ? 'summary_large_image' : 'summary', title: fullTitle, description, images: [image] },
  };
}

export default async function SharePage({ params }) {
  const card = await getCard(params.type, params.id);
  const build = PATHS[params.type];
  const to = build && UUID.test(params.id) ? build(params.id) : '/';
  return <ShareRedirect to={to} title={card?.title} />;
}
