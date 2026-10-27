'use client';
import { useEffect, useRef } from 'react';

// Multi-line text box that grows while typing. Enter sends on computers, Shift+Enter makes a new line.
// On phones Enter always makes a new line (use the Send button).
export default function AutoTextarea({ value, onChange, onSubmit, placeholder, maxLength, autoFocus, style }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 220) + 'px';
  }, [value]);
  const touch = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  return (
    <textarea ref={ref} rows={1} className="autota" value={value} placeholder={placeholder} maxLength={maxLength} autoFocus={autoFocus} style={style}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter' && !e.shiftKey && !touch && !e.nativeEvent.isComposing && onSubmit) { e.preventDefault(); onSubmit(); }
      }} />
  );
}
