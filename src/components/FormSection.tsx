import { useState } from 'react'
import { InputField } from './InputField'
import { Footer } from './Footer'
// import { PhotoUploader } from './PhotoUploader'
import type { FormErrors, FormValues } from '../types'

type Props = {
  values: FormValues
  errors: FormErrors
  onChange: (next: Partial<FormValues>) => void
  onNext: () => void
  onPhotoError?: (message: string) => void
}

export function FormSection({ values, errors, onChange, onNext }: Props) {
  const [showTermsModal, setShowTermsModal] = useState(false)
  return (
    <div className="form-page p-4 sm:p-6 relative overflow-hidden min-h-screen">
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

      <div className="relative z-20">
        {/* Header Image */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <img
            src="/header.png"
            alt="BOGA APP Header"
            className="w-[290px] h-auto rounded-lg shadow-lg"
          />
        </div>

        <section className="space-y-3 sm:space-y-4">
          <InputField
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            required
            value={values.name}
            onChange={(v) => onChange({ name: v })}
            error={errors.name}
          />
          <InputField
            label="Nomor Telepon"
            placeholder="08xxxx"
            required
            type="tel"
            value={values.phone}
            onChange={(v) => onChange({ phone: v })}
            error={errors.phone}
          />
          <label className="block">
            <span className="mb-2 block text-sm text-white font-medium">
              Tanggal Lahir <span className="text-red-300">*</span>
            </span>
            <div className="relative">
              <input
                type="date"
                value={values.birthday}
                onChange={(e) => onChange({ birthday: e.target.value })}
                className={`date-input-custom w-full rounded-[20px] border-2 bg-transparent px-3 py-3 sm:px-4 sm:py-5 text-white placeholder-white/70 outline-none focus:border-white focus:ring-1 focus:ring-white/50 focus:bg-transparent hover:bg-transparent transition-all text-base ${errors.birthday ? 'border-orange-500' : 'border-red-400'
                  }`}
                style={{
                  colorScheme: 'dark',
                  color: 'white',
                  paddingRight: '50px',
                  minHeight: '56px',
                  height: '56px',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none'
                }}
                id="birthday-input"
              />
              {/* Custom Calendar Icon - Visible on all devices */}
              <div
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                style={{ pointerEvents: 'none' }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            {errors.birthday && (
              <span className="mt-1 block text-xs text-white">
                {errors.birthday}
              </span>
            )}
            <div className='flex text-[12px] bg-yellow-300 italic border border-orange-400 text-gray-600 rounded-[5px] p-3 justify-center mt-2'>Isi sesuai kartu identitas ya, banyak kejutan pas ulang tahun kamu!</div>
          </label>
          <InputField
            label="Email"
            type="email"
            placeholder="Masukkan email"
            required
            value={values.email}
            onChange={(v) => onChange({ email: v })}
            error={errors.email}
          />

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-start space-x-3 mt-4 p-3 rounded-lg border-2 border-white/30 bg-white/5">
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={values.termsAccepted || false}
              onChange={(e) => onChange({ termsAccepted: e.target.checked })}
              className="mt-1 w-5 h-5 text-red-600 bg-white/10 border-2 border-white rounded focus:ring-red-500 focus:ring-2 cursor-pointer accent-red-600"
              style={{
                minWidth: '20px',
                minHeight: '20px'
              }}
            />
            <label htmlFor="terms-checkbox" className="text-white text-xs sm:text-sm leading-relaxed" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
              Dengan melakukan registrasi pada website ini, Anda menyatakan telah membaca, memahami, dan menyetujui syarat dan ketentuan serta Kebijakan Privasi sebagaimana yang tercantum{' '}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-yellow-300 underline hover:text-yellow-200 font-bold transition-colors"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.9)' }}
              >
                disini
              </button>
              .
            </label>
          </div>
          {errors.termsAccepted && (
            <span className="mt-1 block text-xs text-orange-300 font-semibold" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
              {errors.termsAccepted}
            </span>
          )}

          {/* Tanggal Lahir dan Jenis Kelamin dalam Row */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Tanggal Lahir */}
            {/* <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tanggal Lahir <span className="text-red-300">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={values.birthday}
                  onChange={(e) => onChange({ birthday: e.target.value })}
                  className={`w-full rounded-[20px] border-2 bg-transparent px-3 py-3 sm:px-4 sm:py-5 text-white placeholder-white/70 outline-none focus:border-white focus:ring-1 focus:ring-white/50 focus:bg-transparent hover:bg-transparent transition-all ${errors.birthday ? 'border-orange-500' : 'border-red-400'
                    }`}
                  style={{
                    colorScheme: 'dark',
                    color: 'white',
                    paddingRight: '50px'
                  }}
                  id="birthday-input"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('birthday-input') as HTMLInputElement;
                    if (input) {
                      input.showPicker();
                    }
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-auto cursor-pointer"
                >
                  <svg className="w-5 h-5 text-white hover:text-red-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              {errors.birthday && (
                <p className="text-sm text-white mt-1">{errors.birthday}</p>
              )}
            </div> */}

            {/* Gender Selection - Dropdown */}
            {/* <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Jenis Kelamin <span className="text-red-300">*</span>
              </label>
              <select
                value={values.gender}
                onChange={(e) => onChange({ gender: e.target.value })}
                className={`w-full rounded-[20px] border-2 bg-transparent px-3 py-3 sm:px-4 sm:py-5 text-white outline-none focus:border-white focus:ring-1 focus:ring-white/50 focus:bg-transparent hover:bg-transparent transition-all ${
                  errors.gender ? 'border-orange-500' : 'border-red-400'
                }`}
                style={{ 
                  colorScheme: 'dark',
                  paddingBottom: '20px',
                  marginBottom: '8px',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '20px',
                  paddingRight: '40px',
                  cursor: 'pointer'
                }}
              >
                <option value="" className="text-gray-800">Pili Jenis Kelamin</option>
                <option value="M" className="text-gray-800">Laki-laki</option>
                <option value="F" className="text-gray-800">Perempuan</option>
              </select>
              {errors.gender && (
                <p className="text-sm text-white">{errors.gender}</p>
              )}
            </div> */}
          </div>

          {/* Photo Upload - Commented for now */}
          {/* <PhotoUploader
        required
        error={errors.photoFile}
        onChange={(file) => onChange({ photoFile: file })}
        onError={onPhotoError}
      /> */}
          {/* <p className="mt-4 text-sm font-semibold text-white">Choose Card :</p> */}
        </section>

        {/* Next Button */}
        <div className="flex justify-center pt-4 sm:pt-6 md:pt-10 px-3 sm:px-6 pb-3 sm:pb-6">
          <button
            type="button"
            onClick={onNext}
            className="w-[150px] py-3 sm:py-4 rounded-[20px] font-bold text-sm sm:text-lg transition-all bg-white text-red-600 hover:bg-gray-100"
          >
            Lanjut
          </button>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Kebijakan Privasi</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - 2 Columns */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 text-sm leading-relaxed">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold mb-1">Berlaku sejak: 04 November 2025</p>
                    <p className="font-semibold">Diperbarui pada: -</p>
                  </div>

                  <p>PT. Boga Inti ("Boga Group" atau "Kami") membuat website [****] dan/atau Boga App ("Aplikasi") sebagai aplikasi dengan tujuan komersial dan dimaksudkan untuk digunakan sebagaimana adanya.</p>
                  
                  <p>Kebijakan Privasi ini digunakan untuk menginformasikan pengunjung Aplikasi ("Pengguna" atau "Anda") mengenai kebijakan Kami dengan pengumpulan, penggunaan, pengolahan, penyimpanan, penguasaan dan pengungkapan Informasi Pribadi (sebagaimana didefinisikan dibawah) jika ada yang memutuskan untuk menggunakan layanan Aplikasi.</p>
                  
                  <p>Jika Pengguna mengklik tombol "SETUJU" atau tombol dengan pernyataan serupa lainnya yang tersedia di Aplikasi, maka Pengguna mengakui bahwa Pengguna telah membaca dan memahami Kebijakan Privasi ini dan menyetujui segala ketentuannya. Secara khusus, Pengguna setuju dan memberikan persetujuan kepada Boga Group untuk mengumpulkan, menggunakan, membagikan, mengungkapkan, menyimpan, mentransfer, atau mengolah Informasi Pribadi Pengguna sesuai dengan Kebijakan Privasi ini.</p>

                  <div>
                    <h3 className="font-bold text-base mb-2">TANGGAL EFEKTIF & PEMBARUAN KEBIJAKAN PRIVASI</h3>
                    <p>Kebijakan Privasi berlaku efektif pada tanggal yang tercantum di Kebijakan Privasi ini.</p>
                    <p className="mt-2">Boga Group dapat mengubah, menambah, menghapus, mengoreksi dan/atau memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk memastikan bahwa Kebijakan Privasi ini konsisten dengan perkembangan Boga Group di masa depan, dan/atau perubahan persyaratan hukum atau peraturan, dengan memposting Kebijakan Privasi yang telah direvisi di Aplikasi, di mana apabila terdapat perubahan material, Boga Group akan mengganti tanggal pada bagian atas Kebijakan Privasi ini.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-2">PERNYATAAN KESALAHAN INFORMASI PRIBADI</h3>
                    <p>Setiap ketidaklengkapan, tidak sah, ketidakakuratan, dan/atau penyesatan terhadap Informasi Pribadi yang Pengguna berikan kepada Kami dapat Kami anggap sebagai kegagalan pemenuhan persyaratan hukum atau kewajiban kontrak Pengguna, atau ketidakmampuan Kami untuk membuat kontrak dengan Pengguna.</p>
                    <p className="mt-2">Pengguna dengan ini membebaskan Kami dari seluruh konsekuensi yang timbul dari kelalaian atau kesalahan Pengguna dalam menjaga kelengkapan, validitas, akurasi, dan kebenaran Informasi Pribadi Pengguna yang Pengguna berikan kepada Kami.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-2">PENGUMPULAN INFORMASI PRIBADI</h3>
                    <p>Saat Pengguna menggunakan Aplikasi, Boga Group dapat mengumpulkan informasi tentang Pengguna dan Layanan yang Pengguna gunakan ("Informasi Pribadi"). Informasi Pribadi terbatas pada:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Nama lengkap</li>
                      <li>Nomor telepon</li>
                      <li>Alamat email</li>
                      <li>Tanggal lahir</li>
                      <li>Foto</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-2">PENGGUNAAN INFORMASI PRIBADI</h3>
                    <p>Boga Group mengumpulkan Informasi Pribadi dan dapat menggunakan Informasi Pribadi yang dikumpulkan untuk tujuan sebagai berikut:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Memberikan informasi terkait promosi, penawaran khusus, diskon, dan kegiatan restoran Kami</li>
                      <li>Keperluan komunikasi terkait layanan dan program loyalitas restoran Kami</li>
                      <li>Untuk melakukan survei pasar, uji coba, dan riset pelanggan</li>
                      <li>Untuk penelitian dan pengembangan produk dan layanan dalam Boga Group</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-2">KEAMANAN INFORMASI PRIBADI</h3>
                    <p>Boga Group melindungi Informasi Rahasia Pengguna dengan menggunakan langkah-langkah keamanan teknis, fisik, dan administratif untuk mengurangi risiko kehilangan, penyalahgunaan, akses tidak sah, pengungkapan, atau modifikasi atas Informasi Pribadi.</p>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-base mb-2">PENGUNGKAPAN INFORMASI PRIBADI</h3>
                    <p>Dengan menggunakan layanan dalam Aplikasi, Pengguna dengan ini setuju bahwa Boga Group dapat berbagi Informasi Pribadi antara perusahaan afiliasi di Boga Group, mengungkapkan, memberikan akses atau membagikan Informasi Pribadi kepada perusahaan afiliasi di Boga Group, atau kepada pihak dengan siapa Boga Group mengadakan kerja sama komersial untuk Tujuan Penggunaan atau tujuan lain yang diatur dalam Kebijakan Privasi ini.</p>
                    <p className="mt-2">Untuk menghindari keraguan, Boga Group tidak akan menjual atau menggunakan Informasi Pribadi dari Pengguna untuk kepentingan komersial selain sebagaimana disebutkan di atas.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-2">PENYIMPANAN & PENGHAPUSAN INFORMASI PRIBADI</h3>
                    <p>Boga Group menyimpan Informasi Pribadi milik Pengguna untuk periode yang diperlukan untuk memenuhi Tujuan Penggunaan, atau tujuan lain yang diuraikan dalam Kebijakan Privasi ini atau yang diizinkan oleh peraturan perundang-undangan yang berlaku kecuali diperlukan periode penyimpanan yang lebih lama atau diizinkan oleh hukum.</p>
                    <p className="mt-2">Pengguna dapat menghapus Informasi Pribadi kapanpun dia mau dengan cara menghapus akun di Aplikasi. Saat Pengguna menghapus akun di Aplikasi, Boga Group akan memastikan bahwa Informasi Pribadi Pengguna telah terhapus secara permanen dengan aman dan menyeluruh dari server Boga Group atau hanya disimpan dalam bentuk anonim.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-2">PEMBARUAN INFORMASI PRIBADI</h3>
                    <p>Dengan tunduk pada peraturan perundang-undangan yang berlaku, Pengguna dapat mengakses dan/atau memperbarui Informasi Pribadi yang berada dalam kepemilikan dan penguasaan Boga Group dengan mengunjungi tab 'Saya' dan kemudian bagian 'Edit Profil'.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-2">PRIVASI ANAK-ANAK</h3>
                    <p>Boga Group tidak bermaksud agar layanan di Aplikasi digunakan oleh siapa pun yang berusia di bawah umur menurut undang-undang dan peraturan yang berlaku, kecuali dalam pengawasan orang tua atau wali. Jika Pengguna adalah orang tua atau wali dan Pengguna mengetahui bahwa anak Pengguna telah memberikan Informasi Pribadi kepada Boga Group, harap hubungi Boga Group agar Boga Group dapat mampu melakukan tindakan yang diperlukan.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-2">HUBUNGI KAMI</h3>
                    <p>Jika Anda mempunyai pertanyaan terkait Kebijakan Privasi ini atau Anda ingin mendapatkan akses ke Informasi Pribadi Anda, mohon hubungi Kami di:</p>
                    <div className="mt-2 space-y-1">
                      <p><span className="font-semibold">Email:</span> [●]</p>
                      <p><span className="font-semibold">Alamat:</span> Rukan CBD Blok J001-J008, Green Lake City Rukan CBD Blok J Nomor 001-008, Kel. Ketapang, Kec. Cipondoh, Kota Tangerang, Provinsi Banten, 15147</p>
                      <p><span className="font-semibold">Telepon:</span> [●]</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-2">HUKUM YANG BERLAKU</h3>
                    <p>Seluruh ketentuan dalam Kebijakan Privasi ini, tunduk pada perundang-undangan yang berlaku dan ditafsirkan sesuai hukum yang berlaku di wilayah Negara Republik Indonesia.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            {/* <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Tutup
              </button>
            </div> */}
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  )
}


