import type { CardTier } from '../types'
// import { LoyaltyCard } from './LoyaltyCard'

type Props = {
  selected: CardTier
  onChange: (t: CardTier) => void
}

export function CardPicker({ selected, onChange }: Props) {
  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Pilih Kartu</h3>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange('basic')}
          className={`p-4 rounded-xl border-2 transition-all ${
            selected === 'basic'
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="text-center">
            <div className="w-12 h-8 bg-gray-300 rounded mx-auto mb-2"></div>
            <span className="text-sm font-medium text-gray-700">Basic Card</span>
            {selected === 'basic' && (
              <div className="mt-2">
                <svg className="w-5 h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => onChange('gold')}
          className={`p-4 rounded-xl border-2 transition-all ${
            selected === 'gold'
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="text-center">
            <div className="w-12 h-8 bg-yellow-400 rounded mx-auto mb-2"></div>
            <span className="text-sm font-medium text-gray-700">Gold Card</span>
            {selected === 'gold' && (
              <div className="mt-2">
                <svg className="w-5 h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}


