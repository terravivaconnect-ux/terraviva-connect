'use client';
import { useSearchParams } from 'next/navigation';

// Kitambulisho cha kipengele kilichoshirikiwa (?id=...), au '' kama hakuna.
export function useFocusId() {
  const sp = useSearchParams();
  const v = sp.get('id') || '';
  return /^[0-9a-f-]{36}$/i.test(v) ? v : '';
}
