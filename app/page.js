import HomeSwitch from '@/components/HomeSwitch';
import Landing from '@/components/Landing';
import { SITE_DESC } from '@/lib/site';

export const metadata = {
  title: { absolute: 'Terraviva Connect | Sustainable Agriculture, Conservation, Youth & Women Empowerment' },
  description: SITE_DESC,
  alternates: { canonical: '/' }
};

export default function Page() {
  return <HomeSwitch landing={<Landing />} />;
}
