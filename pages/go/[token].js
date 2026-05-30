import { dbGet } from '../../lib/supabase';

export async function getServerSideProps({ params }) {
  const { token } = params;

  try {
    const rows = await dbGet('tokens', { token });
    if (!rows.length) {
      return { redirect: { destination: '/go/invalid', permanent: false } };
    }
    const { purpose, name, email } = rows[0];
    const params = new URLSearchParams({ token });
    if (name)  params.set('name', name);
    if (email) params.set('email', email);
    return { redirect: { destination: `/${purpose}?${params}`, permanent: false } };
  } catch {
    return { redirect: { destination: '/go/invalid', permanent: false } };
  }
}

export default function GoPage() {
  return null;
}
