import { dbGet } from '../../lib/supabase';

export async function getServerSideProps({ params }) {
  const { token } = params;

  try {
    const rows = await dbGet('tokens', { token });
    if (!rows.length) {
      return { redirect: { destination: '/go/invalid', permanent: false } };
    }
    const { purpose } = rows[0];
    return { redirect: { destination: `/${purpose}?token=${token}`, permanent: false } };
  } catch {
    return { redirect: { destination: '/go/invalid', permanent: false } };
  }
}

export default function GoPage() {
  return null;
}
