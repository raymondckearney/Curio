import Head from 'next/head';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { PortalNav } from './dashboard';
import TeamDynamics from '../../components/TeamDynamics';

export default function TeamDynamicsPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [dash, setDash] = useState(null);
  const [members, setMembers] = useState([]);
  const [teamsList, setTeamsList] = useState([]); // owner only
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [meRes, dashRes, teamRes] = await Promise.all([
          fetch('/api/portal/me'),
          fetch('/api/portal/dashboard'),
          fetch('/api/portal/team'),
        ]);
        if (!meRes.ok) throw new Error('unauth');
        const meData = await meRes.json();

        // Dynamics is an owner/manager tool, same "ownerOnly" convention as
        // My Team, Assessment Tokens, and Analytics (see PortalSidebar) —
        // a member hitting this URL directly gets bounced, same as they
        // would from those.
        if (meData.user.role !== 'owner' && meData.user.role !== 'manager') {
          router.replace('/portal/dashboard');
          return;
        }

        const dashData = dashRes.ok ? await dashRes.json() : null;
        const teamData = teamRes.ok ? await teamRes.json() : { members: [] };

        let teamsListData = [];
        if (meData.user.role === 'owner') {
          const teamsRes = await fetch('/api/portal/teams');
          if (teamsRes.ok) teamsListData = (await teamsRes.json()).teams || [];
        }

        setMe(meData);
        setDash(dashData);
        setMembers(teamData.members || []);
        setTeamsList(teamsListData);
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

  // Every member who has a resolved MindPrint™ profile — the only ones the
  // dynamics modules can actually place on the WHY/WHAT/HOW grid. Adapts
  // /api/portal/team's shape (assessment_type, lowercase-hyphenated) to
  // what TeamDynamics' modules expect (type, "WHY-WHAT" uppercase).
  const eligible = useMemo(() => members
    .filter(m => m.assessment_type)
    .map(m => ({ id: m.id, name: m.name || m.email, role: m.role ? m.role[0].toUpperCase() + m.role.slice(1) : '', type: m.assessment_type.toUpperCase(), team_id: m.team_id })),
    [members]);

  // A manager's /api/portal/team call is already scoped server-side to
  // their own team, so there's nothing to toggle — every eligible member
  // returned IS their team. An owner with no named sub-teams is in the
  // same boat (everyone is effectively one team, the whole account). Only
  // an owner with actual sub-teams gets a switcher, one tab per team plus
  // "Unassigned" when that bucket isn't empty.
  const isOwner = me?.user?.role === 'owner';
  const teamOptions = useMemo(() => {
    if (!isOwner || teamsList.length === 0) return null;
    const options = teamsList.map(t => ({
      id: t.id,
      label: t.name,
      count: eligible.filter(p => p.team_id === t.id).length,
    }));
    const unassignedCount = eligible.filter(p => !p.team_id).length;
    if (unassignedCount > 0) options.push({ id: 'unassigned', label: 'Unassigned', count: unassignedCount });
    return options;
  }, [isOwner, teamsList, eligible]);

  useEffect(() => {
    if (teamOptions && teamOptions.length && !teamOptions.some(t => t.id === activeTeamId)) {
      // Default to whichever team actually has people to analyze, so an
      // owner doesn't land on an empty team by array order alone.
      const best = [...teamOptions].sort((a, b) => b.count - a.count)[0];
      setActiveTeamId(best.id);
    }
  }, [teamOptions, activeTeamId]);

  const participants = teamOptions
    ? eligible.filter(p => (activeTeamId === 'unassigned' ? !p.team_id : p.team_id === activeTeamId))
    : eligible;

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Loading…</div>;
  if (!me) return null;

  return (
    <>
      <Head>
        <title>Dynamics — {me.account.name} — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
        <PortalNav me={me} onLogout={logout} active="dynamics" licenses={dash?.licenses} isIndividual={!!dash?.myAssessment} isTeamAccount={!!dash?.isTeamAccount} />
        <main className="portal-main" style={{ marginLeft: 220, flex: 1, padding: '48px 48px 60px', maxWidth: 'calc(100vw - 220px)' }}>
          <TeamDynamics
            participants={participants}
            teamOptions={teamOptions}
            activeTeamId={activeTeamId}
            onTeamChange={setActiveTeamId}
          />
        </main>
      </div>
    </>
  );
}
