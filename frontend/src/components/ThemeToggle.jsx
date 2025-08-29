// src/components/ThemeToggle.jsx
'use client';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'theme'; // 'light' | 'dark' | 'system'
const NEXT = { light: 'dark', dark: 'system', system: 'light' };

function applyTheme(mode) {
  if (mode === 'light' || mode === 'dark') {
    document.documentElement.setAttribute('data-theme', mode);
  } else {
    document.documentElement.removeAttribute('data-theme'); // system = follow OS
  }
}

export default function ThemeToggle({ className = '' }) {
  const [mode, setMode] = useState('system');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial =
      saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
    setMode(initial);
    applyTheme(initial);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      // only react to OS changes when in system mode
      const current = localStorage.getItem(STORAGE_KEY) || 'system';
      if (current === 'system') applyTheme('system');
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const cycle = () => {
    const next = NEXT[mode] || 'light';
    setMode(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };

  const label =
    mode === 'light'
      ? 'Switch to dark (current: light)'
      : mode === 'dark'
      ? 'Switch to system (current: dark)'
      : 'Switch to light (current: system)';
  const icon = mode === 'light' ? '☀️' : mode === 'dark' ? '🌙' : '🖥️';

  return (
    <button
      type="button"
      onClick={cycle}
      className={`theme-toggle-btn ${className}`}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}
