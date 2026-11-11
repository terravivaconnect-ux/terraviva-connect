// Maudhui ya badges kutoka "Terraviva Connect – Mfumo wa Badges" (9 Novemba 2026).
// Ufunguo = badge_types.id kwenye Supabase.

export const CATEGORY_LABELS = {
  core: 'Badges za msingi',
  leadership: 'Uongozi na utawala',
  government: 'Uongozi wa kitaifa na umma',
  local: 'Serikali za mikoa na mitaa',
  community: 'Jamii, utaalamu na mchango',
  partnership: 'Ushirika na taasisi',
  recognition: 'Utambuzi wa mafanikio',
};

export const CATEGORY_ORDER = ['core', 'leadership', 'government', 'local', 'community', 'partnership', 'recognition'];

export const STATUS_INFO = {
  pending: { label: 'Linasubiri uthibitisho', hint: 'Ombi lako limepokelewa na linasubiri kukaguliwa.' },
  under_review: { label: 'Linakaguliwa', hint: 'Admin anakagua ushahidi wako.' },
  more_info: { label: 'Taarifa zaidi zinahitajika', hint: 'Ongeza au rekebisha ushahidi kisha tuma ombi tena.' },
  verified: { label: 'Imethibitishwa', hint: 'Badge inaonekana kwenye profile yako.' },
  rejected: { label: 'Imekataliwa', hint: 'Ombi halijakidhi vigezo.' },
  suspended: { label: 'Imesimamishwa', hint: 'Badge imesimamishwa kwa muda wakati wa uchunguzi.' },
  revoked: { label: 'Imeondolewa', hint: 'Badge imeondolewa na Admin kwa sababu iliyorekodiwa.' },
  expired: { label: 'Muda umeisha', hint: 'Thibitisha upya ili badge irudi.' },
};

export const GENERAL_RULES = [
  'Badge ni alama ya taarifa iliyothibitishwa. Si uthibitisho kwamba Terraviva Connect au Terraviva inaunga mkono mtu, taasisi, chama au serikali yake.',
  'Admin ndiye mwenye mamlaka ya mwisho ya kuidhinisha, kusimamisha na kuondoa badges. Huwezi kujipa badge ya hadhi rasmi mwenyewe.',
  'Nyaraka unazotuma zinaonekana kwa Admin pekee. Hazionekani kwenye profile ya umma.',
  'Badge ya cheo cha umma inathibitisha nafasi ya mtu tu. Haithibitishi kwamba serikali imeidhinisha Terraviva Connect.',
  'Ukitoa taarifa za uongo, badge inaweza kusimamishwa au kuondolewa. Utapewa sababu na nafasi ya kuwasilisha maelezo.',
];

export const BADGE_INFO = {
  // A. Msingi
  founder: { meaning: 'Mwanzilishi wa shirika, mradi au taasisi husika.', evidence: 'Nyaraka, kumbukumbu za uanzishaji au uthibitisho rasmi.' },
  professional: { meaning: 'Mtu mwenye taaluma au ujuzi unaotambulika.', evidence: 'Cheti, leseni, wasifu wa kitaaluma au ushahidi unaofaa.' },
  organisation: { meaning: 'Akaunti rasmi ya shirika au taasisi.', evidence: 'Nyaraka za usajili, tovuti rasmi au uthibitisho wa mwakilishi.' },
  organisation_member: { meaning: 'Mtu aliyethibitishwa kuwa mwanachama wa shirika.', evidence: 'Barua, orodha ya wanachama au uthibitisho kutoka kwa msimamizi wa shirika.' },
  beneficiary: { meaning: 'Mtu anayepokea au aliyepokea msaada/manufaa ya mradi.', evidence: 'Uthibitisho wa mradi au rekodi za programu. Taarifa binafsi zinalindwa.' },
  moderator: { meaning: 'Msimamizi wa maudhui/jamii ndani ya app.', evidence: 'Uteuzi wa ndani kutoka kwa Admin.' },

  // B. Uongozi na utawala
  co_founder: { meaning: 'Mwanzilishi mwenza wa shirika au taasisi.', evidence: 'Nyaraka za uanzishaji au uthibitisho wa shirika.' },
  ceo: { meaning: 'Afisa Mtendaji Mkuu wa taasisi/shirika.', evidence: 'Barua ya uteuzi, tovuti rasmi au uthibitisho wa bodi.' },
  director: { meaning: 'Mkurugenzi wa taasisi, idara au programu.', evidence: 'Barua ya uteuzi au taarifa rasmi ya taasisi.' },
  executive_leader: { meaning: 'Kiongozi wa ngazi ya juu katika taasisi.', evidence: 'Uthibitisho wa nafasi na majukumu.' },
  team_leader: { meaning: 'Kiongozi wa timu maalumu.', evidence: 'Uteuzi wa timu/shirika.' },
  project_manager: { meaning: 'Msimamizi au meneja wa mradi.', evidence: 'Hati ya mradi au uthibitisho wa taasisi.' },
  ambassador: { meaning: 'Balozi aliyeteuliwa na shirika, taasisi au mpango.', evidence: 'Barua rasmi ya uteuzi na muda wa uteuzi.' },

  // C. Uongozi wa kitaifa na umma
  president: { meaning: 'Rais wa nchi aliye madarakani.', evidence: 'Tovuti/taarifa rasmi ya Ikulu au chanzo rasmi cha serikali.' },
  former_president: { meaning: 'Rais wa zamani/mstaafu.', evidence: 'Rekodi rasmi za serikali au taasisi husika.' },
  vice_president: { meaning: 'Makamu wa Rais aliye madarakani.', evidence: 'Chanzo rasmi cha serikali.' },
  former_vice_president: { meaning: 'Makamu wa Rais wa zamani.', evidence: 'Rekodi rasmi za serikali.' },
  prime_minister: { meaning: 'Waziri Mkuu aliye madarakani.', evidence: 'Chanzo rasmi cha serikali.' },
  former_prime_minister: { meaning: 'Waziri Mkuu wa zamani.', evidence: 'Rekodi rasmi za serikali.' },
  speaker: { meaning: 'Spika wa Bunge.', evidence: 'Tovuti rasmi ya Bunge.' },
  deputy_speaker: { meaning: 'Naibu Spika wa Bunge.', evidence: 'Tovuti rasmi ya Bunge.' },
  chief_justice: { meaning: 'Jaji Mkuu.', evidence: 'Tovuti/taarifa rasmi ya mahakama.' },
  cabinet_minister: { meaning: 'Waziri wa serikali.', evidence: 'Orodha rasmi ya Baraza la Mawaziri.' },
  member_of_parliament: { meaning: 'Mbunge.', evidence: 'Tovuti rasmi ya Bunge au rekodi rasmi za uchaguzi.' },
  government_official: { meaning: 'Afisa wa serikali katika nafasi inayoweza kuthibitishwa.', evidence: 'Tovuti rasmi, kitambulisho cha kazi au barua ya uthibitisho.' },
  government_representative: { meaning: 'Mwakilishi rasmi wa serikali.', evidence: 'Barua ya mamlaka/uteuzi.' },
  public_servant: { meaning: 'Mtumishi wa umma.', evidence: 'Kitambulisho cha kazi au uthibitisho wa mwajiri wa umma.' },

  // D. Serikali za mikoa na mitaa
  regional_commissioner: { meaning: 'Mkuu wa Mkoa.', evidence: 'Taarifa rasmi ya serikali.' },
  regional_administrative_secretary: { meaning: 'Katibu Tawala wa Mkoa.', evidence: 'Taarifa rasmi ya serikali.' },
  district_commissioner: { meaning: 'Mkuu wa Wilaya.', evidence: 'Taarifa rasmi ya serikali.' },
  district_administrative_secretary: { meaning: 'Katibu Tawala wa Wilaya.', evidence: 'Taarifa rasmi ya serikali.' },
  council_director: { meaning: 'Mkurugenzi wa Halmashauri.', evidence: 'Tovuti/barua rasmi ya halmashauri.' },
  mayor: { meaning: 'Meya.', evidence: 'Taarifa rasmi ya halmashauri.' },
  councillor: { meaning: 'Diwani.', evidence: 'Rekodi rasmi za halmashauri/uchaguzi.' },
  ward_executive_officer: { meaning: 'Mtendaji wa Kata.', evidence: 'Barua/rekodi rasmi za halmashauri.' },
  village_chairperson: { meaning: 'Mwenyekiti wa Kijiji.', evidence: 'Rekodi rasmi za kijiji/halmashauri.' },
  village_executive_officer: { meaning: 'Mtendaji wa Kijiji.', evidence: 'Barua/rekodi rasmi za halmashauri.' },
  street_chairperson: { meaning: 'Mwenyekiti wa Mtaa.', evidence: 'Rekodi rasmi za mamlaka ya eneo.' },
  street_executive_officer: { meaning: 'Mtendaji wa Mtaa.', evidence: 'Barua/rekodi rasmi za mamlaka ya eneo.' },

  // E. Jamii, utaalamu na mchango
  community_leader: { meaning: 'Kiongozi wa jamii au jumuiya.', evidence: 'Uteuzi/uthibitisho wa jamii au taasisi.' },
  volunteer: { meaning: 'Mtu anayejitolea katika shughuli za kijamii.', evidence: 'Rekodi ya kujitolea au uthibitisho wa mradi.' },
  mentor: { meaning: 'Mtu anayetoa mwongozo na ushauri kwa wengine.', evidence: 'Uteuzi wa programu au rekodi ya mentorship.' },
  youth_leader: { meaning: 'Kiongozi wa vijana.', evidence: 'Uthibitisho wa nafasi husika.' },
  climate_champion: { meaning: 'Mtu anayechangia kwa vitendo katika hatua za tabianchi.', evidence: 'Ushahidi wa shughuli/miradi na tathmini.' },
  environmental_champion: { meaning: 'Mtu anayechangia uhifadhi wa mazingira.', evidence: 'Ushahidi wa shughuli na matokeo.' },
  researcher: { meaning: 'Mtafiti katika eneo linalotambulika.', evidence: 'Machapisho, taasisi au uthibitisho wa utafiti.' },
  verified_expert: { meaning: 'Mtaalamu aliyethibitishwa katika eneo maalumu.', evidence: 'Vyeti, uzoefu na/au leseni inapohitajika.' },
  consultant: { meaning: 'Mshauri wa kitaalamu.', evidence: 'Uzoefu, kazi zilizofanywa au uthibitisho wa kitaaluma.' },
  educator: { meaning: 'Mwalimu au mwezeshaji wa mafunzo.', evidence: 'Cheti, taasisi au ushahidi wa mafunzo.' },
  health_professional: { meaning: 'Mtaalamu wa afya.', evidence: 'Leseni/usajili wa kitaaluma inapohitajika.' },
  agricultural_expert: { meaning: 'Mtaalamu wa kilimo.', evidence: 'Elimu, uzoefu au uthibitisho wa kitaaluma.' },
  technology_expert: { meaning: 'Mtaalamu wa teknolojia.', evidence: 'Uzoefu, vyeti au kazi zilizothibitishwa.' },
  top_contributor: { meaning: 'Mchangiaji mwenye mchango mkubwa unaoweza kupimwa.', evidence: 'Vigezo vya shughuli vilivyo wazi na vinavyokaguliwa.' },
  outstanding_member: { meaning: 'Mwanachama aliyetambuliwa kwa mchango bora.', evidence: 'Uteuzi na vigezo vya utambuzi vilivyoandikwa.' },
  pioneer: { meaning: 'Mwanachama/mchangiaji wa awali wa jukwaa au mpango.', evidence: 'Tarehe ya usajili au rekodi ya awali.' },

  // F. Ushirika na taasisi
  strategic_partner: { meaning: 'Mshirika wa kimkakati.', evidence: 'Makubaliano au uthibitisho wa ushirikiano.' },
  development_partner: { meaning: 'Mshirika wa maendeleo.', evidence: 'Makubaliano, barua au kumbukumbu ya ushirikiano.' },
  institutional_partner: { meaning: 'Taasisi mshirika.', evidence: 'Uthibitisho rasmi kutoka taasisi zote husika.' },
  ngo_partner: { meaning: 'Shirika lisilo la kiserikali lililo mshirika.', evidence: 'Usajili na uthibitisho wa ushirikiano.' },
  international_partner: { meaning: 'Mshirika wa kimataifa.', evidence: 'Nyaraka/mawasiliano rasmi ya ushirikiano.' },
  donor: { meaning: 'Mfadhili wa mradi au shughuli.', evidence: 'Rekodi ya mchango na ridhaa ya kutambuliwa.' },
  sponsor: { meaning: 'Mdhamini wa shughuli au programu.', evidence: 'Mkataba/barua ya udhamini.' },

  // G. Utambuzi wa mafanikio
  innovation: { meaning: 'Mtu au timu iliyotambuliwa kwa ubunifu.', evidence: 'Ushahidi wa ubunifu na tathmini.' },
  excellence: { meaning: 'Utambuzi wa ubora katika eneo maalumu.', evidence: 'Vigezo vya tuzo vilivyo wazi.' },
  lifetime_achievement: { meaning: 'Utambuzi wa mchango wa muda mrefu.', evidence: 'Tathmini na ushahidi wa mchango wa muda mrefu.' },
};

export const getBadgeInfo = (id) =>
  BADGE_INFO[id] || { meaning: 'Badge ya Terraviva Connect.', evidence: 'Ushahidi unaofaa utakaokaguliwa na Admin.' };
