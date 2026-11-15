import { useId, useState, type Ref } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function PasswordField({ label, value, onChange, onBlur, autoComplete, error, inputRef, hint }: {
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  autoComplete: 'new-password' | 'current-password'
  error?: string
  inputRef?: Ref<HTMLInputElement>
  hint?: string
}) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  return <div className="text-sm">
    <label htmlFor={id}>{label}</label>
    <div className="relative mt-2">
      <input ref={inputRef} id={id} autoComplete={autoComplete} type={visible ? 'text' : 'password'} required minLength={8} maxLength={72}
        value={value} onChange={event => onChange(event.target.value)} onBlur={onBlur}
        aria-invalid={!!error} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`h-11 w-full rounded-lg border pl-3 pr-12 outline-none focus:border-brand-500 ${error ? 'border-red-500' : 'border-slate-200'}`} />
      <button type="button" aria-label={`${visible ? '隐藏' : '显示'}${label}`} aria-pressed={visible} onClick={() => setVisible(current => !current)}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-slate-500 hover:text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600">
        {visible ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
      </button>
    </div>
    {hint && <span id={`${id}-hint`} className="mt-1 block text-xs text-slate-400">{hint}</span>}
    {error && <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
}
