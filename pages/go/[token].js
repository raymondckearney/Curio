import { dbGet } from '../../lib/supabase';

export async function getServerSideProps({ params }) {
  const { token } = params;

  try {
    const rows = await dbGet('tokens', { token });
    if (!rows.length) {
      return { redirect: { destination: '/go/invalid', permanent: false } };
    }
    const { purpose, name, email, role, used, quiz_version } = rows[0];
    if (used) {
      return { redirect: { destination: '/go/invalid?reason=used', permanent: false } };
    }
    const qs = new URLSearchParams({ token });
    if (name)  qs.set('name', name);
    if (email) qs.set('email', email);
    if (role)  qs.set('role', role);
    // Assessment tokens created before the native-quiz cutover are stamped
    // quiz_version='typeform' (see supabase/migrations/0007_quiz_version.sql)
    // and keep going through the intro page to the Typeform embed, exactly
    // as they always have — old links must never change destination.
    // Everything else (the default going forward) skips straight to /quiz,
    // whose own setup screen already covers what the intro page did.
    const dest = purpose === 'assessment'
      ? (quiz_version === 'typeform' ? `/assessment/intro?${qs}` : `/quiz?${qs}`)
      : `/${purpose}?${qs}`;
    return { redirect: { destination: dest, permanent: false } };
  } catch {
    return { redirect: { destination: '/go/invalid', permanent: false } };
  }
}

export default function GoPage() {
  return null;
}
