import Head from 'next/head';
import { useRouter } from 'next/router';
import { loadCompanionProps } from '../../../lib/companionAuth';
import { loadTaxonomy } from '../../../lib/team-builder/loadDocs';
import { MIT, FRICTION } from '../../../lib/team-builder/engine';
import { GUIDES, TOOL_NUM_TO_SLUG } from '../../../lib/guideContent';
import PortalSidebar from '../../../components/PortalSidebar';
import ToolHeader from '../../../components/ToolHeader';
import TeamBuilder from '../../../components/team-builder/TeamBuilder';

export async function getServerSideProps({ req }) {
  const result = await loadCompanionProps(req, 'team_builder');
  if (result.redirect) return { redirect: { destination: '/portal/login', permanent: false } };
  if (result.locked) return { redirect: { destination: '/portal/dashboard', permanent: false } };

  // The taxonomy is parsed from lib/mindprint-activity-taxonomy.md on every
  // request, so an edit to that file shows up with no code change.
  const taxonomy = loadTaxonomy().map(({ id, name, tag }) => ({ id, name, tag }));

  // Every library tool the result can point to, by number.
  const nums = new Set([...Object.values(MIT).flatMap(m => m.tools), ...FRICTION.flatMap(f => f.tools)]);
  const toolLinks = {};
  for (const n of nums) {
    const slug = TOOL_NUM_TO_SLUG[String(n)];
    if (slug && GUIDES[slug]) toolLinks[n] = { slug, name: GUIDES[slug].title };
  }

  const role = result.me?.user?.role;
  return {
    props: {
      me: result.me,
      licenses: result.licenses,
      isIndividual: result.isIndividual,
      isTeamAccount: result.isTeamAccount,
      taxonomy,
      toolLinks,
      // "Add from my team" uses the same roster the owner or manager sees on My Team.
      canImport: !!result.isTeamAccount && (role === 'owner' || role === 'manager'),
    },
  };
}

export default function TeamBuilderPage({ me, licenses, isIndividual, isTeamAccount, taxonomy, toolLinks, canImport }) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' }}>
      <Head>
        <title>Team Builder | Curio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <PortalSidebar me={me} onLogout={logout} active="team-builder" licenses={licenses} isIndividual={isIndividual} isTeamAccount={isTeamAccount} />
      <style>{`@media (max-width: 768px) { .tbp-main { padding: 72px 16px 40px !important; } }`}</style>
      <main className="portal-main tbp-main" style={{ marginLeft: 220, flex: 1, minWidth: 0, padding: '48px 48px 60px' }}>
        <div style={{ maxWidth: 1100 }}>
          <ToolHeader toolKey="team-builder" />
          <div style={{ marginTop: 28 }}>
            <TeamBuilder taxonomy={taxonomy} toolLinks={toolLinks} canImport={canImport} />
          </div>
        </div>
      </main>
    </div>
  );
}
