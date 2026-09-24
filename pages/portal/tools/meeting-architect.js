import Head from 'next/head';
import { useRouter } from 'next/router';
import { loadCompanionProps } from '../../../lib/companionAuth';
import { readTemplatesDoc, parseTemplates } from '../../../lib/meetingTemplates';
import PortalSidebar from '../../../components/PortalSidebar';
import MeetingArchitect from '../../../components/MeetingArchitect';

export async function getServerSideProps({ req }) {
  const result = await loadCompanionProps(req, 'meeting_architect');
  if (result.redirect) return { redirect: { destination: '/portal/login', permanent: false } };
  if (result.locked) return { redirect: { destination: '/portal/dashboard', permanent: false } };
  const templates = parseTemplates(readTemplatesDoc()).map(({ label, slug, inputMode, defaultPurpose }) => ({ label, slug, inputMode, defaultPurpose }));
  return {
    props: {
      me: result.me,
      licenses: result.licenses,
      isIndividual: result.isIndividual,
      profile: result.profile,
      templates,
    },
  };
}

export default function MeetingArchitectPage({ me, licenses, isIndividual, profile, templates }) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' }}>
      <Head>
        <title>Meeting Architect | Curio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <PortalSidebar me={me} onLogout={logout} active="meeting-architect" licenses={licenses} isIndividual={isIndividual} />
      <style>{`@media (max-width: 768px) { .ma-main { padding: 72px 16px 40px !important; } }`}</style>
      <main className="portal-main ma-main" style={{ marginLeft: 220, flex: 1, minWidth: 0, padding: '48px 48px 60px' }}>
        <MeetingArchitect templates={templates} profile={profile} />
      </main>
    </div>
  );
}
