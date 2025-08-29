// src/components/Navbar.js
'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Newspaper } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';   // ← use this

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="navbar-modern">
      <div className="navbar-content">
        <div className="navbar-logo">
          <Newspaper size={28} className="logo-icon" />
          <Link href="/" className="navbar-title">NewsHub</Link>
        </div>

        <div className="navbar-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/search" className="nav-link">Search</Link>
          <Link href="/bookmarks" className="nav-link">Bookmarks</Link>
        </div>

        <div className="navbar-auth">
          {user ? (
            <button onClick={handleLogout} className="nav-btn logout">Logout</button>
          ) : (
            <>
              <Link href="/login" className="nav-btn">Login</Link>
              <Link href="/register" className="nav-btn">Register</Link>
            </>
          )}
          {/* tiny icon toggle (Light → Dark → System) */}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
