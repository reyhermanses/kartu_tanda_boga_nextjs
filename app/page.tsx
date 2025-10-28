'use client'

import { useState, useEffect } from 'react'
import { FormSection } from '@/src/components/FormSection'
import { PhotoUploadPage } from '@/src/components/PhotoUploadPage'
import { CardSelectionPage } from '@/src/components/CardSelectionPage'
import { ResultPage } from '@/src/components/ResultPage'
import { AlertModal } from '@/src/components/AlertModal'

import type { FormValues, FormErrors } from '@/src/types'
import { clearSession } from '@/src/utils/sessionStorage'

export interface CreateMembershipResponse {
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

export default function Home() {
  const [currentPage, setCurrentPage] = useState(2) // Start directly at form page
  const [values, setValues] = useState<FormValues>({
    name: '',
    birthday: '',
    phone: '',
    email: '',
    photoFile: null
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [created, setCreated] = useState<CreateMembershipResponse['data'] | null>(null)
  const [selectedCardUrl, setSelectedCardUrl] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [errorList, setErrorList] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load session data on app mount - only once
  useEffect(() => {
    let isLoaded = false
    
    const loadSession = () => {
      if (isLoaded) return
      isLoaded = true
      
      try {
        const saved = sessionStorage.getItem('ktb_form_session')
        console.log('Raw session data from storage:', saved)
        
        if (saved) {
          const sessionData = JSON.parse(saved)
          console.log('Parsed session data:', sessionData)
          
          if (sessionData.currentPage) {
            console.log('Setting currentPage to:', sessionData.currentPage)
            setCurrentPage(sessionData.currentPage)
          }
          if (sessionData.values) {
            console.log('Setting values:', sessionData.values)
            
            // Convert base64 photoFile back to File if it exists
            if (sessionData.values.photoFile && typeof sessionData.values.photoFile === 'string') {
              const arr = sessionData.values.photoFile.split(',')
              const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
              const bstr = atob(arr[1])
              let n = bstr.length
              const u8arr = new Uint8Array(n)
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
              }
              const file = new File([u8arr], 'photo.jpg', { type: mime })
              sessionData.values.photoFile = file
            }
            
            setValues(sessionData.values)
          }
          if (sessionData.selectedCardUrl) {
            console.log('Setting selectedCardUrl:', sessionData.selectedCardUrl)
            setSelectedCardUrl(sessionData.selectedCardUrl)
          }
          if (sessionData.created) {
            console.log('Setting created:', sessionData.created)
            setCreated(sessionData.created)
          }
        } else {
          console.log('No session data found, starting fresh')
        }
      } catch (error) {
        console.error('Failed to load session:', error)
      }
    }
    
    // Load immediately
    loadSession()
  }, [])

  // Save session data with debouncing
  useEffect(() => {
    const saveCurrentPage = () => {
      console.log('Saving currentPage:', currentPage)
      try {
        const saved = sessionStorage.getItem('ktb_form_session')
        const sessionData = saved ? JSON.parse(saved) : {}
        sessionData.currentPage = currentPage
        sessionStorage.setItem('ktb_form_session', JSON.stringify(sessionData))
        console.log('CurrentPage saved:', currentPage)
      } catch (error) {
        console.error('Failed to save currentPage:', error)
      }
    }
    
    const timer = setTimeout(saveCurrentPage, 100)
    return () => clearTimeout(timer)
  }, [currentPage])

  useEffect(() => {
    const saveValues = () => {
      console.log('Saving values:', values)
      try {
        const saved = sessionStorage.getItem('ktb_form_session')
        const sessionData = saved ? JSON.parse(saved) : {}
        
        // Convert photoFile to base64 if it exists
        if (values.photoFile && values.photoFile instanceof File) {
          const reader = new FileReader()
          reader.onload = () => {
            const valuesWithBase64 = {
              ...values,
              photoFile: reader.result as string
            }
            sessionData.values = valuesWithBase64
            sessionStorage.setItem('ktb_form_session', JSON.stringify(sessionData))
            console.log('Values with base64 photo saved')
          }
          reader.readAsDataURL(values.photoFile)
        } else {
          sessionData.values = values
          sessionStorage.setItem('ktb_form_session', JSON.stringify(sessionData))
          console.log('Values saved')
        }
      } catch (error) {
        console.error('Failed to save values:', error)
      }
    }
    
    const timer = setTimeout(saveValues, 100)
    return () => clearTimeout(timer)
  }, [values])

  useEffect(() => {
    const saveSelectedCardUrl = () => {
      console.log('Saving selectedCardUrl:', selectedCardUrl)
      try {
        const saved = sessionStorage.getItem('ktb_form_session')
        const sessionData = saved ? JSON.parse(saved) : {}
        sessionData.selectedCardUrl = selectedCardUrl
        sessionStorage.setItem('ktb_form_session', JSON.stringify(sessionData))
        console.log('SelectedCardUrl saved:', selectedCardUrl)
      } catch (error) {
        console.error('Failed to save selectedCardUrl:', error)
      }
    }
    
    const timer = setTimeout(saveSelectedCardUrl, 100)
    return () => clearTimeout(timer)
  }, [selectedCardUrl])

  useEffect(() => {
    const saveCreated = () => {
      console.log('Saving created:', created)
      try {
        const saved = sessionStorage.getItem('ktb_form_session')
        const sessionData = saved ? JSON.parse(saved) : {}
        sessionData.created = created
        sessionStorage.setItem('ktb_form_session', JSON.stringify(sessionData))
        console.log('Created saved:', created)
      } catch (error) {
        console.error('Failed to save created:', error)
      }
    }
    
    const timer = setTimeout(saveCreated, 100)
    return () => clearTimeout(timer)
  }, [created])

  const updateValues = (newValues: Partial<FormValues>) => {
    setValues(prev => ({ ...prev, ...newValues }))
    // Clear errors when user starts typing
    if (Object.keys(errors).length > 0) {
      setErrors({})
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!values.name.trim()) {
      newErrors.name = 'Nama harus diisi'
    }

    if (!values.birthday) {
      newErrors.birthday = 'Tanggal lahir harus diisi'
    } else {
      // Validate age - minimum 13 years old
      const today = new Date()
      const birthDate = new Date(values.birthday)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      // Adjust age if birthday hasn't occurred this year yet
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      if (age < 13) {
        newErrors.birthday = 'Umur minimal 13 tahun'
      }
    }

    if (!values.phone) {
      newErrors.phone = 'Nomor telepon harus diisi'
    } else if (!values.phone.startsWith('0')) {
      newErrors.phone = 'Nomor telepon harus dimulai dengan 0'
    }

    if (!values.email) {
      newErrors.email = 'Email harus diisi'
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Format email tidak valid'
    }


    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormNext = async () => {
    // Validate and get new errors immediately
    const newErrors: FormErrors = {}

    if (!values.name.trim()) {
      newErrors.name = 'Nama harus diisi'
    }

    if (!values.birthday) {
      newErrors.birthday = 'Tanggal lahir harus diisi'
    } else {
      // Validate age - minimum 13 years old
      const today = new Date()
      const birthDate = new Date(values.birthday)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      // Adjust age if birthday hasn't occurred this year yet
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      if (age < 13) {
        newErrors.birthday = 'Umur minimal 13 tahun'
      }
    }

    if (!values.phone) {
      newErrors.phone = 'Nomor telepon harus diisi'
    } else if (!values.phone.startsWith('0')) {
      newErrors.phone = 'Nomor telepon harus dimulai dengan 0'
    }

    if (!values.email) {
      newErrors.email = 'Email harus diisi'
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Format email tidak valid'
    }

    // Set errors for UI display
    setErrors(newErrors)

    // Check if there are any errors
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).filter(Boolean)
      setErrorList(errorMessages)
      setShowAlert(true)
      return
    }

    // Just validate and go to photo upload page
    setCurrentPage(3) // Go to photo upload page
  }

  const handlePhotoSubmit = () => {
    setCurrentPage(4) // Go to card selection page
  }

  // Helper function to convert File to base64
  const convertFileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data:image/jpeg;base64, prefix to match old app format
        const base64String = result.replace(/^data:image\/[a-z]+;base64,/, '')
        resolve(base64String)
      }
      reader.onerror = () => reject(new Error('Failed to convert file to base64'))
      reader.readAsDataURL(file)
    })
  }

  const handleCardSubmit = async (selectedCard: any) => {
    console.log('Card selected:', selectedCard)
    setSelectedCardUrl(selectedCard.imageUrl)
    
    // API call here like in kartu_tanda_boga_new
    setIsSubmitting(true)
    try {

      const response = await fetch('https://alpha-api.mybogaloyalty.id/membership-card/create', {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'X-BOGAMBC-Key': 'ajCJotQ8Ug1USZS3KuoXbqaazY59CAvI',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          birthday: values.birthday,
          phone: values.phone,
          email: values.email,
          profileImage: values.photoFile ? await convertFileToBase64(values.photoFile) : '',
          cardImage: selectedCard.imageUrl
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: CreateMembershipResponse = await response.json()
      console.log('API Response:', result)

      if (result.status === 'Success') {
        setCreated(result.data)
        setCurrentPage(5) // Go to result page
      } else {
        throw new Error(result.message || 'Failed to create membership')
      }
    } catch (error) {
      console.error('Error creating membership:', error)
      setAlertMessage(`Gagal membuat membership: ${(error as Error).message}`)
      setShowAlert(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (currentPage > 2) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleBackToForm = () => {
    setCurrentPage(2)
    setCreated(null)
    setSelectedCardUrl('')
    clearSession()
  }

  const handleBackToPhoto = () => {
    setCurrentPage(3)
  }

  const handleBackToCardSelection = () => {
    setCurrentPage(4)
  }

  // Load saved values from session storage on mount
  useEffect(() => {
    const savedValues = sessionStorage.getItem('formValues')
    if (savedValues) {
      try {
        const parsed = JSON.parse(savedValues)
        setValues(parsed)
        console.log('Loaded saved values:', parsed)
      } catch (error) {
        console.error('Error parsing saved values:', error)
      }
    }
  }, [])

  // Save values to session storage whenever they change
  useEffect(() => {
    if (values.name || values.birthday || values.phone || values.email) {
      sessionStorage.setItem('formValues', JSON.stringify(values))
      console.log('Saved values to sessionStorage:', values)
    }
  }, [values])

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 1:
      case 2:
        return (
          <FormSection
            values={values}
            errors={errors}
            onChange={updateValues}
            onNext={handleFormNext}
            onPhotoError={(error: string) => {
              setAlertMessage(error)
              setShowAlert(true)
            }}
          />
        )
      case 3:
        return (
          <PhotoUploadPage
            values={values}
            errors={errors}
            onChange={updateValues}
            onNext={handlePhotoSubmit}
            onBack={handleBack}
            onPhotoError={(error: string) => {
              setAlertMessage(error)
              setShowAlert(true)
            }}
          />
        )
      case 4:
        return (
          <CardSelectionPage
            values={values}
            onNext={handleCardSubmit}
            onBack={handleBackToPhoto}
          />
        )
      case 5:
        return created ? (
          <ResultPage
            created={created}
            values={values}
            selectedCardUrl={selectedCardUrl}
            onBack={handleBackToCardSelection}
          />
        ) : null
      default:
        return (
          <FormSection
            values={values}
            errors={errors}
            onChange={updateValues}
            onNext={handleFormNext}
            onPhotoError={(error: string) => {
              setAlertMessage(error)
              setShowAlert(true)
            }}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Fixed width container for mobile-first design */}
      <div className="mx-auto max-w-[390px] min-h-screen bg-white shadow-lg">
        {renderCurrentPage()}
      </div>

      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title="Error"
        message={alertMessage}
        errorList={errorList}
      />
    </div>
  )
}