import type { FormValues } from '../types'

export interface SessionData {
  currentPage: number
  values: FormValues & { photoFile?: File | string | null }
  selectedCardUrl: string
  created: any | null
}

const SESSION_KEY = 'ktb_form_session'

// Helper function to convert File to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// Helper function to convert base64 to File
export const base64ToFile = (base64: string, filename: string, mimeType: string): File => {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || mimeType
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

// Save session data
export const saveSession = async (data: SessionData): Promise<void> => {
  try {
    const sessionData: any = { ...data }
    
    // Convert photoFile to base64 if it exists
    if (data.values.photoFile && data.values.photoFile instanceof File) {
      sessionData.values = {
        ...data.values,
        photoFile: await fileToBase64(data.values.photoFile)
      }
    }
    
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
  } catch (error) {
    console.warn('Failed to save session:', error)
  }
}

// Load session data
export const loadSession = (): SessionData | null => {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (!saved) return null
    
    const data = JSON.parse(saved)
    
    // Convert base64 photoFile back to File if it exists
    if (data.values.photoFile && typeof data.values.photoFile === 'string') {
      data.values.photoFile = base64ToFile(data.values.photoFile, 'photo.jpg', 'image/jpeg')
    }
    
    return data
  } catch (error) {
    console.warn('Failed to load session:', error)
    return null
  }
}

// Clear session data
export const clearSession = (): void => {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch (error) {
    console.warn('Failed to clear session:', error)
  }
}

// Check if session exists
export const hasSession = (): boolean => {
  return sessionStorage.getItem(SESSION_KEY) !== null
}
