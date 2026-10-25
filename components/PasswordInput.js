'use client';
import { useState } from 'react';
export default function PasswordInput({ value, onChange, placeholder = 'Password', autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw">
      <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder}
        autoComplete={autoComplete} required minLength={8} />
      <button type="button" className="eye" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  );
}
