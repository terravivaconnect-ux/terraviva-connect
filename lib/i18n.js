'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const SW = {
  'Home': 'Mwanzo', 'My Network': 'Mtandao Wangu', 'Communities': 'Jumuiya', 'Messages': 'Ujumbe', 'Notifications': 'Arifa',
  'Events': 'Matukio', 'Opportunities': 'Fursa', 'Projects': 'Miradi', 'Resources': 'Rasilimali', 'Saved': 'Zilizohifadhiwa',
  'Search': 'Tafuta', 'My Profile': 'Wasifu Wangu', 'Settings': 'Mipangilio', 'Admin': 'Usimamizi', 'Log out': 'Toka',
  'Log in': 'Ingia', 'Create an account': 'Fungua akaunti', 'Create account': 'Fungua akaunti', 'Create your account': 'Fungua akaunti yako',
  'Email address': 'Barua pepe', 'Password': 'Nenosiri', 'Forgot password?': 'Umesahau nenosiri?', 'New here?': 'Mgeni?',
  'Already a member?': 'Tayari ni mwanachama?', 'Password (min 8 characters)': 'Nenosiri (angalau herufi 8)',
  'First name': 'Jina la kwanza', 'Middle name (optional)': 'Jina la kati (si lazima)', 'Last name': 'Jina la mwisho', 'Username': 'Jina la mtumiaji',
  'Telephone (optional)': 'Simu (si lazima)', 'Country': 'Nchi', 'Region / State': 'Mkoa / Jimbo', 'District (optional)': 'Wilaya (si lazima)',
  'Open to everyone — beneficiaries and non-beneficiaries.': 'Wazi kwa wote — wanufaika na wasio wanufaika.',
  'Connect. Share Knowledge. Empower Communities. Protect Nature.': 'Ungana. Shiriki Maarifa. Wezesha Jamii. Linda Mazingira.',
  'Welcome': 'Karibu', 'Share knowledge with the community': 'Shiriki maarifa na jamii', 'Publish': 'Chapisha', 'Posting…': 'Inachapisha…',
  '📎 Add media / documents': '📎 Ongeza picha / video / nyaraka', '📊 Poll': '📊 Kura', 'Remove poll': 'Ondoa kura',
  'All posts': 'Machapisho yote', 'Following': 'Wanaofuatwa', 'Questions': 'Maswali', 'Agri advice': 'Ushauri wa kilimo', 'Awareness': 'Uhamasishaji',
  'Load more': 'Pakia zaidi', 'Loading…': 'Inapakia…', 'No posts yet. Be the first to share something!': 'Hakuna machapisho bado. Kuwa wa kwanza kushiriki!',
  'What would you like to share or ask? Use #hashtags and @mentions': 'Unataka kushiriki au kuuliza nini? Tumia #hashtag na @jina',
  '👍 Like': '👍 Penda', '💬 Comment': '💬 Maoni', '🔁 Repost': '🔁 Rudia', '🔗 Share': '🔗 Shiriki', '🔖 Save': '🔖 Hifadhi', '🔖 Saved': '🔖 Imehifadhiwa',
  '🚩 Report': '🚩 Ripoti', '✏️ Edit': '✏️ Hariri', '🗑 Delete': '🗑 Futa', 'Reply': 'Jibu', 'Like': 'Penda', 'Delete': 'Futa', 'Send': 'Tuma',
  'Write a comment… use @username to mention': 'Andika maoni… tumia @jina kumtaja mtu',
  'Connect': 'Unganisha', 'Follow': 'Fuata', 'Message': 'Ujumbe', 'Block': 'Zuia', 'Report': 'Ripoti', 'Edit profile': 'Hariri wasifu',
  'Accept': 'Kubali', 'Decline': 'Kataa', 'Connection requests': 'Maombi ya kuunganishwa', 'People you may know': 'Watu unaoweza kuwajua',
  'Trending topics': 'Mada zinazovuma', 'Suggested for you': 'Wanaopendekezwa', 'No hashtags yet': 'Hakuna hashtag bado',
  'Mark all read': 'Weka zote zimesomwa', "You're all caught up.": 'Hakuna arifa mpya.', 'Saved posts': 'Machapisho yaliyohifadhiwa',
  'Join': 'Jiunge', 'Request': 'Omba', 'Open': 'Fungua', 'Pending': 'Inasubiri', '✓ Member': '✓ Mwanachama', '← All communities': '← Jumuiya zote',
  'Save changes': 'Hifadhi mabadiliko', 'Profile': 'Wasifu', 'Change password': 'Badilisha nenosiri', 'Update password': 'Sasisha nenosiri',
  '+ Create event': '+ Tengeneza tukio', '+ Post opportunity': '+ Weka fursa', 'Apply': 'Omba nafasi', 'Download': 'Pakua',
  'Background': 'Wasifu wa kazi na elimu', 'Posts': 'Machapisho', 'Experience': 'Uzoefu', 'Education': 'Elimu', 'Skills': 'Ujuzi', 'Certifications': 'Vyeti',
  'Recommendations': 'Mapendekezo', 'Members, communities, posts, #hashtags…': 'Wanachama, jumuiya, machapisho, #hashtag…',
  'Check your email': 'Angalia barua pepe yako', 'Go to login': 'Nenda kuingia', 'Send reset link': 'Tuma kiungo cha kubadilisha', 'Back to login': 'Rudi kuingia',
  'Forgot password': 'Umesahau nenosiri', 'Set a new password': 'Weka nenosiri jipya',
  'Add': 'Ongeza', '+ Add': '+ Ongeza', 'Save': 'Hifadhi', 'Cancel': 'Ghairi', 'Close': 'Funga', 'Hide': 'Ficha', 'Show': 'Onyesha', '⤢ Full screen': '⤢ Skrini nzima',
  'Resource Library': 'Maktaba ya Rasilimali', '+ Add resource': '+ Ongeza rasilimali', '+ New project': '+ Mradi mpya', 'Search resources…': 'Tafuta rasilimali…',
  'commented on your post': 'ametoa maoni kwenye chapisho lako', 'reacted to your post': 'ameguswa na chapisho lako', 'started following you': 'ameanza kukufuata',
  'sent you a connection request': 'amekutumia ombi la kuunganishwa', 'accepted your connection request': 'amekubali ombi lako la kuunganishwa', 'sent you a message': 'amekutumia ujumbe', 'mentioned you': 'amekutaja',
  'Terms of Service': 'Masharti ya Huduma', 'Privacy Policy': 'Sera ya Faragha'
};

const Ctx = createContext({ lang: 'en', setLang: () => {}, t: (s) => s });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('en');
  useEffect(() => {
    try {
      const l = localStorage.getItem('lang');
      if (l === 'sw' || l === 'en') setLangState(l);
      else if ((navigator.language || '').toLowerCase().startsWith('sw')) setLangState('sw');
    } catch (e) { /* ignore */ }
  }, []);
  useEffect(() => { try { document.documentElement.lang = lang; } catch (e) { /* ignore */ } }, [lang]);
  const setLang = (l) => { setLangState(l); try { localStorage.setItem('lang', l); } catch (e) { /* ignore */ } };
  const t = (s) => (lang === 'sw' ? (SW[s] || s) : s);
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}
export const useT = () => useContext(Ctx);
