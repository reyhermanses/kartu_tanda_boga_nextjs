import { ChevronRight, QrCode } from 'lucide-react'
import type { LoyaltyCardProps } from '../types'

export function LoyaltyCard(props: LoyaltyCardProps) {
  const { colorFrom, colorTo, backgroundImageUrl, tierLabel, pointsLabel, cardNumber, holderLabel, selected, onClick, avatarUrl, hideChoose } = props
  return (
    <div className="rounded-none shadow-card p-0" onClick={onClick}>
      <div
        className="relative h-[266px] rounded-lg p-4 text-white overflow-hidden"
        style={backgroundImageUrl
          ? {
            backgroundImage: `url(${backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }
          : { background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})` }}
      >
        {/* Watermark letter */}
        {/* <div className="pointer-events-none select-none absolute -right-3 top-0 text-white opacity-20 font-black" style={{ fontSize: 160, lineHeight: 1 }}>
          {tierLabel?.[0] ?? 'B'}
        </div> */}

        {/* Top row: centered tier badge and Show QR */}
        <div className="relative flex items-start justify-between">
          <div className='flex flex-row items-center justify-center gap-2'>
          <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white -mt-1">
            <img 
              src={avatarUrl || '/profpict.jpg'} 
              alt="avatar" 
              className="h-full w-full object-cover"
              onError={(e) => {
                console.log('Avatar image failed to load:', avatarUrl)
                e.currentTarget.src = '/profpict.jpg'
              }}
              onLoad={() => {
                console.log('Avatar image loaded successfully:', avatarUrl)
              }}
            />
          </div>
            {/* <div className="absolute left-1/2 -translate-x-1/2"> */}
              {/* <span className="rounded-md bg-white/30 px-2 py-[2px] text-xs font-extrabold uppercase tracking-wide text-white shadow-sm"> */}
                {tierLabel}
              {/* </span> */}
            {/* </div> */}
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-transparent px-2 py-1 text-xs font-medium text-white">
            <QrCode className="h-3 w-3" /> Show QR
          </button>
        </div>

        {/* Card number */}
        <div className="mt-[20px] text-[18px] tracking-[0.25em] font-semibold text-white/90 text-right">
          {cardNumber}
          <div className="border-t border-white/70" />
        </div>
        {/* <div className="mt-1 border-t border-white/70" /> */}

        {/* Points row */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-white/90">Your points</div>
          <div className="text-lg font-semibold text-white/90">{pointsLabel}</div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 flex items-center justify-between">
          <div>
            <div className="text-sm text-white/90">Card Holder</div>
            <div className="mt-1 text-lg font-extrabold leading-none text-white drop-shadow-sm">{holderLabel}</div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-amber-500 font-semibold shadow">
            My XP Status <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
      {!hideChoose && (
        <label className="mt-2 flex w-full items-center justify-center gap-2 p-2 text-sm text-center">
          <input type="radio" name="card" checked={!!selected} onChange={onClick} required />
          <span>Choose</span>
        </label>
      )}
    </div>
  )
}


