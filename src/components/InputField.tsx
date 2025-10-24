type Props = {
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
}

export function InputField({ label, type = 'text', placeholder, value, onChange, error, required }: Props) {
  // Safari iPhone date input support
  const isDateInput = type === 'date'
  const isEmailInput = type === 'email'
  
  const dateInputProps = isDateInput ? {
    min: '1900-01-01',
    max: new Date().toISOString().split('T')[0], // Today's date
    pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}',
    inputMode: 'numeric' as const,
    autoComplete: 'bday' as const,
  } : {}

  // Enhanced email input props for mobile Safari
  const emailInputProps = isEmailInput ? {
    inputMode: 'email' as const,
    autoComplete: 'email' as const,
    autoCapitalize: 'none' as const,
    autoCorrect: 'off' as const,
    spellCheck: false as const,
  } : {}

  return (
    <label className="block">
      <span className="mb-2 block text-sm text-white font-medium">
        {label} {required && <span className="text-red-300">*</span>}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : undefined}
        className={`w-full rounded-[20px] border-2 bg-transparent px-3 py-3 sm:px-4 sm:py-5 text-white placeholder-white/70 outline-none focus:border-white focus:ring-1 focus:ring-white/50 focus:bg-transparent hover:bg-transparent transition-all ${
          error ? 'border-orange-500' : 'border-red-400'
        } ${isDateInput ? 'text-base' : ''}`}
        style={isDateInput ? { 
          colorScheme: 'dark',
          color: 'white',
          paddingBottom: '20px',
          marginBottom: '8px'
        } : {
          paddingBottom: '20px',
          marginBottom: '8px'
        }}
        {...dateInputProps}
        {...emailInputProps}
      />
      {error && (
        <span id={`${label}-error`} className="mt-1 block text-xs text-white">
          {error}
        </span>
      )}
    </label>
  )
}


