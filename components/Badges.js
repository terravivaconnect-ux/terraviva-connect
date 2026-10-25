export default function Badges({ p }) {
  if (!p) return null;
  return (<>
    {p.is_beneficiary_verified && <span className="badge b-ben" title="Verified Terraviva Beneficiary">🌱 Beneficiary</span>}
    {p.is_professional_verified && <span className="badge b-pro" title="Verified Professional">✔ Professional</span>}
    {p.is_org_verified && <span className="badge b-org" title="Verified Organization">🏛 Organization</span>}
  </>);
}
