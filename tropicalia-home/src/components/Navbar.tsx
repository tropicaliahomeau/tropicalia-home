'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './Navbar.module.css';
import { useUser } from '@/context/UserContext';

export default function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout, cart } = useUser();

    const cartCount = cart.meals.length + cart.extras.reduce((sum, e) => sum + e.quantity, 0);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Weekly Menu', href: '/menu' },
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.navContent}>
                    {/* Logo (Centered) */}
                    <div className="absolute left-1/2 -translate-x-1/2">
                        <Link href="/" className={styles.logoLink}>
                            <span className={styles.logoText}>
                                Tropicalia<span className={styles.logoSuffix}>Home</span>
                            </span>
                        </Link>
                    </div>

                    {/* Home Icon (Corner) */}
                    <div className="flex items-center">
                        <Link href="/" className="text-[#4A5D23] hover:scale-110 transition-transform">
                            <div className="bg-green-50 p-2 rounded-xl border border-green-100 shadow-sm">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className={styles.desktopNav}>
                        <div className={styles.desktopNavLinks}>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ''}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* DESKTOP CART ICON */}
                        <Link
                            href="/checkout/review"
                            className="relative p-2 text-[#4A5D23] hover:scale-110 transition-transform ml-4"
                        >
                            <div className="bg-green-50 p-2 rounded-xl border border-green-100 shadow-sm relative">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce-subtle">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* Auth Buttons */}
                    <div className={styles.authButtons}>
                        {user ? (
                            <>
                                <span className={styles.navLink} style={{ cursor: 'default' }}>
                                    Hi, {user.name}
                                </span>
                                <Link
                                    href="/dashboard"
                                    className="btn btn-secondary"
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => logout()}
                                    className={styles.navLink}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className={styles.navLink}
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className="btn btn-primary"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3 md:hidden">
                        {/* MOBILE CART ICON */}
                        <Link
                            href="/checkout/review"
                            className="relative p-2 text-[#4A5D23]"
                        >
                            <div className="bg-green-50 p-2 rounded-xl border border-green-100 shadow-sm relative">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white animate-bounce-subtle">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                        </Link>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={styles.mobileMenuBtn}
                            aria-label="Toggle menu"
                            style={{ color: isMobileMenuOpen ? 'white' : 'inherit' }}
                        >
                            {!isMobileMenuOpen ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="3" y1="12" x2="21" y2="12"></line>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <line x1="3" y1="18" x2="21" y2="18"></line>
                                </svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className={styles.mobileMenu}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`${styles.mobileNavLink} ${pathname === link.href ? styles.mobileNavLinkActive : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className={styles.mobileAuth}>
                        {user ? (
                            <>
                                <div className={styles.mobileNavLink} style={{ opacity: 0.7 }}>
                                    Signed in as {user.email}
                                </div>
                                <Link
                                    href="/dashboard"
                                    className={styles.mobileNavLink}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={styles.mobileNavLink}
                                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className={styles.mobileNavLink}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
