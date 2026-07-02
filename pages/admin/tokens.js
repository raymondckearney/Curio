import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminTokensRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin'); }, [router]);
  return null;
}
