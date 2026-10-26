import Link from 'next/link';
export const metadata = { title: 'Terms of Service | Terraviva Connect' };
export default function Terms() {
  return (<div className="auth"><div className="auth-card" style={{ maxWidth: 760, textAlign: 'left' }}>
    <img className="logo" src="/logo.png" alt="Terraviva" />
    <h2>Terms of Service</h2><p className="muted">Last updated: October 2026</p>
    <h3>1. Purpose</h3><p>Terraviva Connect is an online community for sharing knowledge on sustainable agriculture, youth and women empowerment, environmental conservation and related education. It is open to beneficiaries and non-beneficiaries.</p>
    <h3>2. Your account</h3><p>You must give accurate information, keep your password secure and be responsible for activity on your account. You must be at least 16 years old to register.</p>
    <h3>3. Acceptable use</h3><p>Do not post unlawful, hateful, harassing, sexually explicit, misleading or spam content; do not impersonate others; do not share personal health histories or other people&apos;s private information; do not attempt to disrupt or access the platform without permission.</p>
    <h3>4. Your content</h3><p>You own what you post, and you grant Terraviva a licence to display it on the platform. You are responsible for having the right to share it, including photos, videos and documents.</p>
    <h3>5. Moderation</h3><p>Administrators and moderators may remove content, restrict communities, suspend or close accounts that breach these terms. You can report content using the Report button.</p>
    <h3>6. Verification badges</h3><p>Beneficiary, Professional and Organization badges are granted by administrators after review and may be removed at any time.</p>
    <h3>7. Educational content</h3><p>Information shared by members, including on health, is for general education and is not professional advice.</p>
    <h3>8. Liability</h3><p>The platform is provided as is. Terraviva is not liable for member content or for losses arising from reliance on it.</p>
    <h3>9. Changes and contact</h3><p>We may update these terms and will show the latest version here. Contact: [ADD OFFICIAL CONTACT EMAIL].</p>
    <p><Link href="/privacy">Privacy Policy</Link> · <Link href="/register">Back to sign up</Link></p>
  </div></div>);
}
