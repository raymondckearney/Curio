import { useEffect } from 'react'

const STUDIO_URL = 'https://curio-cms.sanity.studio'

export default function StudioPage() {
  useEffect(() => {
    window.location.replace(STUDIO_URL)
  }, [])

  return (
    <div style={{ padding: 48, fontFamily: 'sans-serif', color: '#333', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>Redirecting to Studio…</h1>
      <p style={{ marginBottom: 24 }}>
        Taking you to{' '}
        <a href={STUDIO_URL} style={{ color: '#059669' }}>{STUDIO_URL}</a>
      </p>
      <hr style={{ margin: '32px 0', borderColor: '#eee' }} />
      <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>
        If the studio URL isn't live yet, run this once in your local project folder:
      </p>
      <pre style={{
        background: '#f4f4f4',
        padding: '12px 16px',
        borderRadius: 8,
        fontSize: 13,
        marginTop: 12,
        overflowX: 'auto',
      }}>
        npx sanity@3 login{'\n'}
        npx sanity@3 deploy
      </pre>
    </div>
  )
}
