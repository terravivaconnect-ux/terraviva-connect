// Vercel Serverless Function: inaongeza Open Graph tags za profile kwenye index.html
// ili link ya profile ionyeshe jina, headline na picha kwenye WhatsApp, Facebook, LinkedIn, X na Telegram.

const SITE_URL = (process.env.SITE_URL || 'https://terraviva-connect.vercel.app').replace(/\/$/, '');
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SITE_NAME = 'Terraviva Connect';
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

// Njia za ukurasa ambazo si majina ya watumiaji.
const RESERVED = new Set(['viewers', 'edit', 'settings', 'new', 'me']);

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

async function loadCard(username) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const headers = { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' };
  if (SUPABASE_ANON_KEY.startsWith('eyJ')) headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_public_profile_card`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ p_username: username }),
  });
  if (!r.ok) return null;
  const rows = await r.json();
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

function stripExistingMeta(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+(?:property|name)=["'](?:og:[^"']+|twitter:[^"']+|description)["'][^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '');
}

function buildTags({ title, desc, image, url }) {
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}">`,
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:type" content="profile">`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    `<meta property="og:image:alt" content="${esc(title)}">`,
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<meta name="twitter:image" content="${esc(image)}">`,
  ].join('\n    ');
}

export default async function handler(req, res) {
  try {
    // Chukua index.html kutoka domain yako mwenyewe (si kutoka Host header, kuzuia matumizi mabaya).
    const pageRes = await fetch(`${SITE_URL}/index.html`);
    if (!pageRes.ok) {
      res.writeHead(302, { Location: '/' });
      return res.end();
    }
    const html = await pageRes.text();

    const raw = String(req.query.username || '').trim();
    const valid = /^[A-Za-z0-9._-]{2,40}$/.test(raw) && !RESERVED.has(raw.toLowerCase());
    const card = valid ? await loadCard(raw).catch(() => null) : null;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    // Profile haipo, si ya umma, au ni njia iliyohifadhiwa: rudisha app kama ilivyo (bila kufichua chochote).
    if (!card) {
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return res.status(200).send(html);
    }

    const name = [card.first_name, card.last_name].filter(Boolean).join(' ') || raw;
    const title = `${name} · ${SITE_NAME}`;
    const desc = (card.headline || '').trim() || `Tazama profile ya ${name} kwenye ${SITE_NAME}.`;
    const image = /^https:\/\//i.test(card.avatar_url || '') ? card.avatar_url : DEFAULT_IMAGE;
    const url = `${SITE_URL}/profile/${encodeURIComponent(raw)}`;

    const tags = buildTags({ title, desc, image, url });
    const out = stripExistingMeta(html).replace(/<\/head>/i, `    ${tags}\n  </head>`);

    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
    return res.status(200).send(out);
  } catch {
    res.writeHead(302, { Location: '/' });
    return res.end();
  }
}
