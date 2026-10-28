import Link from 'next/link';
import { SITE_URL, SITE_NAME, SITE_DESC, CONTACT_EMAIL } from '@/lib/site';

const AREAS = [
  ['🌾', 'Sustainable Agriculture', 'Kilimo Endelevu', 'Climate-smart farming, agroforestry, soil health, compost and water conservation.', 'Kilimo kinachostahimili tabianchi, kilimo-misitu, afya ya udongo, mboji na uhifadhi wa maji.'],
  ['🌍', 'Environmental Conservation', 'Uhifadhi wa Mazingira', 'Biodiversity, tree planting, ecosystem restoration, waste management and wetlands.', 'Bioanuwai, upandaji miti, urejeshaji wa mifumo ikolojia, usimamizi wa taka na ardhi oevu.'],
  ['🤝', 'Youth and Women Empowerment', 'Uwezeshaji wa Vijana na Wanawake', 'Leadership, entrepreneurship, skills, fellowships and youth climate action.', 'Uongozi, ujasiriamali, stadi, ufadhili wa masomo na hatua za vijana kuhusu tabianchi.'],
  ['🩺', 'Reproductive Health Education', 'Elimu ya Afya ya Uzazi', 'Trusted, educational information and professional discussion for healthier communities.', 'Elimu na majadiliano ya kitaalamu kwa jamii zenye afya bora.']
];
const FEATURES = [
  ['Communities', 'Jumuiya', 'Join topic communities and share what works.', 'Jiunge na jumuiya za mada na shiriki yanayofanya kazi.'],
  ['Opportunities', 'Fursa', 'Find jobs, grants, training and fellowships, and apply directly.', 'Pata kazi, ruzuku, mafunzo na ufadhili wa masomo, na utume maombi moja kwa moja.'],
  ['Projects', 'Miradi', 'Follow real project progress from organizations and partners.', 'Fuatilia maendeleo halisi ya miradi ya mashirika na wadau.'],
  ['Resource Library', 'Maktaba ya Rasilimali', 'Guides, reports and training materials you can read in the app.', 'Miongozo, ripoti na vifaa vya mafunzo unavyoweza kusoma ndani ya app.'],
  ['Events', 'Matukio', 'Workshops, webinars and community events.', 'Warsha, mitandao na matukio ya jamii.'],
  ['Verified members', 'Wanachama waliothibitishwa', 'Beneficiary, professional and organization badges build trust.', 'Beji za mnufaika, mtaalamu na shirika zinajenga uaminifu.']
];

export default function Landing() {
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': SITE_URL + '/#org', name: 'Terraviva', url: SITE_URL, logo: SITE_URL + '/logo.png', email: CONTACT_EMAIL,
        description: 'Terraviva addresses the negative impacts of climate change and promotes positive environmental and social outcomes through sustainable, community-driven solutions.' },
      { '@type': 'WebSite', '@id': SITE_URL + '/#site', url: SITE_URL, name: SITE_NAME, description: SITE_DESC, inLanguage: ['en', 'sw'], publisher: { '@id': SITE_URL + '/#org' } }
    ]
  };
  return (
    <div className="landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <header className="lhero">
        <img src="/logo.png" alt="Terraviva logo: Sustain, Restore, Thrive" width="220" />
        <h1>Terraviva Connect</h1>
        <p className="ltag">Connect. Share Knowledge. Empower Communities. Protect Nature.</p>
        <p className="ltag sw">Ungana. Shiriki Maarifa. Wezesha Jamii. Linda Mazingira.</p>
        <p className="lintro">A community platform that connects people, organizations, environmental professionals, development partners and changemakers committed to sustainability and positive impact.</p>
        <p className="lintro">Jukwaa la jamii linalowaunganisha watu, mashirika, wataalamu wa mazingira, wadau wa maendeleo na wabadilishaji wa jamii wenye dhamira ya uendelevu.</p>
        <div className="lcta"><Link className="btn" href="/register">Join Terraviva Connect / Jiunge</Link> <Link className="btn sec" href="/login">Log in / Ingia</Link></div>
      </header>

      <section>
        <h2>What we work on / Tunachofanyia kazi</h2>
        <div className="lgrid">{AREAS.map(([i, en, sw, d, ds]) => (
          <article className="card" key={en}><div className="lico">{i}</div><h3>{en} <small className="muted">· {sw}</small></h3><p>{d}</p><p className="muted">{ds}</p></article>))}</div>
      </section>

      <section>
        <h2>Why join / Kwa nini ujiunge</h2>
        <div className="lgrid">{FEATURES.map(([en, sw, d, ds]) => (
          <article className="card" key={en}><h3>{en} <small className="muted">· {sw}</small></h3><p>{d}</p><p className="muted">{ds}</p></article>))}</div>
      </section>

      <section className="card lmission">
        <h2>Our mission / Dhamira yetu</h2>
        <p>Terraviva turns climate challenges into opportunities for environmental restoration, community empowerment and sustainable development, because protecting the environment and empowering communities go hand in hand.</p>
        <p className="muted">Terraviva inabadilisha changamoto za tabianchi kuwa fursa za kurejesha mazingira, kuwezesha jamii na maendeleo endelevu.</p>
      </section>

      <footer className="lfoot">
        <p><Link href="/terms">Terms of Service</Link> · <Link href="/privacy">Privacy Policy</Link> · <a href={'mailto:' + CONTACT_EMAIL}>{CONTACT_EMAIL}</a></p>
        <p className="muted">© {new Date().getFullYear()} Terraviva. Sustain · Restore · Thrive</p>
      </footer>
    </div>
  );
}
