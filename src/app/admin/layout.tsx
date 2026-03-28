'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PasswordGate from '@/components/PasswordGate';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <PasswordGate area="admin">
            <div className="flex min-h-screen bg-gray-50">
                <aside className="w-64 fixed h-full bg-white border-r border-gray-200 p-6 z-[60]">
                    <div className="mb-10 flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#4A5D23] rounded-full flex items-center justify-center text-white font-bold">
                            T
                        </div>
                        <h1 className="font-bold text-[#4A5D23] text-xl">Tropicalia HOME</h1>
                    </div>

                    <nav className="space-y-2">
                        <Link href="/admin/dashboard" className={`block px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/admin/dashboard' ? 'bg-[#4A5D23]/10 text-[#4A5D23]' : 'text-gray-700 hover:bg-gray-50'}`}>
                            📊 Dashboard
                        </Link>
                        <Link href="/admin/menu" className={`block px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/admin/menu' ? 'bg-[#4A5D23]/10 text-[#4A5D23]' : 'text-gray-700 hover:bg-gray-50'}`}>
                            🍽️ Menu Management
                        </Link>
                        <Link href="/admin/finance" className={`block px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/admin/finance' ? 'bg-[#4A5D23]/10 text-[#4A5D23]' : 'text-gray-700 hover:bg-gray-50'}`}>
                            💸 Expense Management
                        </Link>
                        <Link href="/admin/orders" className={`block px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/admin/orders' ? 'bg-[#4A5D23]/10 text-[#4A5D23]' : 'text-gray-700 hover:bg-gray-50'}`}>
                            📦 Orders Management
                        </Link>
                    </nav>

                    <div className="absolute bottom-6 left-6 right-6">
                        <button
                            onClick={() => {
                                localStorage.removeItem("auth_admin");
                                window.location.reload();
                            }}
                            className="w-full py-2 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors font-bold"
                        >
                            Sign Out
                        </button>
                    </div>
                </aside>
                <main className="flex-1 ml-64 p-8">
                    {children}
                </main>
            </div>
        </PasswordGate>
    );
}
