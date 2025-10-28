// import { PhotoUploader } from './PhotoUploader'
import { useState, useRef, useEffect } from 'react'
import { Footer } from './Footer'
import type { FormValues, FormErrors } from '../types'

type Props = {
  values: FormValues
  errors: FormErrors
  onChange: (next: Partial<FormValues>) => void
  onBack: () => void
  onNext: () => void
  onPhotoError?: (message: string) => void
}

export function PhotoUploadPage({ values, onChange, onBack, onNext }: Props) {
  const [isCameraOpen, setIsCameraOpen] = useState(true)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [flashlightOn, setFlashlightOn] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const trackRef = useRef<MediaStreamTrack | null>(null)

  // Detect if running on Android Chrome/Beaver Web
  const isAndroidChrome = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    return /android/.test(userAgent) && (/chrome/.test(userAgent) || /beaver/.test(userAgent))
  }

  // Detect Samsung devices (especially Fold series)
  const isSamsungDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    return /samsung/.test(userAgent) || /sm-/.test(userAgent) || /galaxy/.test(userAgent)
  }

  // Detect if it's a foldable device
  const isFoldableDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    return /fold/.test(userAgent) || /flip/.test(userAgent) || /z fold/.test(userAgent) || /z flip/.test(userAgent)
  }

  // Helper function to compress image
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const MAX_WIDTH = 800
      const MAX_HEIGHT = 800
      const QUALITY = 0.7
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }
          
          // Calculate new dimensions
          let width = img.width
          let height = img.height
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = height * (MAX_WIDTH / width)
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = width * (MAX_HEIGHT / height)
              height = MAX_HEIGHT
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          // Draw image
          ctx.drawImage(img, 0, 0, width, height)
          
          // Convert to blob
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, { type: 'image/jpeg' })
              resolve(compressedFile)
            } else {
              reject(new Error('Failed to compress image'))
            }
          }, 'image/jpeg', QUALITY)
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  // Request camera permission explicitly for Samsung devices
  const requestCameraPermission = async () => {
    if (isSamsungDevice()) {
      try {
        // For Samsung devices, try to get permission first
        const devices = await navigator.mediaDevices.enumerateDevices()
        console.log('Available devices:', devices)
        
        // Check if camera devices are available
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        console.log('Video devices found:', videoDevices)
        
        if (videoDevices.length === 0) {
          throw new Error('No camera devices found')
        }
      } catch (error) {
        console.log('Permission check failed:', error)
        // Continue anyway, let getUserMedia handle the permission
      }
    }
  }

  // Start camera with fallback mechanism for Android Chrome/Beaver Web
  const startCamera = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera tidak didukung pada perangkat ini')
        return
      }

      // Request permission for Samsung devices
      await requestCameraPermission()

      let stream: MediaStream | null = null
      let constraints: MediaStreamConstraints

      // Special handling for Samsung Fold 5 and other Samsung devices
      if (isSamsungDevice() && isAndroidChrome()) {
        console.log('Samsung device detected, using special constraints')
        if (isFoldableDevice()) {
          console.log('Foldable device detected (Samsung Fold/Flip)')
        }
        
        if (facingMode === 'user') {
          // Samsung Fold 5 front camera constraints
          const samsungFrontConstraints = [
            // Try with exact facingMode and lower resolution for Samsung
            {
              video: {
                facingMode: { exact: 'user' },
                width: { ideal: 640, max: 1280 },
                height: { ideal: 480, max: 960 }
              },
              audio: false
            },
            // Fallback with ideal facingMode
            {
              video: {
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
              },
              audio: false
            },
            // Minimal constraints for Samsung
            {
              video: {
                facingMode: 'user'
              },
              audio: false
            },
            // Last resort - no facingMode specified
            {
              video: true,
              audio: false
            }
          ]

          // Try each constraint until one works
          for (const constraint of samsungFrontConstraints) {
            try {
              console.log('Trying Samsung front camera constraint:', constraint)
              stream = await navigator.mediaDevices.getUserMedia(constraint)
              break
            } catch (err) {
              console.log('Samsung front camera constraint failed:', err)
              continue
            }
          }
        } else {
          // Samsung Fold 5 back camera constraints
          const samsungBackConstraints = [
            {
              video: {
                facingMode: { exact: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 960 }
              },
              audio: false
            },
            {
              video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 960 }
              },
              audio: false
            },
            {
              video: {
                facingMode: 'environment'
              },
              audio: false
            }
          ]

          for (const constraint of samsungBackConstraints) {
            try {
              console.log('Trying Samsung back camera constraint:', constraint)
              stream = await navigator.mediaDevices.getUserMedia(constraint)
              break
            } catch (err) {
              console.log('Samsung back camera constraint failed:', err)
              continue
            }
          }
        }
      }
      // For other Android Chrome/Beaver Web, use more specific constraints
      else if (isAndroidChrome()) {
        if (facingMode === 'user') {
          // Try multiple constraint variations for front camera on Android Chrome
          const frontCameraConstraints = [
            // Try exact facingMode first
            {
              video: {
                facingMode: { exact: 'user' },
                width: { ideal: 1280 },
                height: { ideal: 960 }
              },
              audio: false
            },
            // Fallback to ideal facingMode
            {
              video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 960 }
              },
              audio: false
            },
            // Fallback to deviceId if available
            {
              video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 960 }
              },
              audio: false
            }
          ]

          // Try each constraint until one works
          for (const constraint of frontCameraConstraints) {
            try {
              stream = await navigator.mediaDevices.getUserMedia(constraint)
              break
            } catch (err) {
              console.log('Front camera constraint failed, trying next...', err)
              continue
            }
          }
        } else {
          // Back camera for Android Chrome
          constraints = {
            video: {
              facingMode: { exact: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 960 }
            },
            audio: false
          }
          stream = await navigator.mediaDevices.getUserMedia(constraints)
        }
      } else {
        // Standard constraints for other browsers
        constraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 960 }
          },
          audio: false
        }
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      }

      if (!stream) {
        throw new Error('Failed to get camera stream')
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream

        // Get video track for flashlight control
        const videoTrack = stream.getVideoTracks()[0]
        trackRef.current = videoTrack

        // Apply zoom out constraint
        try {
          await videoTrack.applyConstraints({
            advanced: [{ zoom: 0.3 } as any] // Further zoom out
          })
        } catch (zoomError) {
          console.log('Zoom not supported, using default')
        }

        setIsCameraOpen(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          if (isSamsungDevice()) {
            alert('Izin camera ditolak. Untuk Samsung Fold 5, pastikan:\n1. Berikan izin camera di Chrome\n2. Buka Chrome Settings > Site Settings > Camera\n3. Refresh halaman dan coba lagi')
          } else {
            alert('Izin camera ditolak. Silakan berikan izin camera dan refresh halaman.')
          }
        } else if (error.name === 'NotFoundError') {
          if (isSamsungDevice()) {
            alert('Camera tidak ditemukan. Samsung Fold 5 memiliki multiple cameras. Pastikan:\n1. Camera tidak digunakan aplikasi lain\n2. Restart Chrome\n3. Coba buka aplikasi camera Samsung terlebih dahulu')
          } else {
            alert('Camera tidak ditemukan pada perangkat ini.')
          }
        } else if (error.name === 'OverconstrainedError') {
          // Try fallback to back camera if front camera fails
          if (facingMode === 'user') {
            console.log('Front camera failed, trying back camera as fallback')
            setFacingMode('environment')
            setTimeout(() => startCamera(), 100)
            return
          } else {
            alert('Camera tidak dapat diakses dengan pengaturan saat ini.')
          }
        } else if (error.name === 'NotReadableError') {
          if (isSamsungDevice()) {
            alert('Camera sedang digunakan aplikasi lain. Tutup semua aplikasi yang menggunakan camera dan coba lagi.')
          } else {
            alert('Camera sedang digunakan aplikasi lain.')
          }
        } else {
          alert('Tidak dapat mengakses camera. Pastikan perangkat mendukung camera.')
        }
      } else {
        alert('Tidak dapat mengakses camera. Pastikan perangkat mendukung camera.')
      }
    }
  }

  // Stop camera - immediate and aggressive
  const stopCamera = () => {
    // Stop all tracks immediately
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        track.enabled = false
      })
      streamRef.current = null
    }

    // Clear video source immediately
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.src = ''
    }

    // Clear references immediately
    trackRef.current = null
    setFlashlightOn(false)
    setIsCameraOpen(false)
  }

  // Take picture
  const takePicture = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (context) {
        // COMPRESS IMAGE: Set max dimensions to reduce file size
        const MAX_WIDTH = 800
        const MAX_HEIGHT = 800
        
        let width = video.videoWidth
        let height = video.videoHeight
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = height * (MAX_WIDTH / width)
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = width * (MAX_HEIGHT / height)
            height = MAX_HEIGHT
          }
        }
        
        canvas.width = width
        canvas.height = height

        // Only flip for front camera (selfie) to correct mirror effect
        // Back camera doesn't need flipping
        if (facingMode === 'user') {
          // Front camera: flip horizontally to correct mirror effect
          context.scale(-1, 1)
          context.drawImage(video, -width, 0, width, height)
        } else {
          // Back camera: no flipping needed
          context.drawImage(video, 0, 0, width, height)
        }

        // Convert canvas to base64 data URL with HIGHER compression (0.7 instead of 0.8)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        
        console.log('Original dimensions:', video.videoWidth, 'x', video.videoHeight)
        console.log('Compressed dimensions:', width, 'x', height)
        console.log('Base64 size:', Math.round(dataUrl.length / 1024), 'KB')

        // Convert dataUrl to File object
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
        
        console.log('File size:', Math.round(file.size / 1024), 'KB')

        onChange({ photoFile: file })
        // Stop camera immediately after taking picture
        stopCamera()
        setIsCameraOpen(false)
      }
    }
  }


  // Toggle flashlight
  const toggleFlashlight = async () => {
    if (!trackRef.current) return

    try {
      if (flashlightOn) {
        // Turn off flashlight
        await trackRef.current.applyConstraints({
          advanced: [{ torch: false } as any]
        })
        setFlashlightOn(false)
      } else {
        // Turn on flashlight
        await trackRef.current.applyConstraints({
          advanced: [{ torch: true } as any]
        })
        setFlashlightOn(true)
      }
    } catch (error) {
      console.error('Error toggling flashlight:', error)
      // Flashlight might not be supported on this device
      alert('Flashlight tidak tersedia pada perangkat ini')
    }
  }

  // Update preview URL whenever photoFile changes
  useEffect(() => {
    console.log('=== PHOTO FILE CHANGED ===')
    console.log('New photoFile:', values.photoFile)
    
    let currentUrl: string | null = null
    
    // Create new preview URL if photoFile exists
    if (values.photoFile && values.photoFile instanceof File) {
      currentUrl = URL.createObjectURL(values.photoFile)
      setPreviewUrl(currentUrl)
      console.log('Created new preview URL:', currentUrl)
    } else {
      setPreviewUrl(null)
      console.log('No photoFile, clearing preview')
    }
    
    // Cleanup function - revoke the URL created in this effect
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl)
        console.log('Revoked preview URL on cleanup')
      }
    }
  }, [values.photoFile])

  // Auto-start camera when component mounts - BUT ONLY if no photo exists
  useEffect(() => {
    // DON'T start camera if we already have a photo (user came back to retake)
    if (values.photoFile && values.photoFile instanceof File) {
      console.log('Photo already exists, not starting camera')
      setIsCameraOpen(false)
      return
    }
    
    // Start camera immediately when PhotoUploadPage opens ONLY if no photo
    const initCamera = async () => {
      try {
        await startCamera()
      } catch (error) {
        console.error('Failed to initialize camera:', error)
        // If initial camera start fails, try again after a delay
        // For Samsung devices, try multiple times with longer delays
        const retryDelay = isSamsungDevice() ? 2000 : 1000
        const maxRetries = isSamsungDevice() ? 3 : 1
        
        for (let i = 0; i < maxRetries; i++) {
          setTimeout(() => {
            console.log(`Retry ${i + 1} for camera initialization`)
            startCamera()
          }, retryDelay * (i + 1))
        }
      }
    }
    
    initCamera()
    
    return () => {
      stopCamera()
    }
  }, []) // Run only on mount

  // Stop camera when component unmounts (user leaves page)
  useEffect(() => {
    return () => {
      // Immediate camera stop on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop()
          track.enabled = false
        })
        streamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
        videoRef.current.src = ''
      }
      trackRef.current = null
    }
  }, [])

  return (
    <div className="photo-upload-page relative">
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
      <div className="
    px-2 sm:px-4 py-2 sm:py-4 flex justify-between items-center relative z-10
  ">
        <button onClick={() => {
          stopCamera();
          setIsCameraOpen(false);
          onBack();
        }} className="text-white">
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white text-sm sm:text-lg font-bold">Upload Foto</h1>
        <div></div>
      </div>

      {/* Main */}
      <div className="flex-1 relative z-10">
        {/* Photo Display */}
        <div className="relative flex justify-center items-center mx-2 sm:mx-4 mt-2 sm:mt-4 mb-2 sm:mb-4">
          <div className="p-2 sm:p-4">
            {/* Camera Preview */}
            <div
              className="
    bg-gray-100 
    flex items-center justify-center relative overflow-hidden
    /* ukuran dasar */
    w-[300px] h-[400px] rounded-[30px]
    /* responsive breakpoints */
    max-[430px]:w-[350px] max-[430px]:h-[450px] max-[430px]:rounded-[24px]
    max-[414px]:w-[350px] max-[414px]:h-[450px] max-[414px]:rounded-[22px]
    max-[390px]:w-[325px] max-[390px]:h-[390px] max-[390px]:rounded-[18px]
    max-[375px]:w-[320px] max-[375px]:h-[380px] max-[375px]:rounded-[15px]
  "
            >
              {values.photoFile && !isCameraOpen && previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-inherit"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-inherit"
                  style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                />
              )}

              {!values.photoFile && !isCameraOpen && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="
        text-white text-sm sm:text-lg font-medium 
        bg-black/50 px-2 py-1 sm:px-4 sm:py-2 rounded-lg
      ">
                    Foto akan muncul disini
                  </p>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

          </div>
        </div>

        {/* Controls */}
        <div className="px-3 sm:px-6">
          <div className="flex justify-center items-center space-x-4 sm:space-x-8">
            {/* <button className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white"></div>
            </button> */}
            <div></div>
            <div></div>
            <div></div>

            {/* <button
              onClick={toggleFlashlight}
              className={`
            w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center 
            ${flashlightOn ? 'bg-yellow-500 rounded-full' : ''}
          `}
            >
              <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${flashlightOn ? 'text-black' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </button> */}

            {/* Shutter */}
            <button
              onClick={() => {
                if (isCameraOpen) {
                  takePicture()
                } else {
                  // User wants to retake photo - clear everything and start camera
                  if (values.photoFile) {
                    onChange({ photoFile: null })
                    // Also clear preview URL to force refresh
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl)
                      setPreviewUrl(null)
                    }
                  }
                  startCamera()
                }
              }}
              className="
            w-[70px] h-[50px] sm:w-[90px] sm:h-[70px] 
            bg-white/70 rounded-full flex items-center justify-center shadow-lg
            max-[375px]:w-[60px] max-[375px]:h-[40px]
          "
            >
              <div className={`
            w-8 h-8 sm:w-12 sm:h-12 
            ${!values.photoFile ? 'bg-red-700' : 'bg-white'} rounded-full
          `}></div>
            </button>


            {/* Gallery */}
            <button
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    // COMPRESS IMAGE FROM GALLERY
                    try {
                      console.log('Gallery image selected, original size:', Math.round(file.size / 1024), 'KB')
                      
                      const compressedFile = await compressImage(file)
                      
                      // Clear old preview URL before setting new one
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl)
                        setPreviewUrl(null)
                      }
                      
                      onChange({ photoFile: compressedFile })
                      stopCamera()
                      setIsCameraOpen(false)  // Explicitly set camera as closed
                      
                      console.log('Gallery image compressed to:', Math.round(compressedFile.size / 1024), 'KB')
                    } catch (error) {
                      console.error('Error compressing gallery image:', error)
                      // Fallback to original file if compression fails
                      onChange({ photoFile: file })
                      stopCamera()
                      setIsCameraOpen(false)  // Explicitly set camera as closed
                    }
                  }
                }
                input.click()
              }}
              className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Next Button - Always visible with validation */}
        <div className="flex justify-center pt-4 sm:pt-6 md:pt-10 px-3 sm:px-6 pb-3 sm:pb-6">
          <button
            onClick={() => {
              if (isCameraOpen) stopCamera()
              // Validate photo before proceeding
              if (!values.photoFile || !(values.photoFile instanceof File)) {
                alert('Mohon ambil foto terlebih dahulu')
                return
              }
              onNext()
            }}
            disabled={!values.photoFile || !(values.photoFile instanceof File)}
            className={`
              w-[150px] py-3 sm:py-4 rounded-[20px] font-bold text-sm sm:text-lg transition-all
              ${values.photoFile && values.photoFile instanceof File
                    ? 'bg-white text-red-600 hover:bg-gray-100'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }
              max-[375px]:w-[120px]
            `}
          >
            Lanjut
          </button>
        </div>
      </div>

      <Footer />
    </div>

  )
}
