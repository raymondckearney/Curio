import Head from 'next/head';
import { useRouter } from 'next/router';
import { loadCompanionProps } from '../../../lib/companionAuth';
import PortalSidebar from '../../../components/PortalSidebar';

export async function getServerSideProps({ req }) {
  const result = await loadCompanionProps(req, 'meeting_architect');
  if (result.redirect) return { redirect: { destination: '/portal/login', permanent: false } };
  if (result.locked) return { redirect: { destination: '/portal/dashboard', permanent: false } };
  return {
    props: {
      me: result.me,
      licenses: result.licenses,
      isIndividual: result.isIndividual,
      profile: result.profile,
    },
  };
}

export default function MeetingArchitectPage({ me, licenses, isIndividual }) {
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
      <main className="portal-main" style={{ marginLeft: 220, flex: 1, padding: '48px 48px 60px', maxWidth: 'calc(100vw - 220px)' }}>
        <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: '2.4rem', fontWeight: 700, margin: '0 0 8px' }}>Meeting Architect</h1>
        <p style={{ color: '#64748B', fontSize: '0.95rem', maxWidth: 640 }}>
          A customized, timed redesign of a recurring meeting, built around your objectives, your current challenges, and how your team is wired. Coming soon.
        </p>
      </main>
    </div>
  );
}
