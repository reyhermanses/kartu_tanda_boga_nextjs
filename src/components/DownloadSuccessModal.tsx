import { X, CheckCircle } from 'lucide-react'

type Props = {
    isOpen: boolean
    onClose: () => void
    onPrimaryAction?: () => void
}

export function DownloadSuccessModal({ isOpen, onClose, onPrimaryAction }: Props) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-2 transform transition-all overflow-hidden">
                <div className="flex items-center justify-between p-3 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-[17px] font-semibold text-gray-900">Selesai Mengunduh!</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="px-6">
                    <p className="text-gray-600 leading-relaxed">
                        Cek Kartu Kamu di Galeri.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        Yuk Ambil Promonya Sekarang!
                    </p>
                </div>

                <div className="px-6 flex flex-col gap-3">
                    {/* <button
            onClick={onPrimaryAction}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors active:scale-[0.98]"
          > */}
                    Yuk Ambil Promonya Sekarang!
                    {/* </button> */}
                    {/* <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors active:scale-[0.98]"
          >
            Nanti Saja
          </button> */}
                </div>
            </div>
        </div>
    )
}


