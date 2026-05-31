import { dbGet } from '../../lib/supabase';

export async function getServerSideProps({ params }) {
  const { token } = params;

  try {
    const rows = await dbGet('tokens', { token });
    if (!rows.length) {
      return { redirect: { destination: '/go/invalid', permanent: false } };
    }
    const { purpose, name, email } = rows[0];
    const qs = new URLSearchParams({ token });
    if (name)  qs.set('name', name);
    if (email) qs.set('email', email);
    // Assessment tokens go to the intro landing page first
    const dest = purpose === 'assessment' ? `/assessment/intro?${qs}` : `/${purpose}?${qs}`;
    return { redirect: { destination: dest, permanent: false } };
  } catch {
    return { redirect: { destination: '/go/invalid', permanent: false } };
  }
}

export default function GoPage() {
  return null;
}
