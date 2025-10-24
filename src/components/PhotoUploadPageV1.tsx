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
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [flashlightOn, setFlashlightOn] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const trackRef = useRef<MediaStreamTrack | null>(null)

  // Start camera
  const startCamera = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera tidak didukung pada perangkat ini')
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      })

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
          alert('Izin camera ditolak. Silakan berikan izin camera dan refresh halaman.')
        } else if (error.name === 'NotFoundError') {
          alert('Camera tidak ditemukan pada perangkat ini.')
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
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Only flip for front camera (selfie) to correct mirror effect
        // Back camera doesn't need flipping
        if (facingMode === 'user') {
          // Front camera: flip horizontally to correct mirror effect
          context.scale(-1, 1)
          context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
        } else {
          // Back camera: no flipping needed
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
        }

        // Convert canvas to base64 data URL (same format as old app)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)

        // Convert dataUrl to File object
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })

        onChange({ photoFile: file })
        // Stop camera immediately after taking picture
        stopCamera()
        setIsCameraOpen(false)
      }
    }
  }

  // Flip camera
  const flipCamera = () => {
    // Clear photo preview when flipping camera
    if (values.photoFile) {
      onChange({ photoFile: null })
    }

    // Change facing mode
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')

    // Start camera with new facing mode
    startCamera()
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

  // Auto-start camera when component mounts
  useEffect(() => {
    // Start camera immediately when PhotoUploadPage opens
    startCamera()
    return () => {
      stopCamera()
    }
  }, [facingMode]) // Add facingMode dependency

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
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat'
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
              {values.photoFile && !isCameraOpen ? (
                <img
                  src={URL.createObjectURL(values.photoFile)}
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
            <button className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white"></div>
            </button>

            <button
              onClick={toggleFlashlight}
              className={`
            w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center 
            ${flashlightOn ? 'bg-yellow-500 rounded-full' : ''}
          `}
            >
              <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${flashlightOn ? 'text-black' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Shutter */}
            <button
              onClick={() => {
                if (isCameraOpen) {
                  takePicture()
                } else {
                  if (values.photoFile) onChange({ photoFile: null })
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

            {/* Flip */}
            <button
              onClick={flipCamera}
              className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Gallery */}
            <button
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    onChange({ photoFile: file })
                    stopCamera()
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
              if (!values.photoFile) {
                alert('Mohon ambil foto terlebih dahulu')
                return
              }
              onNext()
            }}
            disabled={!values.photoFile}
            className={`
              w-[150px] py-3 sm:py-4 rounded-[20px] font-bold text-sm sm:text-lg transition-all
              ${values.photoFile
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
