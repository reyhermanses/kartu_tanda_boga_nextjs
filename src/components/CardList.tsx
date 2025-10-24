import { useEffect, useState } from 'react'
import { LoyaltyCard } from './LoyaltyCard'

type Props = {
  selectedIndex?: number
  onSelect?: (index: number, url: string) => void
}
export function CardList({ selectedIndex, onSelect }: Props) {
  const [images, setImages] = useState<string[]>([])
  const [internalSelectedIdx, setInternalSelectedIdx] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchImages() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('https://alpha-api.mybogaloyalty.id/membership-card', { cache: 'no-store' })
        console.log('response', res)
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        const data = await res.json()
        if (!cancelled) setImages(Array.isArray(data) ? data : [])
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchImages()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <div className="text-sm text-neutral-500">Loading cards…</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>
  if (images.length === 0) return <div className="text-sm text-neutral-500">No cards found.</div>

  const effectiveSelected = selectedIndex ?? internalSelectedIdx

  function handleSelect(idx: number) {
    const url = images[idx]
    if (onSelect) onSelect(idx, url)
    setInternalSelectedIdx(idx)
  }

  return (
    <div className="space-y-4 p-2 -mx-4">
      {images.map((img, idx) => (
        <LoyaltyCard
          key={idx}
          backgroundImageUrl={img}
          colorFrom="#111827"
          colorTo="#111827"
          tierLabel=""
          name=""
          pointsLabel="0 pts"
          cardNumber="6202 1000 8856 6962"
          holderLabel="Card Holder"
          selected={effectiveSelected === idx}
          onClick={() => handleSelect(idx)}
        />
      ))}
    </div>
  )
}


