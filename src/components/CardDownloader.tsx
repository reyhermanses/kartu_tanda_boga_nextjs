import { useState } from 'react'
import html2canvas from 'html2canvas'

type CardData = {
  name: string
  phone: string
  email: string
  birthday: string
  profileImage?: string
  cardImage?: string
  serial?: string
}

type Props = {
  cardData: CardData
  selectedCardUrl?: string
  onDownload?: () => void
}

export function CardDownloader({ cardData, selectedCardUrl, onDownload }: Props) {
  const [isDownloading, setIsDownloading] = useState(false)

  // Helper function to convert image URL to blob/base64 using proxy
  const convertImageUrlToBlob = async (url: string): Promise<string> => {
    try {
      // If already a data URL, return as is
      if (url.startsWith('data:image/')) {
        return url
      }

      // Use proxy API to avoid CORS issues
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`
      console.log('Converting image URL to blob via proxy:', url)
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*,*/*',
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error(`Proxy request failed: ${response.status} - ${errorText}`)
        throw new Error(`Proxy request failed: ${response.status}`)
      }

      const blob = await response.blob()
      
      if (blob.size === 0) {
        throw new Error('Proxy returned empty blob')
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result as string
          console.log('✅ Image converted to base64 via proxy')
          resolve(base64)
        }
        reader.onerror = () => reject(new Error('Failed to convert blob to base64'))
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('❌ Failed to convert image URL to blob:', error)
      throw error
    }
  }

  const handleDownload = async () => {
    if (isDownloading) return

    setIsDownloading(true)

    try {
      console.log('Starting card download...')
      console.log('Card data received:', cardData)
      console.log('Selected card URL:', selectedCardUrl)

      // Get blobs from sessionStorage (pre-converted in CardSelectionPage)
      const savedCardBlob = sessionStorage.getItem('selectedCardBlob')
      const savedProfileBlob = sessionStorage.getItem('selectedProfileBlob')
      const savedCardUrl = sessionStorage.getItem('selectedCardUrl') // Fallback URL
      console.log('Saved card blob:', savedCardBlob ? 'exists' : 'null')
      console.log('Saved profile blob:', savedProfileBlob ? 'exists' : 'null')
      console.log('Saved card URL (fallback):', savedCardUrl)

      // Create a temporary div with the card design
      const tempCard = document.createElement('div')
      tempCard.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 400px;
        height: 250px;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        z-index: 9999;
      `

      // Add background image - Priority: savedCardBlob > savedCardUrl > cardData.cardImage
      // Convert URL to blob if needed to avoid CORS
      let backgroundImageUrl = null
      
      if (savedCardBlob && savedCardBlob.startsWith('data:image/')) {
        backgroundImageUrl = savedCardBlob
        console.log('Using card background from sessionStorage blob')
      } else {
        // Need to convert URL to blob
        const urlToConvert = savedCardUrl || cardData.cardImage || selectedCardUrl
        if (urlToConvert) {
          try {
            console.log('Converting card background URL to blob:', urlToConvert)
            backgroundImageUrl = await convertImageUrlToBlob(urlToConvert)
            console.log('✅ Card background converted successfully')
          } catch (error) {
            console.error('❌ Failed to convert card background, using URL directly (may cause CORS):', error)
            backgroundImageUrl = urlToConvert
          }
        }
      }
      
      if (backgroundImageUrl) {
        const backgroundImg = document.createElement('img')
        backgroundImg.src = backgroundImageUrl
        backgroundImg.crossOrigin = backgroundImageUrl.startsWith('data:') ? null : 'anonymous'
        backgroundImg.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 16px;
        `
        
        // Wait for image to load before proceeding, but don't fail if it doesn't load
        try {
          await new Promise<void>((resolve, reject) => {
            backgroundImg.onload = () => {
              console.log('✅ Background image loaded successfully')
              resolve()
            }
            backgroundImg.onerror = () => {
              console.error('❌ Failed to load background image, using gradient fallback:', backgroundImageUrl)
              // Don't reject, just resolve to continue with gradient fallback
              resolve()
            }
            // Set timeout to prevent infinite waiting
            setTimeout(() => {
              if (!backgroundImg.complete) {
                console.warn('⚠️ Background image load timeout, using gradient fallback')
                resolve() // Don't reject, continue with fallback
              }
            }, 10000)
          })
          
          // Only add image if it loaded successfully
          if (backgroundImg.complete && backgroundImg.naturalWidth > 0) {
            tempCard.appendChild(backgroundImg)
            console.log('Background image element added to card')
          } else {
            console.warn('⚠️ Background image failed to load, using gradient fallback')
          }
        } catch (error) {
          console.error('Error loading background image, using gradient fallback:', error)
          // Continue with gradient fallback
        }
      } else {
        console.warn('⚠️ No card background image available, using gradient fallback')
      }

      console.log('Saved card blob length:', savedCardBlob ? savedCardBlob.length : 'null')

      // Add profile picture (matching ResultPage design)
      const profileContainer = document.createElement('div')
      profileContainer.style.cssText = `
        position: absolute;
        right: 22px;
        top: 90px;
        transform: translateY(-50%);
      `

      const profileImg = document.createElement('div')
      profileImg.style.cssText = `
        width: 80px;
        height: 80px;
        border-radius: 50%;
        overflow: hidden;
        border: 4px solid white;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        background: #dbeafe;
      `

      // Get profile image - Priority: savedProfileBlob > cardData.profileImage
      // Convert URL to blob if needed to avoid CORS
      let profileImageUrl = savedProfileBlob || cardData.profileImage
      
      if (profileImageUrl) {
        // If it's a URL (not a data URL), convert it to blob
        if (!profileImageUrl.startsWith('data:image/') && !profileImageUrl.startsWith('blob:')) {
          try {
            console.log('Converting profile image URL to blob:', profileImageUrl)
            profileImageUrl = await convertImageUrlToBlob(profileImageUrl)
            console.log('✅ Profile image converted successfully')
          } catch (error) {
            console.error('❌ Failed to convert profile image, using URL directly (may cause CORS):', error)
            // Continue with original URL as fallback
          }
        }

        const img = document.createElement('img')
        img.src = profileImageUrl
        img.crossOrigin = profileImageUrl.startsWith('data:') ? null : 'anonymous'
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
        `
        
        // Wait for profile image to load
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            console.log('✅ Profile image loaded successfully')
            resolve()
          }
          img.onerror = () => {
            console.error('❌ Failed to load profile image:', profileImageUrl)
            // Don't reject, just use default avatar
            resolve()
          }
          // Set timeout to prevent infinite waiting
          setTimeout(() => {
            if (!img.complete) {
              console.warn('Profile image load timeout, using default avatar')
              resolve()
            }
          }, 10000)
        })
        
        // Only add image if it loaded successfully
        if (img.complete && img.naturalWidth > 0) {
          profileImg.appendChild(img)
          console.log('Using profile image:', profileImageUrl ? profileImageUrl.substring(0, 50) + '...' : 'null')
        } else {
          // Use default avatar if image failed to load
          profileImg.innerHTML = `
            <div style="width: 100%; height: 100%; background: #dbeafe; display: flex; align-items: center; justify-content: center;">
              <svg style="width: 48px; height: 48px; color: black;" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
          `
          console.log('⚠️ Profile image failed to load, using default avatar')
        }
      } else {
        // Default avatar with icon
        profileImg.innerHTML = `
          <div style="width: 100%; height: 100%; background: #dbeafe; display: flex; align-items: center; justify-content: center;">
            <svg style="width: 48px; height: 48px; color: black;" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
          </div>
        `
        console.log('⚠️ No profile image available, using default avatar')
      }

      profileContainer.appendChild(profileImg)
      tempCard.appendChild(profileContainer)

      // Add user info card (matching ResultPage design)
      const infoContainer = document.createElement('div')
      infoContainer.style.cssText = `
        position: absolute;
        bottom: 20px;
        right: 22px;
        text-align: center;
        transform: scale(0.90);
      `

      // Name with checkmark
      const nameContainer = document.createElement('div')
      nameContainer.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-bottom: -4px;
      `

      const nameCard = document.createElement('div')
      nameCard.style.cssText = `
        background: white;
        border-radius: 9999px;
        padding: 4px 8px;
        display: flex;
        align-items: center;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      `

      const nameText = document.createElement('span')
      nameText.textContent = cardData.name || 'No Name'
      console.log('Name text:', cardData.name)
      nameText.style.cssText = `
        color: black;
        font-weight: 800;
        font-size: 12px;
        top: -7px;
        position: relative;
        margin-right: 8px;
        font-family: Roboto;
      `

      const checkmark = document.createElement('div')
      checkmark.style.cssText = `
        width: 20px;
        height: 20px;
        background: linear-gradient(to right, #3b82f6, #2563eb);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      `
      checkmark.innerHTML = `
        <svg style="width: 12px; height: 12px; color: white;" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      `

      nameCard.appendChild(nameText)
      nameCard.appendChild(checkmark)
      nameContainer.appendChild(nameCard)

      // Phone and email
      const contactContainer = document.createElement('div')
      contactContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
      `

      const phoneEl = document.createElement('div')
      const formattedPhone = cardData.phone ? '0' + cardData.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3') : 'No Phone'
      phoneEl.textContent = formattedPhone
      console.log('Phone text:', cardData.phone, 'Formatted:', formattedPhone)
      phoneEl.style.cssText = `
        color: white;
        font-weight: 800;
        font-size: 15px;
        font-family: Roboto;
        margin-bottom: 2px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8), 1px -1px 2px rgba(0, 0, 0, 0.8), -1px 1px 2px rgba(0, 0, 0, 0.8);
      `

      const emailEl = document.createElement('div')
      emailEl.textContent = cardData.email || 'No Email'
      console.log('Email text:', cardData.email)
      emailEl.style.cssText = `
        color: white;
        font-weight: 800;
        font-size: 15px;
        font-family: Roboto;
        margin-bottom: 2px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8), 1px -1px 2px rgba(0, 0, 0, 0.8), -1px 1px 2px rgba(0, 0, 0, 0.8);
      `

      // Add serial number
      const serialEl = document.createElement('div')
      serialEl.textContent = cardData.serial || '6202100027100645'
      console.log('Serial text:', cardData.serial)
      serialEl.style.cssText = `
        color: white;
        font-weight: 800;
        font-size: 14px;
        font-family: Roboto;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8), 1px -1px 2px rgba(0, 0, 0, 0.8), -1px 1px 2px rgba(0, 0, 0, 0.8);
      `

      contactContainer.appendChild(phoneEl)
      contactContainer.appendChild(emailEl)
      contactContainer.appendChild(serialEl)

      infoContainer.appendChild(nameContainer)
      infoContainer.appendChild(contactContainer)
      tempCard.appendChild(infoContainer)
      document.body.appendChild(tempCard)

      // Small delay to ensure DOM is ready (images are already loaded above)
      await new Promise(resolve => setTimeout(resolve, 300))

      try {
        // Capture with html2canvas (no CORS needed since we use blobs)
        const canvas = await html2canvas(tempCard, {
          width: 400,
          height: 250,
          scale: 2,
          useCORS: false,
          allowTaint: true,
          backgroundColor: null,
          logging: false
        })

        // Clean up
        document.body.removeChild(tempCard)

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `kartu-tanda-boga-${cardData.name.replace(/\s+/g, '-').toLowerCase()}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            console.log('Download completed successfully')
            onDownload?.()
          } else {
            throw new Error('Failed to create blob from canvas')
          }
        }, 'image/png')

      } catch (html2canvasError) {
        console.error('html2canvas error:', html2canvasError)
        // Clean up temp card if it still exists
        if (document.body.contains(tempCard)) {
          document.body.removeChild(tempCard)
        }
        throw new Error(`Failed to capture card: ${(html2canvasError as Error).message}`)
      }

    } catch (error) {
      console.error('Download error:', error)
      alert(`Gagal mengunduh kartu: ${(error as Error).message}. Silakan coba lagi.`)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="w-[200px] py-3 sm:py-4 rounded-[20px] font-bold text-sm sm:text-lg transition-all bg-white text-red-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isDownloading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
          Mengunduh...
        </>
      ) : (
        'Unduh Kartu'
      )}
    </button>
  )
}