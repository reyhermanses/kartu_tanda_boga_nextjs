import { useState, useEffect, useMemo } from 'react'
import type { FormValues } from '../types'

type CardDesign = {
  id: number
  name: string
  imageUrl: string
  tier: string
}

type Props = {
  values: FormValues
  onNext: (selectedCard: CardDesign) => void
  onBack: () => void
}

export function CardSelectionPage({ values, onNext, onBack }: Props) {
  const [currentCardIndex, setCurrentCardIndex] = useState(1) // Start with second card (index 1)
  const [cards, setCards] = useState<CardDesign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [profileImageError, setProfileImageError] = useState(false)
  // Mouse event states for desktop
  const [mouseStart, setMouseStart] = useState<number | null>(null)
  const [mouseEnd, setMouseEnd] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)


  // Handle profile image URL - ALWAYS prioritize values.photoFile over sessionStorage
  useEffect(() => {
    console.log('=== CARD SELECTION: PHOTO FILE CHANGED ===')
    console.log('values.photoFile:', values.photoFile)

    // Function to convert File to base64
    const convertFileToBase64 = (file: File) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          resolve(result)
        }
        reader.onerror = () => {
          reject(new Error('Failed to read file'))
        }
        reader.readAsDataURL(file)
      })
    }

    // PRIORITY 1: Check if we have a File object from values (MOST CURRENT)
    if (values.photoFile && values.photoFile instanceof File) {
      console.log('Converting File to base64...')
      setProfileImageError(false)
      convertFileToBase64(values.photoFile)
        .then((base64) => {
          console.log('✅ File converted to base64, length:', base64.length)
          setProfileImageUrl(base64)
          sessionStorage.setItem('profileImageData', base64)
        })
        .catch((error) => {
          console.error('Error converting file to base64:', error)
          setProfileImageError(true)
          setProfileImageUrl(null)
        })
      return
    }

    // PRIORITY 2: Check if it's already a base64 string
    if (typeof values.photoFile === 'string' && (values.photoFile as string).startsWith('data:image/')) {
      console.log('✅ photoFile is base64 string')
      setProfileImageUrl(values.photoFile as string)
      sessionStorage.setItem('profileImageData', values.photoFile as string)
      setProfileImageError(false)
      return
    }

    // PRIORITY 3: Fallback to sessionStorage (for page refresh)
    const savedImageData = sessionStorage.getItem('profileImageData')
    if (savedImageData && savedImageData.startsWith('data:image/')) {
      console.log('✅ Loading image from sessionStorage (fallback)')
      setProfileImageUrl(savedImageData)
      setProfileImageError(false)
      return
    }

    // No photo available
    console.log('⚠️ No photoFile available')
    setProfileImageUrl(null)
    setProfileImageError(false)
  }, [values.photoFile])

  // Initialize profile image from sessionStorage on mount
  useEffect(() => {
    const savedImageData = sessionStorage.getItem('profileImageData')
    if (savedImageData && savedImageData.startsWith('data:image/')) {
      setProfileImageUrl(savedImageData)
    }
  }, [])

  // Load cards from backend
  useEffect(() => {
    const loadCards = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://api.mybogaloyalty.id/membership-card', {
          method: 'GET',
          headers: {
            'X-BOGAMBC-Key': 'gKl7TGgtIW3vzJmMoKYjklAgi7lE4Qo9',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }

        const data = await response.json()
        console.log('Cards API response:', data)

        // Transform API response to our card format
        const transformedCards = Array.isArray(data) ? data.map((card: any, index: number) => ({
          id: index + 1,
          name: card.title || getCardNameFromUrl(card.image),
          imageUrl: card.image,
          tier: 'basic'
        })) : []

        setCards(transformedCards)
      } catch (err) {
        console.error('Error loading cards:', err)
        setError('Failed to load cards. Please try again.')
        // Fallback to default cards if API fails
        setCards([
          { id: 1, name: 'JAPANESE', imageUrl: '', tier: 'basic' },
          { id: 2, name: 'COLORFULL', imageUrl: '', tier: 'basic' },
          { id: 3, name: 'NATURAL', imageUrl: '', tier: 'basic' },
          { id: 4, name: 'MODERN', imageUrl: '', tier: 'basic' },
          { id: 5, name: 'CLASSIC', imageUrl: '', tier: 'basic' }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadCards()
  }, [])

  // Helper function to get card name from URL
  const getCardNameFromUrl = (url: string): string => {
    if (url.includes('japanese') || url.includes('japan')) return 'JAPANESE'
    if (url.includes('colorful') || url.includes('color')) return 'COLORFULL'
    if (url.includes('natural') || url.includes('nature')) return 'NATURAL'
    return 'CARD'
  }


  const nextCard = () => {
    console.log('=== NEXT CARD CLICKED ===')
    console.log('Current index before:', currentCardIndex)
    console.log('Cards length:', cards.length)

    if (cards.length > 0) {
      setCurrentCardIndex((prev) => {
        // Infinite loop: wrap to 0 when reaching the end
        const newIndex = (prev + 1) % cards.length
        console.log('Next card (infinite):', newIndex, 'Total cards:', cards.length)
        return newIndex
      })
    }
  }

  const prevCard = () => {
    console.log('=== PREV CARD CLICKED ===')
    console.log('Current index before:', currentCardIndex)
    console.log('Cards length:', cards.length)

    if (cards.length > 0) {
      setCurrentCardIndex((prev) => {
        // Infinite loop: wrap to last card when going before 0
        const newIndex = prev - 1 < 0 ? cards.length - 1 : prev - 1
        console.log('Prev card (infinite):', newIndex, 'Total cards:', cards.length)
        return newIndex
      })
    }
  }

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    console.log('=== TOUCH START ===')
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientY)
    console.log('Touch start Y:', e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // Only update touchEnd, don't log to reduce re-render noise
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const handleTouchEnd = () => {
    console.log('=== TOUCH END ===')
    console.log('Touch start:', touchStart)
    console.log('Touch end:', touchEnd)

    if (!touchStart || !touchEnd) {
      console.log('Missing touch data, ignoring')
      return
    }

    const distance = touchStart - touchEnd
    const isUpSwipe = distance > 50
    const isDownSwipe = distance < -50

    console.log('Swipe detected:', {
      distance,
      isUpSwipe,
      isDownSwipe,
      touchStart,
      touchEnd
    })

    if (isUpSwipe) {
      console.log('Swipe up - going to next card')
      nextCard() // Swipe up = next card
    } else if (isDownSwipe) {
      console.log('Swipe down - going to previous card')
      prevCard() // Swipe down = previous card
    } else {
      console.log('Swipe distance too small, ignoring')
    }
  }

  // Mouse handlers for desktop swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    console.log('=== MOUSE DOWN ===')
    setIsDragging(true)
    setMouseEnd(null)
    setMouseStart(e.clientY)
    console.log('Mouse start Y:', e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setMouseEnd(e.clientY)
  }

  const handleMouseUp = () => {
    console.log('=== MOUSE UP ===')
    console.log('Mouse start:', mouseStart)
    console.log('Mouse end:', mouseEnd)

    if (!isDragging || !mouseStart || !mouseEnd) {
      console.log('Missing mouse data or not dragging, ignoring')
      setIsDragging(false)
      return
    }

    const distance = mouseStart - mouseEnd
    const isUpDrag = distance > 50
    const isDownDrag = distance < -50

    console.log('Drag detected:', {
      distance,
      isUpDrag,
      isDownDrag,
      mouseStart,
      mouseEnd
    })

    if (isUpDrag) {
      console.log('Drag up - going to next card')
      nextCard() // Drag up = next card
    } else if (isDownDrag) {
      console.log('Drag down - going to previous card')
      prevCard() // Drag down = previous card
    } else {
      console.log('Drag distance too small, ignoring')
    }

    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    // Reset dragging state when mouse leaves the container
    if (isDragging) {
      console.log('Mouse left container, resetting drag state')
      setIsDragging(false)
    }
  }

  // Memoize visible cards to prevent re-computation on every render
  const visibleCards = useMemo(() => {
    console.log('=== COMPUTING VISIBLE CARDS (useMemo) ===')
    console.log('Total cards from backend:', cards.length)
    console.log('Current index:', currentCardIndex)

    let computed: CardDesign[] = []

    if (cards.length >= 3) {
      // Infinite loop logic: wrap around using modulo
      const prevIndex = currentCardIndex - 1 < 0 ? cards.length - 1 : currentCardIndex - 1
      const nextIndex = (currentCardIndex + 1) % cards.length
      
      computed = [
        cards[prevIndex],  // Previous card (wraps to last if at 0)
        cards[currentCardIndex],  // Current card
        cards[nextIndex]  // Next card (wraps to first if at last)
      ]
      
      console.log('Infinite loop cards:', {
        prev: prevIndex,
        current: currentCardIndex,
        next: nextIndex
      })
    } else if (cards.length > 0) {
      // For 1-2 cards, duplicate to make 3
      computed = [...cards]
      while (computed.length < 3) {
        computed.push(cards[0]) // Duplicate first card
      }
    } else {
      // Fallback if no cards
      computed = [
        { id: 1, name: 'CARD 1', imageUrl: '', tier: 'basic' },
        { id: 2, name: 'CARD 2', imageUrl: '', tier: 'basic' },
        { id: 3, name: 'CARD 3', imageUrl: '', tier: 'basic' }
      ]
    }

    console.log('Visible cards computed:', computed.map(c => c.name))
    return computed
  }, [cards, currentCardIndex]) // Only recompute when cards or currentCardIndex changes

  // Convert image to base64
  async function convertImageToBase64(url: string): Promise<string> {
    try {
      console.log('Converting image to blob:', url)

      // For blob URLs (profile images), use FileReader directly
      if (url.startsWith('blob:')) {
        console.log('Converting blob URL directly')
        const response = await fetch(url)
        console.log('Response img to blob:', response)
        const blob = await response.blob()
        console.log('Blob size:', blob.size)

        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const base64 = reader.result as string
            console.log('Blob URL converted to base64, length:', base64.length)
            resolve(base64)
          }
          reader.onerror = () => reject(new Error('Failed to convert blob to base64'))
          reader.readAsDataURL(blob)
        })
      }

      // For external URLs (card images), use local proxy API
      console.log('Converting external URL with local proxy method')
      try {
        // Use local proxy API to avoid CORS issues
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`
        console.log('Trying local proxy URL:', proxyUrl)

        const response = await fetch(proxyUrl)
        if (!response.ok) {
          throw new Error(`Local proxy request failed: ${response.status}`)
        }

        const blob = await response.blob()
        console.log('Local proxy blob size:', blob.size)

        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const base64 = reader.result as string
            console.log('External URL converted to base64 via proxy, length:', base64.length)
            resolve(base64)
          }
          reader.onerror = () => reject(new Error('Failed to convert proxy blob to base64'))
          reader.readAsDataURL(blob)
        })
      } catch (proxyError) {
        console.log('Proxy method failed, storing URL instead:', proxyError)
        // Fallback: just store the URL, let CardDownloader handle it
        throw new Error('Proxy conversion failed, will use URL fallback')
      }
    } catch (error) {
      console.log('Conversion failed:', error)
      throw error
    }
  }

  const handleSubmit = async () => {
    if (cards.length > 0) {
      setIsProcessing(true)

      // Submit the current card based on currentCardIndex
      let selectedCardIndex = currentCardIndex
      let selectedCard = cards[selectedCardIndex]
      console.log('Submitting card:', selectedCardIndex, selectedCard?.name)
      console.log('Selected card object:', selectedCard)
      console.log('Selected card image URL:', selectedCard?.imageUrl)
      console.log(typeof selectedCard?.imageUrl)

      // Convert card image to blob and store
      if (selectedCard.imageUrl) {
        try {
          console.log('Converting card image to base64:', selectedCard.imageUrl)
          const cardBlob = await convertImageToBase64(selectedCard.imageUrl)
          if (cardBlob) {
            sessionStorage.setItem('selectedCardBlob', cardBlob)
            console.log('Card blob saved to sessionStorage, length:', cardBlob.length)
          }
        } catch (error) {
          console.log('Failed to convert card image to blob, storing URL instead:', error)
          // Fallback: store URL for CardDownloader to handle
          sessionStorage.setItem('selectedCardUrl', selectedCard.imageUrl)
          console.log('Card URL saved to sessionStorage as fallback')
        }
      }

      // Profile image is already saved in profileImageData by useEffect
      // Just make sure it's also in selectedProfileBlob for CardDownloader
      if (profileImageUrl) {
        try {
          console.log('Saving profile image to sessionStorage for download')

          // If it's already a base64 string, use it directly
          if (profileImageUrl.startsWith('data:image/')) {
            sessionStorage.setItem('selectedProfileBlob', profileImageUrl)
            // Also ensure it's in profileImageData
            sessionStorage.setItem('profileImageData', profileImageUrl)
            console.log('Profile base64 data saved to sessionStorage, length:', profileImageUrl.length)
          } else {
            // If it's a blob URL, convert it
            const profileBlob = await convertImageToBase64(profileImageUrl)
            if (profileBlob) {
              sessionStorage.setItem('selectedProfileBlob', profileBlob)
              sessionStorage.setItem('profileImageData', profileBlob)
              console.log('Profile blob saved to sessionStorage, length:', profileBlob.length)
            }
          }
        } catch (error) {
          console.log('Failed to convert profile image to blob:', error)
        }
      }

      // Pass the original card data
      onNext(selectedCard)
    }

    setIsProcessing(false)
  }

  const currentCard = cards[currentCardIndex]

  // console.log('Current card index:', currentCardIndex)
  // console.log('Total cards:', cards.length)
  // console.log('Current card:', currentCard)

  // Debug useEffect to track currentCardIndex changes
  useEffect(() => {
    // console.log('=== CURRENT CARD INDEX CHANGED ===')
    // console.log('New index:', currentCardIndex)
    // console.log('Cards length:', cards.length)
  }, [currentCardIndex, cards.length])

  // Cleanup sessionStorage on unmount
  useEffect(() => {
    return () => {
      // Don't clear sessionStorage here as we need it for other pages
      // Just revoke any blob URLs
      if (profileImageUrl && profileImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(profileImageUrl)
      }
    }
  }, [profileImageUrl])

  if (loading) {
    return (
      <div className="min-h-screen bg-red-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading cards...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-600 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-white text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white text-red-600 rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-red-600 flex items-center justify-center">
        <p className="text-white text-lg">No cards available</p>
      </div>
    )
  }

  return (
    <div
      className="relative bg-red-600 flex flex-col"
      style={{
        height: '100dvh',
        overflow: 'visible',
        touchAction: 'none',
        overscrollBehavior: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Background Image - Full Viewport Height */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none'
        }}
      ></div>

      {/* Header - Fixed positioned at top for iOS compatibility */}
      <div 
        className="px-2 sm:px-4 py-2 sm:py-4 flex justify-between items-center"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          width: '100%',
          maxWidth: '390px',
          margin: '0 auto'
        }}
      >
        <button
          onClick={() => {
            console.log('Back button clicked in CardSelectionPage')
            onBack()
          }}
          className="text-white cursor-pointer p-2 rounded-full hover:bg-white/10 transition-colors"
          style={{ pointerEvents: 'auto' }}
        >
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white text-sm sm:text-lg font-bold">Pilih Kartu Membership Kamu</h1>
        <div></div>
      </div>

      {/* Spacer to prevent content from being hidden under fixed header */}
      <div style={{ height: '60px' }}></div>

      {/* Card Preview Container - Show 3 Cards at a time */}
      <div className="px-4 sm:px-4 mb-2 sm:mb-4 relative flex-1 flex flex-col" style={{ zIndex: 10, marginTop: '-80px' }}>
        <div
          className="absolute top-20 left-0 right-0 flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            touchAction: 'pan-y',
            overscrollBehavior: 'none',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none'
          }}
        >
          {/* 3 Visible Cards Container */}
          <div className="space-y-4 flex flex-col p-2">
            {visibleCards.map((card, visibleIndex) => {
              // Calculate which card is selected - ALWAYS select middle card (index 1)
              let isSelected = false
              if (cards.length >= 3) {
                // For 3+ cards, ALWAYS select the middle card (index 1) of visible cards
                isSelected = visibleIndex === 1
              } else {
                // For less than 3 cards, the current card is selected
                isSelected = visibleIndex === currentCardIndex
              }
              // console.log(`Card ${visibleIndex}: ${card.name}, isSelected: ${isSelected}, currentCardIndex: ${currentCardIndex}`)

              return (
                card.tier !== 'empty' ?
                  <div key={`card-${card.id}-${visibleIndex}`}>
                    <div
                      className={`rounded-2xl relative overflow-hidden shadow-2xl transition-all duration-300 
                          ${isSelected
                          ? 'w-full h-[220px]'
                          : 'w-full h-42 scale-75 blur-[4px]'}`}
                      style={{
                        background: card.tier === 'empty' ? 'transparent' : (card.imageUrl ? `url(${card.imageUrl})` : '#f3f4f6'),
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      {/* KTB BOGA GROUP Logo - Top Left */}
                      {/* {card.tier !== 'empty' && (
                      <div className="absolute top-4 left-4 text-white">
                        <div className="font-bold text-lg">KTB</div>
                        <div className="text-sm font-semibold">BOGA GROUP</div>
                      </div>
                    )} */}

                      {/* BOGA Logo - Top Right */}
                      {/* {card.tier !== 'empty' && (
                      <div className="absolute top-4 right-4 text-white">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2">
                            <span className="text-black font-bold text-xs">G</span>
                          </div>
                          <div>
                            <div className="font-bold text-sm">BOGA</div>
                            <div className="text-xs">GROUP</div>
                          </div>
                        </div>
                      </div>
                    )} */}

                      {/* Profile Picture */}
                      {card.tier !== 'empty' && (
                        <div className={`absolute right-9 -translate-y-1/2 
                          ${isSelected ? 'top-[60px]' : 'top-[60px]'}`}>
                          <div className="
                            w-20 h-20 
                            rounded-full 
                            overflow-hidden 
                            border-4 
                            border-white 
                            shadow-lg 
                            bg-blue-200">
                            {profileImageUrl && !profileImageError ? (
                              <img
                                src={profileImageUrl}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={() => {
                                  console.error('Image failed to load')
                                  setProfileImageError(true)
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-blue-200 flex items-center justify-center">
                                {profileImageError ? (
                                  <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* User Info Card - Right Position with Centered Content */}
                      {card.tier !== 'empty' && (
                        <div className="absolute bottom-4 right-10 text-center">
                          <div className={`flex items-center justify-end mb-2 ${isSelected ? 'mb-1' : 'mb-[-16px] scale-75'}`}>
                            <div className="bg-white rounded-full px-2 py-1 sm:px-3 sm:py-1 flex items-center shadow-xl">
                              <span className="text-black font-extrabold text-xs sm:text-sm mr-1 sm:mr-2">{values.name || 'Valerie'}</span>
                              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-center w-fit">
                            {/* <div className="bg-blue-400 rounded-full px-2 py-1 sm:px-3 sm:py-1 flex items-center shadow-lg w-fit">
                                <span className="text-white font-extrabold text-[10px] sm:text-xs" style={{ fontFamily: 'Roboto' }}>{values.birthday ? formatBirthday(values.birthday) : '13 SEP 1989'}</span>
                              </div> */}
                            <div className="text-white font-extrabold text-[14px] sm:text-xs w-fit" style={{ fontFamily: 'Roboto', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8), 1px -1px 2px rgba(0, 0, 0, 0.8), -1px 1px 2px rgba(0, 0, 0, 0.8)' }}>{values.phone ? values.phone.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '0877-9832-0931'}</div>
                            <div className="text-white font-extrabold text-[13px] w-fit" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8), 1px -1px 2px rgba(0, 0, 0, 0.8), -1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                              <div>{values.email || 'valeriebahagia@gmail.com'}</div>
                            </div>
                            <div className="text-white font-extrabold text-[13px] w-fit" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8), 1px -1px 2px rgba(0, 0, 0, 0.8), -1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                              <div>6202100027100645</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* {isSelected && <div className='pt-2 text-white text-center uppercase tracking-widest font-semibold' style={{ letterSpacing: '0.4em' }}>{card.name}</div>} */}
                  </div>
                  :
                  <div key={`empty-${visibleIndex}`} className='flex text-white text-center h-32 justify-center items-center'></div>
                // <div className='flex text-white text-center h-32 justify-center items-center'>Tidak ada kartu tersedia</div>
              )
            })}
          </div>

          {/* Card Title Display - Show title of the main/center card */}
          {/* {cards.length > 0 && (
            <div className="text-center mt-[-20px]">
              <div className="text-white text-lg font-semibold">
                {cards[currentCardIndex]?.name || 'Card Title'}
              </div>
            </div>
          )} */}

          {/* Navigation Arrows - Always show for infinite loop */}
          {cards.length > 0 && (
            <button
              onClick={() => {
                // console.log('=== PREV BUTTON CLICKED ===')
                // console.log('Current index:', currentCardIndex)
                prevCard()
              }}
              className="absolute top-16 sm:top-16 left-1/2 transform -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all"
            >
              <svg className="w-16 h-16
              text-white font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}

          {cards.length > 0 && (
            <button
              onClick={() => {
                // console.log('=== NEXT BUTTON CLICKED ===')
                // console.log('Current index:', currentCardIndex)
                nextCard()
              }}
              className="absolute bottom-16 sm:bottom-16 left-1/2 transform -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all"
            >
              <svg className="w-16 h-16 
              text-white font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Submit Button */}
      {/* <div className="flex justify-center 
      mt-[-75px]
      max-[375px]:mt-[-60px]
      max-[390px]:mt-[-60px]
      max-[414px]:mt-[-75px]
      max-[430px]:mt-[-60px]
      mb-4 relative z-20">
        <button
          onClick={handleSubmit}
          className="submit-button p-3 w-[150px] text-red-600 text-lg rounded-[20px] font-black relative z-50"
          style={{
            fontFamily: 'Roboto',
            fontWeight: 900,
            zIndex: 50
          }}
        >
          SUBMIT
        </button>
      </div> */}
      <div
        className="absolute bottom-2 left-0 right-0 flex justify-center pb-[20px]"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          touchAction: 'none',
          overscrollBehavior: 'none',
          zIndex: 50
        }}
      >
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="submit-button bg-white p-3 w-[150px] text-red-600 text-lg rounded-[20px] font-black disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ fontFamily: 'Roboto', fontWeight: 900 }}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Kartu Tersimpan</span>
            </>
          ) : (
            'Simpan'
          )}
        </button>
      </div>
    </div>
  )
}
