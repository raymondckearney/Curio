import { useEffect, useState } from 'react'

export default function StudioPage() {
  const [state, setState] = useState('loading')
  const [error, setError] = useState(null)
  const [StudioComp, setStudioComp] = useState(null)

  useEffect(() => {
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
        Loading studio…
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      <StudioComp />
    </div>
  )
}
