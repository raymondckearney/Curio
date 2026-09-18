import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PortalNav } from './dashboard';
import OnboardingResources from '../../components/OnboardingResources';

export default function OnboardingResourcesPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [meRes, dashRes] = await Promise.all([
          fetch('/api/portal/me'),
          fetch('/api/portal/dashboard'),
        ]);
        if (!meRes.ok) throw new Error('unauth');
        const meData = await meRes.json();

        // Owner/manager tool, same "ownerOnly" convention (owner OR
        // manager) as My Team, Dynamics, Assessment Tokens, and Analytics
        // — see PortalSidebar. A member hitting this URL directly bounces,
        // same as they would from those.
        if (meData.user.role !== 'owner' && meData.user.role !== 'manager') {
          router.replace('/portal/dashboard');
          return;
        }

        const dashData = dashRes.ok ? await dashRes.json() : null;

        setMe(meData);
        setDash(dashData);
      } catch {
        router.replace('/portal/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Loading…</div>;
  if (!me) return null;

  return (
    <>
      <Head>
        <title>Onboarding Resources — {me.account.name} — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
        <PortalNav me={me} onLogout={logout} active="onboarding-resources" licenses={dash?.licenses} isIndividual={!!dash?.myAssessment} isTeamAccount={!!dash?.isTeamAccount} />
        <main className="portal-main" style={{ marginLeft: 220, flex: 1, padding: '48px 48px 60px', maxWidth: 'calc(100vw - 220px)' }}>
          <OnboardingResources />
        </main>
      </div>
    </>
  );
}
