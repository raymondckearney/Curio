import Head from 'next/head';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

const FORM_ID = '01KSPEY5T3A63WKTMY1XMBT178';

export default function Assessment() {
  const router = useRouter();
  const embedRef = useRef(null);

  useEffect(() => {
    if (!router.isReady) return;

    const { token, name, email } = router.query;

    // Global callback that Typeform calls on submit via data-tf-on-submit
    window.__curioTfSubmit = () => {
      if (token) {
        window.location.href = `/results/pending?token=${encodeURIComponent(token)}&name=${encodeURIComponent(name || '')}`;
      }
    };

    // Also catch via postMessage in case data-tf-on-submit isn't supported
    const onMessage = (e) => {
      if (!e.data) return;
      const type = e.data.type || e.data['type'];
      if (type === 'form-submit' || type === 'typeform:submit') {
        window.__curioTfSubmit();
      }
    };
    window.addEventListener('message', onMessage);

    if (embedRef.current) {
      const hiddenParts = [];
      if (name)  hiddenParts.push(`participant_name=${name}`);
      if (email) hiddenParts.push(`participant_email=${email}`);
      if (token) hiddenParts.push(`participant_token=${token}`);
      if (hiddenParts.length) {
        embedRef.current.setAttribute('data-tf-hidden', hiddenParts.join(','));
      }
      embedRef.current.setAttribute('data-tf-on-submit', '__curioTfSubmit');
    }

    const existing = document.querySelector('script[src*="typeform.com/next/embed"]');
    if (existing) {
      // Script already loaded; re-init by dispatching a DOM event
      if (window.tf && window.tf.load) window.tf.load();
      return () => window.removeEventListener('message', onMessage);
    }

    const script = document.createElement('script');
    script.src = '//embed.typeform.com/next/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      window.removeEventListener('message', onMessage);
      delete window.__curioTfSubmit;
    };
  }, [router.isReady, router.query]);

  return (
    <>
      <Head>
        <title>Take the Assessment — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <style>{`
          html, body { margin: 0; padding: 0; background: #fff; }
          .tf-wrap {
            min-height: 100vh;
            display: flex;
            align-items: flex-start;
          }
          [data-tf-live] { width: 100%; min-height: 100vh; }
        `}</style>
      </Head>
      <div className="tf-wrap">
        <div ref={embedRef} data-tf-live={FORM_ID} />
      </div>
    </>
  );
}
