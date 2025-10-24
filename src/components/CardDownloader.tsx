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

      // Add background image as img element (better for html2canvas)
      if (savedCardBlob) {
        const backgroundImg = document.createElement('img')
        backgroundImg.src = savedCardBlob
        backgroundImg.crossOrigin = 'anonymous'
        backgroundImg.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 16px;
        `
        tempCard.appendChild(backgroundImg)
        console.log('Background image added as img element (from blob)')
      } else if (savedCardUrl) {
        const backgroundImg = document.createElement('img')
        // Use proxy for external URLs to avoid CORS issues
        let imageUrl = savedCardUrl
        if (imageUrl.startsWith('http') && !imageUrl.includes(window.location.hostname)) {
          imageUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
        }
        backgroundImg.src = imageUrl
        backgroundImg.crossOrigin = 'anonymous'
        backgroundImg.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 16px;
        `
        tempCard.appendChild(backgroundImg)
        console.log('Background image added as img element (from URL with proxy)')
      } else {
        console.log('No saved card blob or URL, using gradient background')
      }

      console.log('Saved card blob length:', savedCardBlob ? savedCardBlob.length : 'null')

      // Add profile picture (matching ResultPage design)
      const profileContainer = document.createElement('div')
      profileContainer.style.cssText = `
        position: absolute;
        right: 4px;
        top: 100px;
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

      if (savedProfileBlob) {
        const img = document.createElement('img')
        img.src = savedProfileBlob
        img.crossOrigin = 'anonymous'
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
        `
        profileImg.appendChild(img)
      } else {
        // Default avatar with icon
        profileImg.innerHTML = `
          <div style="width: 100%; height: 100%; background: #dbeafe; display: flex; align-items: center; justify-content: center;">
            <svg style="width: 48px; height: 48px; color: #2563eb;" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
          </div>
        `
      }

      profileContainer.appendChild(profileImg)
      tempCard.appendChild(profileContainer)

      // Add user info card (matching ResultPage design)
      const infoContainer = document.createElement('div')
      infoContainer.style.cssText = `
        position: absolute;
        bottom: 20px;
        right: 0px;
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
        color: #1e40af;
        font-weight: 800;
        font-size: 15px;
        font-family: Roboto;
        margin-bottom: 2px;
      `

      const emailEl = document.createElement('div')
      emailEl.textContent = cardData.email || 'No Email'
      console.log('Email text:', cardData.email)
      emailEl.style.cssText = `
        color: #1e40af;
        font-weight: 800;
        font-size: 15px;
        font-family: Roboto;
        margin-bottom: 2px;
      `

      // Add serial number
      const serialEl = document.createElement('div')
      serialEl.textContent = cardData.serial || '6202100027100645'
      console.log('Serial text:', cardData.serial)
      serialEl.style.cssText = `
        color: #1e40af;
        font-weight: 800;
        font-size: 14px;
        font-family: Roboto;
      `

      contactContainer.appendChild(phoneEl)
      contactContainer.appendChild(emailEl)
      contactContainer.appendChild(serialEl)

      infoContainer.appendChild(nameContainer)
      infoContainer.appendChild(contactContainer)
      tempCard.appendChild(infoContainer)
      document.body.appendChild(tempCard)

      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1000))

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