import { useEffect, useId, useRef } from 'react';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ModalLayer({ children, label, onClose, className = '' }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const previousFocusRef = useRef(null);
  const labelId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = dialogRef.current;
    dialog?.querySelector(FOCUSABLE)?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusable = [...dialog.querySelectorAll(FOCUSABLE)].filter((element) => !element.disabled);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 ${className}`}>
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close dialog" />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={labelId} className="relative contents">
        <span id={labelId} className="sr-only">{label}</span>
        {children}
      </div>
    </div>
  );
}
