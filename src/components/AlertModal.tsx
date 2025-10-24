import { X, AlertCircle, CheckCircle } from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  errorList?: string[]
  isSuccess?: boolean
}

export function AlertModal({ isOpen, onClose, message, errorList, isSuccess = false }: Props) {
  if (!isOpen) return null

  const iconColor = isSuccess ? 'text-green-600' : 'text-red-600'
  const iconBg = isSuccess ? 'bg-green-100' : 'bg-red-100'
  const buttonColor = isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-10 h-10 ${iconBg} rounded-full flex items-center justify-center`}>
              {isSuccess ? (
                <CheckCircle className={`w-5 h-5 ${iconColor}`} />
              ) : (
                <AlertCircle className={`w-5 h-5 ${iconColor}`} />
              )}
            </div>
            <h3 className="text-[17px] font-semibold text-gray-900">Cek kembali data kamu</h3>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6 max-h-96 overflow-y-auto">
          <p className="text-gray-600 leading-relaxed mb-4">{message}</p>
          
          {errorList && errorList.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 text-sm">Field yang perlu diperbaiki:</h4>
              <ul className="space-y-2">
                {errorList.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                    <span className="text-sm text-gray-700 leading-relaxed">{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className={`w-full ${buttonColor} text-white font-semibold py-3 px-4 rounded-xl transition-colors active:scale-[0.98]`}
          >
            {isSuccess ? 'Lanjut' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  )
}
