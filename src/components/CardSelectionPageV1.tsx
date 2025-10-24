import { useState, useEffect } from 'react'
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

export function CardSelectionPage({ values, onNext }: Props) {
  const [currentCardIndex, setCurrentCardIndex] = useState(1) // Start with second card (index 1)
  const [cards, setCards] = useState<CardDesign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)


  // Load cards from backend
  useEffect(() => {
    const loadCards = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://alpha-api.mybogaloyalty.id/membership-card', {
          method: 'GET',
          headers: {
            'X-BOGAMBC-Key': 'ajCJotQ8Ug1USZS3KuoXbqaazY59CAvI',
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
        const next = prev + 1
        // For 4 cards: 0->1->2->3, then stop at 3
        const maxIndex = cards.length - 1
        const newIndex = next > maxIndex ? maxIndex : next
        console.log('Next card:', newIndex, 'Total cards:', cards.length)
        console.log('Will show cards:', newIndex <= 1 ? '0,1,2' : '1,2,3')
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
        const prevIndex = prev - 1
        // For 4 cards: 3->2->1->0, then stop at 0
        const newIndex = prevIndex < 0 ? 0 : prevIndex
        console.log('Prev card:', newIndex, 'Total cards:', cards.length)
        console.log('Will show cards:', newIndex <= 1 ? '0,1,2' : '1,2,3')
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
    setTouchEnd(e.targetTouches[0].clientY)
    console.log('Touch move Y:', e.targetTouches[0].clientY)
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

  // Convert image to base64 blob
  async function convertImageToBlob(url: string): Promise<string> {
    try {
      console.log('Converting image to blob:', url)
      
      // For blob URLs (profile images), use FileReader directly
      if (url.startsWith('blob:')) {
        console.log('Converting blob URL directly')
        const response = await fetch(url)
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
      
      // For external URLs (card images), try proxy first, then fallback
      console.log('Converting external URL with proxy method')
      try {
        // Try with CORS proxy
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
        console.log('Trying proxy URL:', proxyUrl)
        
        const response = await fetch(proxyUrl)
        if (!response.ok) {
          throw new Error(`Proxy request failed: ${response.status}`)
        }
        
        const blob = await response.blob()
        console.log('Proxy blob size:', blob.size)
        
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
      
          // Convert card image to blob and store
          if (selectedCard.imageUrl) {
            try {
              console.log('Converting card image to blob:', selectedCard.imageUrl)
              const cardBlob = await convertImageToBlob(selectedCard.imageUrl)
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
          
          // Convert profile image to blob and store
          if (values.photoFile) {
            try {
              console.log('Converting profile image to blob')
              const profileBlob = await convertImageToBlob(URL.createObjectURL(values.photoFile))
              if (profileBlob) {
                sessionStorage.setItem('selectedProfileBlob', profileBlob)
                console.log('Profile blob saved to sessionStorage, length:', profileBlob.length)
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
        overflow: 'hidden',
        touchAction: 'none',
        overscrollBehavior: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Background Image - Bottom Full Height */}
      <div
        className="absolute bottom-0 left-0 right-0 top-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat'
        }}
      >

      </div>
      {/* Header */}
      <div className="px-4 py-4 flex justify-center top-0 items-center relative z-10">
        <h1 className="text-white text-[22px] font-bold">Pilih Kartu Membership Kamu</h1>
      </div>

      {/* Card Preview Container - Show 3 Cards at a time */}
      <div className="px-4 sm:px-4 top-[-100px] mb-2 sm:mb-4 relative z-10 flex-1 flex flex-col">
        <div
          className="absolute top-20 left-0 right-0 flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            touchAction: 'pan-y',
            overscrollBehavior: 'none'
          }}
        >
          {/* 3 Visible Cards Container */}
          <div className="space-y-4 flex flex-col p-2">
            {(() => {
              // console.log('=== VERTICAL CAROUSEL DEBUG ===')
              // console.log('Total cards from backend:', cards.length)
              // console.log('Current index:', currentCardIndex)
              // console.log('Cards data:', cards.map(c => ({ name: c.name, id: c.id })))

              // Show 3 cards around the current index
              let visibleCards: CardDesign[] = []

              if (cards.length >= 3) {
                // Create visible cards with empty placeholders
                visibleCards = []

                if (currentCardIndex === 0) {
                  // Index 0: show [empty, 0, 1]
                  visibleCards = [
                    { id: -1, name: 'EMPTY', imageUrl: '', tier: 'empty' },
                    cards[0] || { id: -1, name: 'EMPTY', imageUrl: '', tier: 'empty' },
                    cards[1] || { id: -1, name: 'EMPTY', imageUrl: '', tier: 'empty' }
                  ]
                } else if (currentCardIndex === 1) {
                  // Index 1: show [0, 1, 2]
                  visibleCards = [
                    cards[0] || { id: -1, name: 'EMPTY', imageUrl: '', tier: 'empty' },
                    cards[1] || { id: -1, name: 'EMPTY', imageUrl: '', tier: 'empty' },
                    cards[2] || { id: -1, name: 'EMPTY', imageUrl: '', tier: 'empty' }
                  ]
                } else if (currentCardIndex === 2) {
                  // Index 2: show [1, 2, 3]
                  visibleCards = [
                    cards[1] || { id: -1, name: 'EMPTY', imageUrl: '', tier: 'empty' },
                    cards[2] || { id: -1, name: 'EMPTY', imageUrl: '', tier: 'empty' },
                    cards[3] || { id: -1, name: 'EMPTY', imageUrl: '', tier: 'empty' }
                  ]
                } else if (currentCardIndex === 3) {
                  // Index 3: show [2, 3, empty]
                  visibleCards = [
                    cards[2] || { id: -1, name: 'EMPTY', imageUrl: '', tier: 'empty' },
                    cards[3] || { id: -1, name: 'EMPTY', imageUrl: '', tier: 'empty' },
                    { id: -2, name: 'EMPTY', imageUrl: '', tier: 'empty' }
                  ]
                }

                // console.log(`Showing cards for index ${currentCardIndex}`)
                // console.log('Visible cards:', visibleCards.map(c => c?.name || 'undefined'))
                // console.log('Current card index:', currentCardIndex)

                // Sliding window logic for 4 cards:
                // Index 0: show [empty,0,1] → Card 0 (index 1) expanded
                // Index 1: show [0,1,2] → Card 1 (index 1) expanded  
                // Index 2: show [1,2,3] → Card 2 (index 1) expanded
                // Index 3: show [2,3,empty] → Card 3 (index 1) expanded
              } else if (cards.length > 0) {
                // For 1-2 cards, duplicate to make 3
                visibleCards = [...cards]
                while (visibleCards.length < 3) {
                  visibleCards.push(cards[0]) // Duplicate first card
                }
                // console.log(`Duplicated cards to make 3: ${visibleCards.length}`)
              } else {
                // Fallback if no cards
                visibleCards = [
                  { id: 1, name: 'CARD 1', imageUrl: '', tier: 'basic' },
                  { id: 2, name: 'CARD 2', imageUrl: '', tier: 'basic' },
                  { id: 3, name: 'CARD 3', imageUrl: '', tier: 'basic' }
                ]
                // console.log('Using fallback cards:', visibleCards.length)
              }

              // console.log('Final visible cards count:', visibleCards.length)

              return visibleCards.map((card, visibleIndex) => {
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
                    <div>
                      <div
                        key={card.id}
                        className={`rounded-2xl relative overflow-hidden shadow-2xl transition-all duration-300 
                          ${isSelected
                            ? 'w-full h-[200px] max-[375px]:h-[220px] max-[393px]:h-[220px] max-[414px]:h-[240px] max-[390px]:h-[230px] max-[430px]:h-[250px]'
                            : 'w-full h-24 max-[375px]:h-24 max-[414px]:h-34 max-[390px]:h-33 max-[393px]:h-36 max-[430px]:h-48 scale-75 blur-[4px]'}`}
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
                          <div className={`absolute right-4 top-[60px] max-[375px]:right-7 max-[390px]:right-4 -translate-y-1/2 
                          ${isSelected ? 'top-[100px] max-[375px]:top-[80px] max-[390px]:top-[80px] max-[414px]:top-[90px] max-[430px]:top-[100px]' : 'top-[60px] max-[375px]:top-[40px] max-[390px]:top-[40px] max-[414px]:top-[50px] max-[430px]:top-[60px]'}`}>
                            <div className="
                            w-24 h-24 
                            w-[70px] h-[70px]
                            max-[375px]:w-[70px] max-[375px]:h-[70px]
                            max-[390px]:w-[80px] max-[390px]:h-[80px]
                            max-[414px]:w-[90px] max-[414px]:h-[90px]
                            max-[430px]:w-[80px] max-[430px]:h-[80px]
                            rounded-full 
                            overflow-hidden 
                            border-4 
                            border-white 
                            shadow-lg 
                            bg-blue-200">
                              {values.photoFile ? (
                                <img
                                  src={URL.createObjectURL(values.photoFile)}
                                  alt="Profile"
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
                        )}

                        {/* User Info Card - Right Position with Centered Content */}
                        {card.tier !== 'empty' && (
                          <div className="absolute bottom-6 right-6 text-center">
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
                              <div className="text-blue-800 font-extrabold text-[14px] sm:text-xs w-fit" style={{ fontFamily: 'Roboto' }}>{values.phone ? '0' + values.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3') : '0877-9832-0931'}</div>
                              <div className="text-blue-800 font-extrabold text-[13px] w-fit">
                                <div>{values.email || 'valeriebahagia@gmail.com'}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      {isSelected && <div className='pt-2 text-white text-center uppercase tracking-widest font-semibold' style={{ letterSpacing: '0.4em' }}>{card.name}</div>}
                    </div>
                    :
                    <div className='flex text-white text-center h-32 justify-center items-center'></div>
                    // <div className='flex text-white text-center h-32 justify-center items-center'>Tidak ada kartu tersedia</div>
                )
              })
            })()}
          </div>

          {/* Card Title Display - Show title of the main/center card */}
          {/* {cards.length > 0 && (
            <div className="text-center mt-[-20px]">
              <div className="text-white text-lg font-semibold">
                {cards[currentCardIndex]?.name || 'Card Title'}
              </div>
            </div>
          )} */}

          {/* Navigation Arrows - Horizontal */}
          <button
            onClick={() => {
              // console.log('=== PREV BUTTON CLICKED ===')
              // console.log('Current index:', currentCardIndex)
              // console.log('Disabled:', currentCardIndex <= 0)
              prevCard()
            }}
            className="absolute top-16 sm:top-16 left-1/2 transform -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all"
            disabled={currentCardIndex <= 0}
          >
            <svg className="w-6 h-6 
            max-[375px]:w-16 max-[375px]:h-16
            max-[390px]:w-8 max-[390px]:h-8
            max-[414px]:w-10 max-[414px]:h-10
            max-[430px]:w-12 max-[430px]:h-12
            text-white font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
            </svg>
          </button>

          <button
            onClick={() => {
              // console.log('=== NEXT BUTTON CLICKED ===')
              // console.log('Current index:', currentCardIndex)
              // console.log('Disabled:', currentCardIndex >= cards.length - 1)
              nextCard()
            }}
            className="absolute bottom-16 sm:bottom-16 left-1/2 transform -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all"
            disabled={currentCardIndex >= cards.length - 1}
          >
            <svg className="w-6 h-6 
            max-[375px]:w-16 max-[375px]:h-16
            max-[390px]:w-8 max-[390px]:h-8
            max-[414px]:w-10 max-[414px]:h-10
            max-[430px]:w-12 max-[430px]:h-12
            text-white font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
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
        className="absolute bottom-2 left-0 right-0 z-20 flex justify-center pb-[20px]"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          touchAction: 'none',
          overscrollBehavior: 'none'
        }}
      >
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="submit-button p-3 w-[150px] text-red-600 text-lg rounded-[20px] font-black disabled:opacity-50 flex items-center justify-center gap-2"
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
