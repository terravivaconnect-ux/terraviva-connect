'use client';
import Link from 'next/link';
import LangSwitch from '@/components/LangSwitch';
import { useT } from '@/lib/i18n';

// Kila kifungu: [kichwa EN, kichwa SW, maandishi EN, maandishi SW]
const S = [
  ['1. Purpose', '1. Madhumuni',
    'Terraviva Connect is an online community for sharing knowledge on sustainable agriculture, youth and women empowerment, environmental conservation and related education. It is open to beneficiaries and non-beneficiaries.',
    'Terraviva Connect ni jumuiya ya mtandaoni ya kushiriki maarifa kuhusu kilimo endelevu, uwezeshaji wa vijana na wanawake, uhifadhi wa mazingira na elimu inayohusiana. Iko wazi kwa wanufaika na wasio wanufaika.'],
  ['2. Your account', '2. Akaunti yako',
    'You must give accurate information, keep your password secure and be responsible for activity on your account. You must be at least 16 years old to register. Each email address can be used for only one account: registration may be refused when the same inbox is already registered, including variants such as "+alias" addresses or dots in Gmail addresses. Do not share your account with others.',
    'Lazima utoe taarifa sahihi, ulinde nenosiri lako na uwajibike kwa shughuli zinazofanyika kwenye akaunti yako. Lazima uwe na angalau miaka 16 ili ujisajili. Kila barua pepe inaweza kutumika kwa akaunti moja tu: usajili unaweza kukataliwa ikiwa barua pepe hiyo tayari imesajiliwa, ikiwemo matoleo kama anwani za "+jina" au nukta kwenye anwani za Gmail. Usimpe mtu mwingine akaunti yako.'],
  ['3. Acceptable use', '3. Matumizi yanayokubalika',
    'Do not post unlawful, hateful, harassing, sexually explicit, misleading or spam content; do not impersonate others or claim roles, titles or badges you do not hold; do not share personal health histories or other people\'s private information; do not create accounts by automated means, collect other members\' data in bulk, or attempt to disrupt or access the platform without permission.',
    'Usichapishe maudhui haramu, ya chuki, ya unyanyasaji, ya ngono, ya kupotosha au taka (spam); usijifanye mtu mwingine wala kudai nafasi, vyeo au beji ambazo huna; usishiriki historia za afya za mtu binafsi wala taarifa za siri za watu wengine; usifungue akaunti kwa njia za kiotomatiki, usikusanye taarifa za wanachama wengine kwa wingi, wala kujaribu kuvuruga au kuingia kwenye jukwaa bila ruhusa.'],
  ['4. Your content and sharing', '4. Maudhui yako na kushare',
    'You own what you post, and you grant Terraviva a licence to display it on the platform. You are responsible for having the right to share it, including photos, videos and documents. You can share public content outside the app with the Share button. Anyone with the link can see a short preview (title, a short excerpt and a picture), so only share what you are comfortable making visible. Content in private or restricted communities cannot be shared this way.',
    'Unamiliki unachochapisha, na unaipa Terraviva leseni ya kukionyesha kwenye jukwaa. Unawajibika kuwa na haki ya kukishiriki, ikiwemo picha, video na nyaraka. Unaweza kushare maudhui ya umma nje ya app kwa kitufe cha Share. Yeyote mwenye link ataona muhtasari mfupi (kichwa, kipande kifupi cha maandishi na picha), kwa hiyo shiriki tu unachostarehe kukionyesha. Maudhui ya jumuiya za faragha au zenye vikwazo hayawezi kushirikiwa kwa njia hii.'],
  ['5. Messages', '5. Ujumbe',
    'Direct messages are for respectful communication. You can delete your own messages: deleting removes the text and attachments for everyone in the conversation. The sender can see when the other person has opened the conversation ("seen"). Do not use messages to harass, threaten or send spam.',
    'Ujumbe wa moja kwa moja ni kwa mawasiliano ya heshima. Unaweza kufuta ujumbe wako mwenyewe: kufuta kunaondoa maandishi na viambatisho kwa wote walio kwenye mazungumzo. Mtumaji anaweza kuona mtu mwingine anapofungua mazungumzo ("imesomwa"). Usitumie ujumbe kunyanyasa, kutisha au kutuma taka.'],
  ['6. Moderation', '6. Usimamizi wa maudhui',
    'Administrators and moderators may remove content, restrict communities, suspend or close accounts that breach these terms. You can report content using the Report button.',
    'Wasimamizi (admin) na wasimamizi wasaidizi (moderators) wanaweza kuondoa maudhui, kuweka vikwazo kwa jumuiya, kusimamisha au kufunga akaunti zinazokiuka masharti haya. Unaweza kuripoti maudhui kwa kitufe cha Report.'],
  ['7. Verification badges', '7. Beji za uthibitisho',
    'Badges show a role, profession or contribution, such as Professional, Organization, Beneficiary, Founder, Volunteer or public-office badges. They are granted only by administrators after they review the evidence you submit, and you cannot give yourself an official badge. A badge only confirms information; it does not mean Terraviva endorses a person, institution, party or government, and a public-office badge does not mean that government has endorsed Terraviva Connect. Badges may be suspended or removed, for example when a role ends, when evidence was false or when these terms are breached. You will be told the reason and may contact us to respond. Giving false information to obtain a badge is a breach of these terms.',
    'Beji zinaonyesha nafasi, taaluma au mchango, kama Professional, Organization, Beneficiary, Founder, Volunteer au beji za vyeo vya umma. Zinatolewa na wasimamizi pekee baada ya kukagua ushahidi unaowasilisha, na huwezi kujipa beji rasmi mwenyewe. Beji inathibitisha taarifa tu; haimaanishi Terraviva inaunga mkono mtu, taasisi, chama au serikali, na beji ya cheo cha umma haimaanishi serikali imeidhinisha Terraviva Connect. Beji zinaweza kusimamishwa au kuondolewa, kwa mfano nafasi ikiisha, ushahidi ukionekana wa uongo au masharti haya yakivunjwa. Utajulishwa sababu na unaweza kuwasiliana nasi kujibu. Kutoa taarifa za uongo ili kupata beji ni ukiukaji wa masharti haya.'],
  ['8. Educational content', '8. Maudhui ya elimu',
    'Information shared by members, including on health, is for general education and is not professional advice.',
    'Taarifa zinazoshirikiwa na wanachama, ikiwemo za afya, ni kwa elimu ya jumla na si ushauri wa kitaalamu.'],
  ['9. Availability and maintenance', '9. Upatikanaji na matengenezo',
    'We may put the platform into maintenance mode from time to time. While it is on, only administrators and moderators can use the platform and other members will see a notice. We do not guarantee uninterrupted service.',
    'Tunaweza kuweka jukwaa kwenye hali ya matengenezo mara kwa mara. Ikiwa imewashwa, wasimamizi na wasimamizi wasaidizi pekee ndio wanaoweza kulitumia, na wanachama wengine wataona tangazo. Hatuahidi huduma isiyokatizwa.'],
  ['10. Liability', '10. Dhima',
    'The platform is provided as is. Terraviva is not liable for member content or for losses arising from reliance on it.',
    'Jukwaa linatolewa kama lilivyo. Terraviva haiwajibiki kwa maudhui ya wanachama wala hasara zinazotokana na kuyategemea.'],
  ['11. Changes and contact', '11. Mabadiliko na mawasiliano',
    'We may update these terms and will show the latest version here. Contact: terravivaconnect@gmail.com.',
    'Tunaweza kusasisha masharti haya na tutaonyesha toleo la hivi karibuni hapa. Mawasiliano: terravivaconnect@gmail.com.'],
];

export default function LegalTerms() {
  const { lang } = useT();
  const sw = lang === 'sw';
  return (
    <div className="auth"><div className="auth-card" style={{ maxWidth: 760, textAlign: 'left' }}>
      <div style={{ textAlign: 'right' }}><LangSwitch /></div>
      <img className="logo" src="/logo.png" alt="Terraviva" />
      <h2>{sw ? 'Masharti ya Huduma' : 'Terms of Service'}</h2>
      <p className="muted">{sw ? 'Imesasishwa mwisho: Novemba 2026' : 'Last updated: November 2026'}</p>
      {S.map((s) => (<div key={s[0]}><h3>{sw ? s[1] : s[0]}</h3><p>{sw ? s[3] : s[2]}</p></div>))}
      <p><Link href="/privacy">{sw ? 'Sera ya Faragha' : 'Privacy Policy'}</Link> · <Link href="/register">{sw ? 'Rudi kujisajili' : 'Back to sign up'}</Link></p>
    </div></div>
  );
}
