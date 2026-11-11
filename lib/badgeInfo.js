// Maudhui ya beji kutoka "Terraviva Connect – Mfumo wa Badges" (9 Novemba 2026), kwa Kiingereza na Kiswahili.
// Ufunguo = badge_types.id kwenye Supabase.
// Kila badge: [maana EN, maana SW, ushahidi EN, ushahidi SW]

export const CATEGORY_ORDER = ['core', 'leadership', 'government', 'local', 'community', 'partnership', 'recognition'];

export const CATEGORY_LABELS = {
  core: ['Core badges', 'Beji za msingi'],
  leadership: ['Leadership & governance', 'Uongozi na utawala'],
  government: ['National & public leadership', 'Uongozi wa kitaifa na umma'],
  local: ['Regional & local government', 'Serikali za mikoa na mitaa'],
  community: ['Community, expertise & contribution', 'Jamii, utaalamu na mchango'],
  partnership: ['Partnership & institutions', 'Ushirika na taasisi'],
  recognition: ['Achievement & recognition', 'Utambuzi wa mafanikio'],
};

// [label EN, label SW, hint EN, hint SW]
export const STATUS_INFO = {
  pending: ['Pending verification', 'Linasubiri uthibitisho', 'Your request was received and is waiting to be reviewed.', 'Ombi lako limepokelewa na linasubiri kukaguliwa.'],
  under_review: ['Under review', 'Linakaguliwa', 'An admin is checking your evidence.', 'Admin anakagua ushahidi wako.'],
  more_info: ['More information required', 'Taarifa zaidi zinahitajika', 'Add or correct your evidence and send the request again.', 'Ongeza au rekebisha ushahidi kisha tuma ombi tena.'],
  verified: ['Verified', 'Imethibitishwa', 'The badge is shown on your profile.', 'Beji inaonekana kwenye wasifu wako.'],
  rejected: ['Rejected', 'Imekataliwa', 'The request did not meet the criteria.', 'Ombi halijakidhi vigezo.'],
  suspended: ['Suspended', 'Imesimamishwa', 'The badge is suspended temporarily during a review.', 'Beji imesimamishwa kwa muda wakati wa uchunguzi.'],
  revoked: ['Removed', 'Imeondolewa', 'An admin removed the badge for a recorded reason.', 'Admin ameondoa beji kwa sababu iliyorekodiwa.'],
  expired: ['Expired', 'Muda umeisha', 'Verify again to get the badge back.', 'Thibitisha upya ili beji irudi.'],
};

// Rangi ya hali kwa darasa la .stat
export const STATUS_TONE = {
  verified: 'good', pending: 'wait', under_review: 'wait', more_info: 'wait',
  rejected: 'bad', suspended: 'bad', revoked: 'bad', expired: 'bad',
};

export const GENERAL_RULES = [
  ['A badge is a sign of verified information. It does not mean Terraviva Connect or Terraviva endorses a person, institution, party or government.', 'Beji ni alama ya taarifa iliyothibitishwa. Si uthibitisho kwamba Terraviva Connect au Terraviva inaunga mkono mtu, taasisi, chama au serikali yake.'],
  ['Admins have the final say on approving, suspending and removing badges. You cannot give yourself an official badge.', 'Admin ndiye mwenye mamlaka ya mwisho ya kuidhinisha, kusimamisha na kuondoa beji. Huwezi kujipa beji ya hadhi rasmi mwenyewe.'],
  ['Documents you send are visible to admins only. They never appear on your public profile.', 'Nyaraka unazotuma zinaonekana kwa Admin pekee. Hazionekani kwenye wasifu wa umma.'],
  ['A public-office badge only confirms a person\u2019s position. It does not mean the government has endorsed Terraviva Connect.', 'Beji ya cheo cha umma inathibitisha nafasi ya mtu tu. Haithibitishi kwamba serikali imeidhinisha Terraviva Connect.'],
  ['False information can lead to a badge being suspended or removed. You will be told why and can respond.', 'Taarifa za uongo zinaweza kusababisha beji kusimamishwa au kuondolewa. Utapewa sababu na nafasi ya kuwasilisha maelezo.'],
];

export const BADGE_INFO = {
  // A. Msingi
  founder: ['Founder of the organisation, project or institution.', 'Mwanzilishi wa shirika, mradi au taasisi husika.', 'Documents, founding records or official confirmation.', 'Nyaraka, kumbukumbu za uanzishaji au uthibitisho rasmi.'],
  professional: ['A person with a recognised profession or skill.', 'Mtu mwenye taaluma au ujuzi unaotambulika.', 'Certificate, licence, professional profile or other suitable proof.', 'Cheti, leseni, wasifu wa kitaaluma au ushahidi unaofaa.'],
  organisation: ['Official account of an organisation or institution.', 'Akaunti rasmi ya shirika au taasisi.', 'Registration documents, official website or proof of the representative.', 'Nyaraka za usajili, tovuti rasmi au uthibitisho wa mwakilishi.'],
  organisation_member: ['A person confirmed as a member of an organisation.', 'Mtu aliyethibitishwa kuwa mwanachama wa shirika.', 'Letter, member list or confirmation from the organisation\u2019s administrator.', 'Barua, orodha ya wanachama au uthibitisho kutoka kwa msimamizi wa shirika.'],
  beneficiary: ['A person who receives or has received support or benefits from a project.', 'Mtu anayepokea au aliyepokea msaada/manufaa ya mradi.', 'Project confirmation or programme records. Personal data is protected.', 'Uthibitisho wa mradi au rekodi za programu. Taarifa binafsi zinalindwa.'],
  moderator: ['Content/community moderator inside the app.', 'Msimamizi wa maudhui/jamii ndani ya app.', 'Internal appointment by an Admin.', 'Uteuzi wa ndani kutoka kwa Admin.'],

  // B. Uongozi na utawala
  co_founder: ['Co-founder of an organisation or institution.', 'Mwanzilishi mwenza wa shirika au taasisi.', 'Founding documents or confirmation from the organisation.', 'Nyaraka za uanzishaji au uthibitisho wa shirika.'],
  ceo: ['Chief Executive Officer of an institution/organisation.', 'Afisa Mtendaji Mkuu wa taasisi/shirika.', 'Appointment letter, official website or board confirmation.', 'Barua ya uteuzi, tovuti rasmi au uthibitisho wa bodi.'],
  director: ['Director of an institution, department or programme.', 'Mkurugenzi wa taasisi, idara au programu.', 'Appointment letter or official statement from the institution.', 'Barua ya uteuzi au taarifa rasmi ya taasisi.'],
  executive_leader: ['Senior-level leader in an institution.', 'Kiongozi wa ngazi ya juu katika taasisi.', 'Proof of the role and its responsibilities.', 'Uthibitisho wa nafasi na majukumu.'],
  team_leader: ['Leader of a specific team.', 'Kiongozi wa timu maalumu.', 'Appointment by the team or organisation.', 'Uteuzi wa timu/shirika.'],
  project_manager: ['Manager or supervisor of a project.', 'Msimamizi au meneja wa mradi.', 'Project document or confirmation from the institution.', 'Hati ya mradi au uthibitisho wa taasisi.'],
  ambassador: ['Ambassador appointed by an organisation, institution or initiative.', 'Balozi aliyeteuliwa na shirika, taasisi au mpango.', 'Official appointment letter stating the term.', 'Barua rasmi ya uteuzi na muda wa uteuzi.'],

  // C. Uongozi wa kitaifa na umma
  president: ['Serving head of state of a country.', 'Rais wa nchi aliye madarakani.', 'Official State House/government website or statement.', 'Tovuti/taarifa rasmi ya Ikulu au chanzo rasmi cha serikali.'],
  former_president: ['Former (retired) president.', 'Rais wa zamani/mstaafu.', 'Official government or institutional records.', 'Rekodi rasmi za serikali au taasisi husika.'],
  vice_president: ['Serving Vice President.', 'Makamu wa Rais aliye madarakani.', 'Official government source.', 'Chanzo rasmi cha serikali.'],
  former_vice_president: ['Former Vice President.', 'Makamu wa Rais wa zamani.', 'Official government records.', 'Rekodi rasmi za serikali.'],
  prime_minister: ['Serving Prime Minister.', 'Waziri Mkuu aliye madarakani.', 'Official government source.', 'Chanzo rasmi cha serikali.'],
  former_prime_minister: ['Former Prime Minister.', 'Waziri Mkuu wa zamani.', 'Official government records.', 'Rekodi rasmi za serikali.'],
  speaker: ['Speaker of Parliament.', 'Spika wa Bunge.', 'Official Parliament website.', 'Tovuti rasmi ya Bunge.'],
  deputy_speaker: ['Deputy Speaker of Parliament.', 'Naibu Spika wa Bunge.', 'Official Parliament website.', 'Tovuti rasmi ya Bunge.'],
  chief_justice: ['Chief Justice.', 'Jaji Mkuu.', 'Official judiciary website or statement.', 'Tovuti/taarifa rasmi ya mahakama.'],
  cabinet_minister: ['Government minister.', 'Waziri wa serikali.', 'Official list of Cabinet members.', 'Orodha rasmi ya Baraza la Mawaziri.'],
  member_of_parliament: ['Member of Parliament.', 'Mbunge.', 'Official Parliament website or official election records.', 'Tovuti rasmi ya Bunge au rekodi rasmi za uchaguzi.'],
  government_official: ['Government officer in a verifiable position.', 'Afisa wa serikali katika nafasi inayoweza kuthibitishwa.', 'Official website, work ID or confirmation letter.', 'Tovuti rasmi, kitambulisho cha kazi au barua ya uthibitisho.'],
  government_representative: ['Official representative of the government.', 'Mwakilishi rasmi wa serikali.', 'Letter of authority/appointment.', 'Barua ya mamlaka/uteuzi.'],
  public_servant: ['Public servant.', 'Mtumishi wa umma.', 'Work ID or confirmation from the public employer.', 'Kitambulisho cha kazi au uthibitisho wa mwajiri wa umma.'],

  // D. Serikali za mikoa na mitaa
  regional_commissioner: ['Regional Commissioner.', 'Mkuu wa Mkoa.', 'Official government statement.', 'Taarifa rasmi ya serikali.'],
  regional_administrative_secretary: ['Regional Administrative Secretary.', 'Katibu Tawala wa Mkoa.', 'Official government statement.', 'Taarifa rasmi ya serikali.'],
  district_commissioner: ['District Commissioner.', 'Mkuu wa Wilaya.', 'Official government statement.', 'Taarifa rasmi ya serikali.'],
  district_administrative_secretary: ['District Administrative Secretary.', 'Katibu Tawala wa Wilaya.', 'Official government statement.', 'Taarifa rasmi ya serikali.'],
  council_director: ['Council Director.', 'Mkurugenzi wa Halmashauri.', 'Official council website or letter.', 'Tovuti/barua rasmi ya halmashauri.'],
  mayor: ['Mayor.', 'Meya.', 'Official council statement.', 'Taarifa rasmi ya halmashauri.'],
  councillor: ['Councillor.', 'Diwani.', 'Official council or election records.', 'Rekodi rasmi za halmashauri/uchaguzi.'],
  ward_executive_officer: ['Ward Executive Officer.', 'Mtendaji wa Kata.', 'Official council letter or records.', 'Barua/rekodi rasmi za halmashauri.'],
  village_chairperson: ['Village Chairperson.', 'Mwenyekiti wa Kijiji.', 'Official village/council records.', 'Rekodi rasmi za kijiji/halmashauri.'],
  village_executive_officer: ['Village Executive Officer.', 'Mtendaji wa Kijiji.', 'Official council letter or records.', 'Barua/rekodi rasmi za halmashauri.'],
  street_chairperson: ['Street Chairperson.', 'Mwenyekiti wa Mtaa.', 'Official local authority records.', 'Rekodi rasmi za mamlaka ya eneo.'],
  street_executive_officer: ['Street Executive Officer.', 'Mtendaji wa Mtaa.', 'Official local authority letter or records.', 'Barua/rekodi rasmi za mamlaka ya eneo.'],

  // E. Jamii, utaalamu na mchango
  community_leader: ['Leader of a community or group.', 'Kiongozi wa jamii au jumuiya.', 'Appointment/confirmation from the community or an institution.', 'Uteuzi/uthibitisho wa jamii au taasisi.'],
  volunteer: ['A person who volunteers in community activities.', 'Mtu anayejitolea katika shughuli za kijamii.', 'Volunteering record or project confirmation.', 'Rekodi ya kujitolea au uthibitisho wa mradi.'],
  mentor: ['A person who guides and advises others.', 'Mtu anayetoa mwongozo na ushauri kwa wengine.', 'Programme appointment or mentorship record.', 'Uteuzi wa programu au rekodi ya mentorship.'],
  youth_leader: ['Youth leader.', 'Kiongozi wa vijana.', 'Proof of the role.', 'Uthibitisho wa nafasi husika.'],
  climate_champion: ['A person who contributes through real climate action.', 'Mtu anayechangia kwa vitendo katika hatua za tabianchi.', 'Evidence of activities/projects and an assessment.', 'Ushahidi wa shughuli/miradi na tathmini.'],
  environmental_champion: ['A person who contributes to environmental conservation.', 'Mtu anayechangia uhifadhi wa mazingira.', 'Evidence of activities and results.', 'Ushahidi wa shughuli na matokeo.'],
  researcher: ['Researcher in a recognised field.', 'Mtafiti katika eneo linalotambulika.', 'Publications, institution or proof of research.', 'Machapisho, taasisi au uthibitisho wa utafiti.'],
  verified_expert: ['Verified expert in a specific field.', 'Mtaalamu aliyethibitishwa katika eneo maalumu.', 'Certificates, experience and/or licence where required.', 'Vyeti, uzoefu na/au leseni inapohitajika.'],
  consultant: ['Professional consultant.', 'Mshauri wa kitaalamu.', 'Experience, completed work or professional proof.', 'Uzoefu, kazi zilizofanywa au uthibitisho wa kitaaluma.'],
  educator: ['Teacher or training facilitator.', 'Mwalimu au mwezeshaji wa mafunzo.', 'Certificate, institution or evidence of training.', 'Cheti, taasisi au ushahidi wa mafunzo.'],
  health_professional: ['Health professional.', 'Mtaalamu wa afya.', 'Professional licence/registration where required.', 'Leseni/usajili wa kitaaluma inapohitajika.'],
  agricultural_expert: ['Agricultural expert.', 'Mtaalamu wa kilimo.', 'Education, experience or professional proof.', 'Elimu, uzoefu au uthibitisho wa kitaaluma.'],
  technology_expert: ['Technology expert.', 'Mtaalamu wa teknolojia.', 'Experience, certificates or verified work.', 'Uzoefu, vyeti au kazi zilizothibitishwa.'],
  top_contributor: ['A contributor with a large, measurable contribution.', 'Mchangiaji mwenye mchango mkubwa unaoweza kupimwa.', 'Clear, reviewable activity criteria.', 'Vigezo vya shughuli vilivyo wazi na vinavyokaguliwa.'],
  outstanding_member: ['A member recognised for an outstanding contribution.', 'Mwanachama aliyetambuliwa kwa mchango bora.', 'Nomination and written recognition criteria.', 'Uteuzi na vigezo vya utambuzi vilivyoandikwa.'],
  pioneer: ['An early member/contributor of the platform or initiative.', 'Mwanachama/mchangiaji wa awali wa jukwaa au mpango.', 'Registration date or early record.', 'Tarehe ya usajili au rekodi ya awali.'],

  // F. Ushirika na taasisi
  strategic_partner: ['Strategic partner.', 'Mshirika wa kimkakati.', 'Agreement or proof of the partnership.', 'Makubaliano au uthibitisho wa ushirikiano.'],
  development_partner: ['Development partner.', 'Mshirika wa maendeleo.', 'Agreement, letter or record of the partnership.', 'Makubaliano, barua au kumbukumbu ya ushirikiano.'],
  institutional_partner: ['Partner institution.', 'Taasisi mshirika.', 'Official confirmation from all institutions involved.', 'Uthibitisho rasmi kutoka taasisi zote husika.'],
  ngo_partner: ['Partner non-governmental organisation.', 'Shirika lisilo la kiserikali lililo mshirika.', 'Registration and proof of the partnership.', 'Usajili na uthibitisho wa ushirikiano.'],
  international_partner: ['International partner.', 'Mshirika wa kimataifa.', 'Official documents/communication about the partnership.', 'Nyaraka/mawasiliano rasmi ya ushirikiano.'],
  donor: ['Donor of a project or activity.', 'Mfadhili wa mradi au shughuli.', 'Record of the contribution and consent to be recognised.', 'Rekodi ya mchango na ridhaa ya kutambuliwa.'],
  sponsor: ['Sponsor of an activity or programme.', 'Mdhamini wa shughuli au programu.', 'Contract/letter of sponsorship.', 'Mkataba/barua ya udhamini.'],

  // G. Utambuzi wa mafanikio
  innovation: ['A person or team recognised for innovation.', 'Mtu au timu iliyotambuliwa kwa ubunifu.', 'Evidence of the innovation and an assessment.', 'Ushahidi wa ubunifu na tathmini.'],
  excellence: ['Recognition of excellence in a specific area.', 'Utambuzi wa ubora katika eneo maalumu.', 'Clear award criteria.', 'Vigezo vya tuzo vilivyo wazi.'],
  lifetime_achievement: ['Recognition of long-term contribution.', 'Utambuzi wa mchango wa muda mrefu.', 'Assessment and evidence of long-term contribution.', 'Tathmini na ushahidi wa mchango wa muda mrefu.'],
};

// lang: 'en' | 'sw'
export function getBadgeInfo(id, lang = 'en') {
  const sw = lang === 'sw';
  const b = BADGE_INFO[id];
  if (!b) {
    return sw
      ? { meaning: 'Beji ya Terraviva Connect.', evidence: 'Ushahidi unaofaa utakaokaguliwa na Admin.' }
      : { meaning: 'A Terraviva Connect badge.', evidence: 'Suitable evidence that an admin will review.' };
  }
  return sw ? { meaning: b[1], evidence: b[3] } : { meaning: b[0], evidence: b[2] };
}

export const pick = (pair, lang) => (lang === 'sw' ? pair[1] : pair[0]);
