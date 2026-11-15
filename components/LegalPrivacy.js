'use client';
import Link from 'next/link';
import LangSwitch from '@/components/LangSwitch';
import { useT } from '@/lib/i18n';

// Kila kifungu: [kichwa EN, kichwa SW, maandishi EN, maandishi SW]
const S = [
  ['What we collect', 'Tunachokusanya',
    'Name, username, email, country/region/district, headline, interests, profile photos, and the posts, comments, messages, files and reactions you create. If you choose, you can also add a phone number and your gender. For a badge request we collect the role you claim and the evidence you submit (a description and/or a link). We also record basic activity such as profile views and when a conversation is opened, so that "who viewed your profile" and "seen" in messages can work.',
    'Jina, username, barua pepe, nchi/mkoa/wilaya, kichwa cha wasifu, mapendeleo, picha za wasifu, na machapisho, maoni, ujumbe, mafaili na miitikio unayounda. Ukipenda, unaweza pia kuongeza namba ya simu na jinsia yako. Kwa ombi la beji tunakusanya nafasi unayodai na ushahidi unaowasilisha (maelezo na/au kiungo). Pia tunarekodi shughuli za msingi kama kuangalia wasifu na kufunguliwa kwa mazungumzo, ili "walioangalia wasifu wako" na "imesomwa" kwenye ujumbe viweze kufanya kazi.'],
  ['How we use it', 'Jinsi tunavyoitumia',
    'To run your account, show your profile and posts according to your privacy settings, deliver messages and notifications, review badge requests, moderate the community, keep the platform secure, and understand overall usage. We also compile anonymous community statistics (for example, members by country or gender) that do not identify you.',
    'Kuendesha akaunti yako, kuonyesha wasifu na machapisho yako kulingana na mipangilio yako ya faragha, kufikisha ujumbe na arifa, kukagua maombi ya beji, kusimamia jumuiya, kulinda jukwaa, na kuelewa matumizi kwa ujumla. Pia tunaandaa takwimu za jumla zisizokutambulisha (kwa mfano wanachama kwa nchi au jinsia).'],
  ['Phone number and gender', 'Namba ya simu na jinsia',
    'Both are optional and stored separately from your public profile. Only you can see them. Phone numbers are never shown to other members. Administrators can see a phone number only where needed to run the beneficiary programme, and if you include it in a job or opportunity application it is shared with the organization you apply to. Gender is used only for anonymous totals.',
    'Zote mbili ni hiari na zinahifadhiwa kando na wasifu wako wa umma. Ni wewe pekee unayeziona. Namba za simu hazionyeshwi kwa wanachama wengine. Wasimamizi wanaweza kuona namba ya simu pale tu inapohitajika kuendesha mpango wa wanufaika, na ukiiweka kwenye ombi la kazi au fursa inashirikiwa na shirika unaloomba. Jinsia inatumika kwa jumla zisizotaja majina pekee.'],
  ['Badge verification', 'Uthibitisho wa beji',
    'Badges are granted by administrators after they review the evidence you submit, with your consent when you send the request. The evidence is visible only to administrators, never on your public profile, and is kept while it is needed to verify the badge and keep an audit record of decisions. Approved badges are shown on your profile and next to your name.',
    'Beji zinatolewa na wasimamizi baada ya kukagua ushahidi unaowasilisha, kwa ridhaa yako unapotuma ombi. Ushahidi unaonekana kwa wasimamizi pekee, haujawekwa kwenye wasifu wako wa umma, na unahifadhiwa kwa muda unaohitajika kuthibitisha beji na kuweka rekodi ya maamuzi. Beji zilizoidhinishwa zinaonekana kwenye wasifu wako na kando ya jina lako.'],
  ['Profile views and "seen"', 'Walioangalia wasifu na "imesomwa"',
    'When you open someone\'s profile we record that you viewed it (at most once a day). The profile owner can see a list of people who viewed their profile, with name, photo, headline and badges. If the owner is not allowed to see your profile because of your privacy settings, you appear only as "Private user", and people you have blocked (or who blocked you) are hidden. In messages, the sender can see when the other person has opened the conversation.',
    'Unapofungua wasifu wa mtu tunarekodi kwamba umeuangalia (mara moja kwa siku kwa kiwango cha juu). Mwenye wasifu anaweza kuona orodha ya walioangalia wasifu wake, pamoja na jina, picha, kichwa cha wasifu na beji. Ikiwa mwenye wasifu haruhusiwi kuona wasifu wako kwa sababu ya mipangilio yako ya faragha, utaonekana kama "Mtumiaji wa faragha" tu, na watu uliowazuia (au waliokuzuia) hawaonekani. Kwenye ujumbe, mtumaji anaweza kuona mtu mwingine anapofungua mazungumzo.'],
  ['Who can see what', 'Nani anaona nini',
    'You choose profile visibility in Settings: public, members only, connections only or private. Direct messages are visible only to participants, and deleting a message removes its content for everyone. Administrators may access content when handling reports, reviewing badges or meeting legal obligations.',
    'Unachagua nani anaona wasifu wako kwenye Mipangilio: wa umma, wanachama pekee, walioungana nawe pekee au wa faragha. Ujumbe wa moja kwa moja unaonekana kwa washiriki pekee, na kufuta ujumbe kunaondoa maudhui yake kwa wote. Wasimamizi wanaweza kufikia maudhui wanaposhughulikia ripoti, wanapokagua beji au wanapotimiza wajibu wa kisheria.'],
  ['Sharing outside the app', 'Kushare nje ya app',
    'When you or another member shares a public post, event, opportunity, project, resource, community or public profile, anyone who has the link (including people without an account) can see a short preview: a title or name, a short excerpt and a picture. Content from private communities and from profiles that are not public does not produce a preview.',
    'Wewe au mwanachama mwingine anaposhare chapisho, tukio, fursa, mradi, rasilimali, jumuiya au wasifu wa umma, yeyote mwenye link (ikiwemo watu wasio na akaunti) ataona muhtasari mfupi: kichwa au jina, kipande kifupi cha maandishi na picha. Maudhui ya jumuiya za faragha na ya wasifu usio wa umma hayatoi muhtasari.'],
  ['Emails we send', 'Barua pepe tunazotuma',
    'We send emails to confirm your account, reset your password and, if you apply to an opportunity, deliver your application to the organization. Administrators also receive automated alerts when a member registers, requests a badge or reports content; a registration alert includes the new member\'s name, username, email, country/region and account type. Badge evidence is not included in emails.',
    'Tunatuma barua pepe kuthibitisha akaunti yako, kubadilisha nenosiri na, ukiomba fursa, kufikisha ombi lako kwa shirika. Wasimamizi pia wanapokea taarifa za kiotomatiki mwanachama anapojisajili, anapoomba beji au anaporipoti maudhui; taarifa ya usajili ina jina, username, barua pepe, nchi/mkoa na aina ya akaunti ya mwanachama mpya. Ushahidi wa beji haupo kwenye barua pepe.'],
  ['Storage and processors', 'Uhifadhi na wasindikaji',
    'Data is stored with our service providers: Supabase (database and authentication), Cloudinary (images, videos and documents), Vercel (hosting) and Google (Gmail and Google Apps Script, used to send emails). Data may be processed outside your country.',
    'Data inahifadhiwa kwa watoa huduma wetu: Supabase (hifadhidata na uthibitisho wa akaunti), Cloudinary (picha, video na nyaraka), Vercel (uendeshaji wa tovuti) na Google (Gmail na Google Apps Script, vinavyotumika kutuma barua pepe). Data inaweza kusindikwa nje ya nchi yako.'],
  ['Browser storage', 'Hifadhi ya kivinjari',
    'We use your browser\'s storage to keep you signed in, remember your language, and, for up to 24 hours, remember the page you wanted to open if you had to sign in first. We do not use advertising trackers.',
    'Tunatumia hifadhi ya kivinjari chako kukuweka umeingia, kukumbuka lugha yako na, kwa hadi saa 24, kukumbuka ukurasa uliotaka kufungua ikiwa ulilazimika kuingia kwanza. Hatutumii vifuatiliaji vya matangazo.'],
  ['Your rights', 'Haki zako',
    'You can edit your profile, phone and gender, download your data and request deletion of your account from Settings. Deleting posts removes them from the platform; backups are overwritten on a regular cycle. You can also contact us about your data at the address below.',
    'Unaweza kuhariri wasifu, simu na jinsia yako, kupakua data yako na kuomba akaunti yako ifutwe kutoka kwenye Mipangilio. Kufuta machapisho kunayaondoa kwenye jukwaa; nakala za akiba hubadilishwa kwa mzunguko wa kawaida. Pia unaweza kuwasiliana nasi kuhusu data yako kwa anwani iliyo hapa chini.'],
  ['Security and children', 'Usalama na watoto',
    'We use encrypted connections and access controls, but no system is perfectly secure. The platform is not intended for people under 16.',
    'Tunatumia mawasiliano yaliyosimbwa na udhibiti wa ufikiaji, lakini hakuna mfumo usio na hatari kabisa. Jukwaa halikusudiwi kwa watu walio chini ya miaka 16.'],
  ['Contact', 'Mawasiliano', 'terravivaconnect@gmail.com', 'terravivaconnect@gmail.com'],
];

export default function LegalPrivacy() {
  const { lang } = useT();
  const sw = lang === 'sw';
  return (
    <div className="auth"><div className="auth-card" style={{ maxWidth: 760, textAlign: 'left' }}>
      <div style={{ textAlign: 'right' }}><LangSwitch /></div>
      <img className="logo" src="/logo.png" alt="Terraviva" />
      <h2>{sw ? 'Sera ya Faragha' : 'Privacy Policy'}</h2>
      <p className="muted">{sw ? 'Imesasishwa mwisho: Novemba 2026' : 'Last updated: November 2026'}</p>
      {S.map((s) => (<div key={s[0]}><h3>{sw ? s[1] : s[0]}</h3><p>{sw ? s[3] : s[2]}</p></div>))}
      <p><Link href="/terms">{sw ? 'Masharti ya Huduma' : 'Terms of Service'}</Link> · <Link href="/register">{sw ? 'Rudi kujisajili' : 'Back to sign up'}</Link></p>
    </div></div>
  );
}
