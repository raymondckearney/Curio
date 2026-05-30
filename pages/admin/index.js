import { getSession } from 'next-auth/react';

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) return { redirect: { destination: '/admin/login', permanent: false } };
  return { redirect: { destination: '/admin/tokens', permanent: false } };
}

export default function AdminIndex() {
  return null;
}
