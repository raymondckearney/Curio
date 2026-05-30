import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) return { redirect: { destination: '/admin/login', permanent: false } };
  return { redirect: { destination: '/admin/tokens', permanent: false } };
}

export default function AdminIndex() {
  return null;
}
