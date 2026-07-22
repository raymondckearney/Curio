import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PortalNav } from './dashboard';

export default function PortalInsights() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/me').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/portal/dashboard').then(r => r.ok ? r.json() : null),
    ])
      .then(([meData, dashData]) => { setMe(meData); setDash(dashData); })
      .catch(() => router.replace('/portal/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  if (loading) return <div style={s.loading}>Loading…</div>;
  if (!me) return null;

  return (
    <>
      <Head>
        <title>Recent Articles — {me.account.name} — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div style={s.page}>
        <PortalNav me={me} onLogout={logout} active="insights" licenses={dash?.licenses} isIndividual={!!dash?.myAssessment} />
        <main style={s.main}>
          <iframe src="/insights?embed=1" title="Recent Articles" style={s.frame} />
        </main>
      </div>
    </>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94A3B8', fontFamily: 'sans-serif' },
  main: { marginLeft: 220, flex: 1, minHeight: '100vh' },
  frame: { width: '100%', height: '100vh', border: 'none', display: 'block' },
};
