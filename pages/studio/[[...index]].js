import dynamic from 'next/dynamic'
import config from '../../sanity.config'

const Studio = dynamic(() => import('sanity').then((m) => m.Studio), { ssr: false })

export default function StudioPage() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      <Studio config={config} />
    </div>
  )
}
