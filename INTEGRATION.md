# Terraviva Connect: Badges na Walioangalia Profile

## 1. Hali ya Supabase (tayari)
Project: `terraviva-connect`. Hakuna SQL ya kuendesha tena.
- Badges 65 zipo kwenye `badge_types`. Founder ipo, na Moderator hutolewa na Admin pekee.
- Functions: `request_badge`, `review_badge`, `grant_badge`, `withdraw_badge_request`, `is_admin`.
- Function mpya `get_profile_viewers(p_limit)` imeongezwa (faili ya SQL ipo kwenye `supabase/migrations/` kwa kumbukumbu tu).

## 2. Faili za kuweka kwenye repo
Nakili folda ya `src/` kwenye `src/` ya Terraviva Connect:

| Faili | Kazi |
|---|---|
| `src/data/badgeInfo.js` | Maana, ushahidi, status na kanuni za kila badge (kutoka PDF) |
| `src/lib/badgesApi.js` | Mawasiliano na Supabase |
| `src/components/BadgePill.jsx` | Alama ya badge |
| `src/pages/BadgesPage.jsx` | Badges zangu + Omba Badge |
| `src/pages/AdminBadgesPage.jsx` | Badge Verification & Management |
| `src/pages/ProfileViewersPage.jsx` | Walioangalia profile yako |
| `src/styles/badges.css` | CSS (madarasa yote yanaanza na `tvb-`) |

Kwenye `badgesApi.js` mstari wa kwanza ni `import { supabase } from './supabase';`. Ubadilishe ukiwa na njia tofauti ya supabase client yako.

## 3. Routes
Mfano kwa `react-router-dom` (badilisha ukitumia mfumo mwingine):

```jsx
import BadgesPage from './pages/BadgesPage';
import AdminBadgesPage from './pages/AdminBadgesPage';
import ProfileViewersPage from './pages/ProfileViewersPage';

<Route path="/badges" element={<BadgesPage userId={session.user.id} />} />
<Route path="/profile/viewers" element={<ProfileViewersPage />} />
<Route path="/admin/badges" element={<AdminBadgesPage />} />
```

Kuhusu `ProfileViewersPage`, kama njia ya profile yako si `/profile/<username>`, tumia:

```jsx
<ProfileViewersPage profileHref={(v) => `/u/${v.username}`} />
// au
<ProfileViewersPage onOpenProfile={(v) => navigate(`/u/${v.username}`)} />
```

## 4. Viungo vya menyu
- Profile: "Badges" kwenda `/badges`, na "Walioangalia profile yako" kwenda `/profile/viewers`.
- Admin Dashboard: "Badge Management" kwenda `/admin/badges`.
- Admin hupata notification ya `badge_request` ombi likitumwa, na mtumiaji hupata `badge_verified`, `badge_rejected`, `badge_more_info`, `badge_suspended` au `badge_revoked`. Hakikisha ukurasa wa notifications unatambua aina hizi.

## 5. Kuonyesha badges kwenye profile ya umma
`profiles.badge_ids` tayari inasasishwa na `sync_badges` kila Admin anapoamua. Onyesha badge zilizothibitishwa pekee:

```jsx
import BadgePill from '../components/BadgePill';
import { fetchBadgeTypes } from '../lib/badgesApi';

// types = await fetchBadgeTypes()
{profile.badge_ids?.map((id) => <BadgePill key={id} badge={types.find((t) => t.id === id)} />)}
```

## 6. Kurekodi view
App yako tayari inaandika kwenye `profile_views` (rekodi 28 zipo). Usiongeze mara ya pili. Kama bado unaona marudio mengi, rekodi view mara moja kwa dakika 30 kwa kila profile.

## 7. Majaribio kabla ya kuweka live
1. Ingia kama mtumiaji wa kawaida, omba "Volunteer" na uone hali "Linasubiri uthibitisho".
2. Ingia kama Admin kwenye `/admin/badges` na ubonyeze "Idhinisha". Badge lazima ionekane kwenye profile.
3. Jaribu "Simamisha" na "Ondoa", kisha uhakikishe mtumiaji anaona ujumbe wako.
4. Angalia profile ya mtu kwa akaunti mbili, kisha ufungue `/profile/viewers` kwenye akaunti ya mwenye profile.
5. Kama kipengele cha embed kwenye `fetchBadgeRequests` kinatoa hitilafu ya "relationship", hakikisha majina ya foreign key ni `user_badges_user_id_fkey` na kwamba `badge_private` ina `user_badge_id` kama primary key.
