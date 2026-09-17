import Head from 'next/head';
import { useRouter } from 'next/router';
import { loadCompanionProps } from '../../../lib/companionAuth';
import PortalSidebar from '../../../components/PortalSidebar';
import SessionArchitect from '../../../components/SessionArchitect';

export async function getServerSideProps({ req }) {
  const result = await loadCompanionProps(req, 'session_architect');
  if (result.redirect) return { redirect: { destination: '/portal/login', permanent: false } };
  if (result.locked) return { redirect: { destination: '/portal/dashboard', permanent: false } };
  return {
    props: {
      me: result.me,
      licenses: result.licenses,
      isIndividual: result.isIndividual,
    },
  };
}

export default function SessionArchitectPage({ me, licenses, isIndividual }) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' }}>
      <Head>
        <title>Session Architect — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <PortalSidebar me={me} onLogout={logout} active="session-architect" licenses={licenses} isIndividual={isIndividual} />
      <main className="portal-main" style={{ marginLeft: 220, flex: 1, padding: '48px 48px 60px', maxWidth: 'calc(100vw - 220px)' }}>
        <SessionArchitect />
      </main>
    </div>
  );
}
