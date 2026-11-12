// "Rudi ulipotaka": mgeni asiyeingia anapofungua ukurasa (mfano link iliyoshirikiwa),
// tunakumbuka ukurasa huo, na baada ya kuingia tunampeleka huko badala ya nyumbani.
const KEY = 'tv_next';
const MAX_AGE = 24 * 60 * 60 * 1000; // masaa 24 (barua ya uthibitisho inaweza kuchelewa)

// Njia ya ndani ya app pekee (inazuia kupelekwa kwenye tovuti nyingine) na si kurasa za kuingia.
export function safeNext(p) {
  if (typeof p !== 'string' || p.length > 500) return null;
  if (!p.startsWith('/') || p.startsWith('//') || p.startsWith('/\\')) return null;
  if (/^\/(login|register|forgot-password|reset-password|api)(\/|\?|#|$)/.test(p)) return null;
  return p;
}

export function rememberNext(p) {
  const n = safeNext(p);
  if (!n) return;
  try { localStorage.setItem(KEY, JSON.stringify({ p: n, t: Date.now() })); } catch { /* hakuna hifadhi */ }
}

// Inasoma na kufuta kumbukumbu (inatumika mara moja tu).
export function takeNext() {
  try {
    const raw = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    if (!raw) return null;
    const { p, t } = JSON.parse(raw);
    return Date.now() - t < MAX_AGE ? safeNext(p) : null;
  } catch { return null; }
}

// Mpeleke mgeni kwenye login, huku ukumbuka alikotaka kwenda.
export function goLogin(router) {
  const here = window.location.pathname + window.location.search;
  const n = safeNext(here);
  if (n && n !== '/') {
    rememberNext(n);
    router.replace('/login?next=' + encodeURIComponent(n));
  } else {
    router.replace('/login');
  }
}
