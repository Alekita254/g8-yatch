import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'

export default function BottomSheet({ open, onClose, title, children }) {
  const dialogRef = useRef(null)
  const previousFocusRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    previousFocusRef.current = document.activeElement
    document.body.style.overflow = open ? 'hidden' : ''
    const dialog = dialogRef.current
    const focusable = dialog?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    focusable?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !dialog) return
      const elements = [...dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.disabled)
      if (!elements.length) return
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <button type="button" className="absolute inset-0 bg-[#10252b]/40 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border-t border-[#e3bd6f]/30 bg-[#fafafa] p-5 text-[#10252b] shadow-[0_-10px_40px_rgba(227,189,111,0.2)] md:max-w-xl md:rounded-3xl md:border md:p-8"
      >
        <div className="mx-auto mb-6 h-1.5 w-16 rounded-full bg-[#e3bd6f]/30 md:hidden" />
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-2xl font-black uppercase tracking-wider text-[#c58452]">{title}</h2>
          <button type="button" onClick={onClose} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e3bd6f]/10 hover:bg-[#e3bd6f]/20 text-[#c58452] hover:text-[#10252b] transition-colors border border-transparent hover:border-[#e3bd6f]/50" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
