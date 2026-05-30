import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

export function useTokenGate(purpose) {
  const router = useRouter();
  const [status, setStatus] = useState('loading');
  const [participant, setParticipant] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;

    const t = router.query.token;
    if (!t) {
      setStatus('no_token');
      return;
    }

    setToken(t);

    fetch(`/api/tokens/validate?token=${encodeURIComponent(t)}`)
      .then(r => r.json())
      .then(data => {
        setStatus(data.status);
        if (data.status === 'valid') {
          setParticipant({ name: data.name, email: data.email });
        }
      })
      .catch(() => setStatus('not_found'));
  }, [router.isReady, router.query.token]);

  const consume = useCallback(
    async (resultPayload) => {
      const res = await fetch('/api/tokens/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, result_payload: resultPayload }),
      });
      const data = await res.json();
      if (data.success) setStatus('used');
      return data;
    },
    [token]
  );

  return { status, participant, token, consume };
}
