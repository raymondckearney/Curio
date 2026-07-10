import CompanionShell from '../../../components/CompanionShell';
import { loadCompanionProps } from '../../../lib/companionAuth';

export async function getServerSideProps({ req }) {
  const result = await loadCompanionProps(req, 'purpose_companion');
  if (result.redirect) return { redirect: { destination: '/portal/login', permanent: false } };
  if (result.locked) return { redirect: { destination: '/portal/dashboard', permanent: false } };
  return {
    props: {
      initialProfile: result.profile,
      initialTertiary: result.tertiary,
      isAdmin: result.isAdmin,
      hasProfile: result.hasProfile,
      me: result.me,
      licenses: result.licenses,
      isIndividual: result.isIndividual,
    },
  };
}

export default function PurposeCompanionPage(props) {
  return <CompanionShell companionKey="purpose" {...props} />;
}
