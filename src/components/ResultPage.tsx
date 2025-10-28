import { useState, useEffect, useRef } from 'react'
import { CouponCarousel } from './CouponCarousel'
import { Footer } from './Footer'
import { CardDownloader } from './CardDownloader'

type CreateMembershipResponse = {
  status: string
  message: string
  data: {
    name: string
    email?: string
    phone?: string
    birthday?: string
    profileImage: string
    cardImage: string
    serial: string
    point: number
    tierTitle: string
    isEligibleForCoupon: boolean
    coupons: any[]
  }
}

type Props = {
  created: CreateMembershipResponse['data']
  values: {
    name: string
    phone: string
    email: string
    birthday: string
    photoFile: File | null
  }
  selectedCardUrl: string
  onBack: () => void
}

export function ResultPage({ created, values, selectedCardUrl }: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)


  // Create avatar URL - PRIORITY: sessionStorage > photoFile > API response
  useEffect(() => {
    console.log('=== LOADING AVATAR IMAGE ===')

    // PRIORITY 1: Check sessionStorage first (most reliable on refresh)
    const savedProfileImage = sessionStorage.getItem('profileImageData')
    if (savedProfileImage && savedProfileImage.startsWith('data:image/')) {
      console.log('✅ Using avatar from sessionStorage')
      setAvatarUrl(savedProfileImage)
      return
    }

    // PRIORITY 2: Check if we have photoFile from props
    if (values.photoFile) {
      // Check if photoFile is a File object
      if (values.photoFile instanceof File) {
        console.log('Converting File to base64 for avatar...')
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result as string
          setAvatarUrl(base64)
          // Also save to sessionStorage for future refreshes
          sessionStorage.setItem('profileImageData', base64)
        }
        reader.onerror = () => {
          console.error('Error reading file')
          setAvatarUrl(null)
        }
        reader.readAsDataURL(values.photoFile)
        return
      }
      // Check if it's already a base64 string
      else if (typeof values.photoFile === 'string' && (values.photoFile as string).startsWith('data:image/')) {
        console.log('✅ Using avatar from photoFile (base64 string)')
        setAvatarUrl(values.photoFile as string)
        sessionStorage.setItem('profileImageData', values.photoFile as string)
        return
      }
    }

    // PRIORITY 3: Fallback to created.profileImage from API
    if (created?.profileImage) {
      console.log('✅ Using avatar from API response')
      const profileUrl = created.profileImage.startsWith('http')
        ? `/api/proxy-image?url=${encodeURIComponent(created.profileImage)}`
        : created.profileImage
      setAvatarUrl(profileUrl)
      return
    }

    // No avatar available
    console.log('⚠️ No avatar available')
    setAvatarUrl(null)
  }, [values.photoFile, created?.profileImage])

  // Handle card background image - SIMPLE: Just use created.cardImage
  useEffect(() => {
    if (created?.cardImage) {
      console.log('Card image from API:', created.cardImage)
      setCardImageUrl(created.cardImage)
    }
  }, [created?.cardImage])

  function handleClaimClick() {
    // Use smart deeplink that automatically handles device detection and store redirection
    const DEEPLINK_URL = 'https://bogaapp.boga.id'

    // Open deeplink - this will automatically:
    // - Open Boga App if installed
    // - Redirect to appropriate store (Play Store for Android, App Store for iOS) if not installed
    // - Fallback to website for other devices
    window.open(DEEPLINK_URL, '_blank')
  }


  return (
    <div className="relative">
      {/* Background Image - Full Viewport Height */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
          width: '100vw',
          height: '100vh'
        }}
      ></div>
      {/* Header */}
      {/* <div className="px-4 py-4 flex justify-between items-center">
        <button onClick={onBack} className="text-white">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white text-lg font-bold">Your Card</h1>
        <div className="w-8 h-8"></div> 
      </div> */}

      {/* Main Content */}
      <div className="flex-1 pb-4 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md p-4 space-y-4 rounded-xl">
          <div>
            <div className="text-xs text-neutral-300 mb-2">Tampilan Kartu</div>
            <div
              ref={cardRef}
              className="rounded-2xl relative overflow-hidden shadow-2xl w-full h-[210px]
              max-[375px]:h-[200px] 
              max-[440px]:h-[200px] 
              max-[414px]:h-[210px] 
              max-[390px]:h-[205px] 
              max-[430px]:h-[210px]
              "
              style={{
                backgroundImage: cardImageUrl ? `url(${cardImageUrl})` : 'none',
                backgroundColor: cardImageUrl ? 'transparent' : '#f3f4f6',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* KTB BOGA GROUP Logo - Top Left */}
              {/* <div className="absolute top-4 left-4 text-white">
                <div className="font-bold text-lg">KTB</div>
                <div className="text-sm font-semibold">BOGA GROUP</div>
              </div> */}

              {/* BOGA Logo - Top Right */}
              {/* <div className="absolute top-4 right-4 text-white">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2">
                    <span className="text-black font-bold text-xs">G</span>
                  </div>
                  <div>
                    <div className="font-bold text-sm">BOGA</div>
                    <div className="text-xs">GROUP</div>
                  </div>
                </div>
              </div> */}

              {/* Profile Picture */}
              <div className="absolute  
              right-5
              top-[60px]
              -translate-y-1/2
              ">
                <div className="
                w-[80px] h-[80px]
                rounded-full overflow-hidden border-4 border-white shadow-lg bg-blue-200">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-200 flex items-center justify-center">
                      <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* User Info Card - Right Position with Centered Content */}
              <div className="absolute bottom-[4px] right-4 text-center scale-80">
                <div className="flex items-center justify-end mb-2">
                  <div className="bg-white rounded-full px-2 py-1 sm:px-3 sm:py-1 flex items-center shadow-xl">
                    <span className="text-black font-extrabold text-xs sm:text-sm mr-1 sm:mr-2">{created?.name || values.name}</span>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center">
                  {/* <div className="bg-blue-400 rounded-full px-2 py-1 sm:px-3 sm:py-1 flex items-center shadow-lg w-fit">
                    <span className="text-white font-extrabold text-[10px] sm:text-xs" style={{ fontFamily: 'Roboto' }}>{values.birthday ? formatBirthday(values.birthday) : '13 SEP 1989'}</span>
                  </div> */}
                  <div className="text-white font-extrabold text-[15px] sm:text-xs" style={{ fontFamily: 'Roboto', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8), 1px -1px 2px rgba(0, 0, 0, 0.8), -1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                    {values.phone ? values.phone.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '0877-9832-0931'}
                  </div>
                  <div className="text-white font-extrabold text-[15px]" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8), 1px -1px 2px rgba(0, 0, 0, 0.8), -1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                    {values.email || 'valeriebahagia@gmail.com'}
                  </div>
                  <div className="text-white font-extrabold text-[14px] mt-1" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8), 1px -1px 2px rgba(0, 0, 0, 0.8), -1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                    {created?.serial || '6202100027100645'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {created.coupons.length === 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-neutral-500 text-center mb-2">
                Nomor HP ini sudah terdaftar lho!
              </div>
            </div>
          )}

          {created?.isEligibleForCoupon && created.coupons && created.coupons.length > 0 && (
            <div className="border-t border-neutral-200 pt-4">
              <div className="text-xs text-neutral-300 mb-2">Penawaran Khusus</div>
              <CouponCarousel coupons={created.coupons.map((coupon, index) => ({
                id: index + 1,
                name: coupon.name,
                image: coupon.image,
                description: '',
                validUntil: ''
              }))} />
            </div>
          )}

          <div className="flex flex-row justify-center gap-4 pt-4 sm:pt-6 md:pt-10 px-3 sm:px-6 pb-3 sm:pb-6">
            <CardDownloader
              cardData={{
                name: created?.name || values.name,
                phone: values.phone,
                email: values.email,
                birthday: values.birthday,
                profileImage: avatarUrl || null || undefined,
                cardImage: cardImageUrl || null || undefined,
                serial: created?.serial || '6202100027100645'
              }}
              selectedCardUrl={selectedCardUrl}
              onDownload={() => console.log('Download completed')}
            />
            <button
              onClick={handleClaimClick}
              className="w-[200px] py-3 sm:py-4 rounded-[20px] font-bold text-sm sm:text-lg transition-all bg-white text-red-600 hover:bg-gray-100"
            >
              Ambil Promonya Sekarang!
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}