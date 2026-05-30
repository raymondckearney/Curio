import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => r.ok ? router.replace('/admin/tokens') : router.replace('/admin/login'))
      .catch(() => router.replace('/admin/login'));
  }, [router]);

  return null;
}
