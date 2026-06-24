import { useEffect, useState } from 'react'

export default function StudioPage() {
  const [state, setState] = useState('loading')
  const [error, setError] = useState(null)
  const [StudioComp, setStudioComp] = useState(null)

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

  useEffect(() => {
    if (!projectId || !dataset) {
      setError(`Missing env vars. NEXT_PUBLIC_SANITY_PROJECT_ID="${projectId}", NEXT_PUBLIC_SANITY_DATASET="${dataset}"`)
      setState('error')
      return
    }

    Promise.all([
      import('sanity'),
      import('../../sanity.config'),
    ])
      .then(([{ Studio }, { default: config }]) => {
        setStudioComp(() => () => (
          <Studio config={config} unstable_globalStyles />
        ))
        setState('ready')
      })
      .catch((err) => {
        setError(err?.message || String(err))
        setState('error')
      })
  }, [])

  if (state === 'error') {
    return (
      <div style={{ padding: 40, fontFamily: 'monospace', color: 'red' }}>
        <strong>Studio failed to load:</strong>
        <pre style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>{error}</pre>
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#555' }}>
        <p>Loading studio…</p>
        <p style={{ fontSize: 12, marginTop: 8 }}>
          Project: {projectId || '(not set)'} / Dataset: {dataset || '(not set)'}
        </p>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      <StudioComp />
    </div>
  )
}
