import { useEffect } from 'react'
import { Footer } from './Footer'

type Props = {
  onNext: () => void
}

export function SplashScreen({ onNext }: Props) {
  useEffect(() => {
    // Auto navigate after 3 seconds
    const timer = setTimeout(() => {
      onNext()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onNext])

  return (
    <div className="splash-screen">
      {/* Background Image - Bottom Full Height */}
      <div 
        className="absolute bottom-0 left-0 right-0 top-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center space-y-8 relative z-10">
        {/* BOGA GROUP Logo */}
        <div className="text-center">
          <img 
            src="/BogaGroupLogo.png" 
            alt="Boga Group Logo" 
            className="w-48 h-48 mx-auto mb-4"
          />
        </div>
      </div>

      {/* Loading indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-8 h-1 bg-white/30 rounded-full">
          <div className="w-8 h-1 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}