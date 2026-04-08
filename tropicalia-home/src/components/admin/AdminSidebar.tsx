'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { LayoutDashboard, Users, ShoppingBag, DollarSign, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Customers', href: '/admin/customers', icon: Users },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Finance', href: '/admin/finance', icon: DollarSign },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md md:hidden"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-40 w-64 md:w-full bg-white border-r border-gray-100 transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-full shadow-sm
      `}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center h-20 px-8 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800 leading-none">Tropicalia</h1>
                                <span className="text-xs text-yellow-500 font-bold tracking-widest uppercase">Home</span>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 py-8 space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive
                                            ? 'bg-yellow-50 text-yellow-700 shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                                >
                                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-yellow-500' : 'text-gray-400'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-50 mx-4 mb-4">
                        <button
                            onClick={logout}
                            className="flex items-center w-full px-4 py-3 text-sm font-medium text-white bg-green-700 rounded-xl hover:bg-green-800 transition-colors shadow-sm"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
