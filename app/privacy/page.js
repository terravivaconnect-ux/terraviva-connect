import Link from 'next/link';
export const metadata = { title: 'Privacy Policy | Terraviva Connect' };
export default function Privacy() {
  return (<div className="auth"><div className="auth-card" style={{ maxWidth: 760, textAlign: 'left' }}>
    <img className="logo" src="/logo.png" alt="Terraviva" />
    <h2>Privacy Policy</h2><p className="muted">Last updated: October 2026</p>
    <h3>What we collect</h3><p>Name, username, email, optional phone number, country/region/district, headline, interests, profile photos, and the posts, comments, messages, files and reactions you create. We also record basic activity such as profile views (shown only to the profile owner).</p>
    <h3>How we use it</h3><p>To run your account, show your profile and posts according to your privacy settings, deliver messages and notifications, moderate the community, keep the platform secure, and understand overall usage. Phone numbers are never shown publicly.</p>
    <h3>Beneficiary verification</h3><p>If your confirmed email matches the Terraviva beneficiary list, your profile may automatically receive a Beneficiary badge. The list itself is visible only to administrators.</p>
    <h3>Who can see what</h3><p>You choose profile visibility in Settings: public, members only, connections only or private. Direct messages are visible only to participants. Administrators may access content when handling reports or legal obligations.</p>
    <h3>Storage and processors</h3><p>Data is stored with our hosting providers (Supabase for database and authentication; Cloudinary for images, videos and documents; Vercel for hosting). Data may be processed outside your country.</p>
    <h3>Your rights</h3><p>You can edit your profile, download your data and request deletion of your account from Settings. Deleting posts removes them from the platform; backups are overwritten on a regular cycle.</p>
    <h3>Security and children</h3><p>We use encrypted connections and access controls, but no system is perfectly secure. The platform is not intended for people under 16.</p>
    <h3>Contact</h3><p>[ADD OFFICIAL CONTACT EMAIL]</p>
    <p><Link href="/terms">Terms of Service</Link> · <Link href="/register">Back to sign up</Link></p>
  </div></div>);
}
