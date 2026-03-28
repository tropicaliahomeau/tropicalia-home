'use client';

import React, { useState, useEffect } from 'react';

export default function PasswordGate({ children, area }: { children: React.ReactNode, area: 'admin' | 'kitchen' }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    // Add hydration check
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Expiration check
        const storedAuth = localStorage.getItem(`auth_${area}`);
        if (storedAuth) {
            const data = JSON.parse(storedAuth);
            if (new Date().getTime() < data.expires) {
                setIsAuthenticated(true);
            } else {
                localStorage.removeItem(`auth_${area}`);
            }
        }
    }, [area]);

    if (!mounted) return null; // Wait for hydration mapping

    if (isAuthenticated) {
        return <>{children}</>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ area, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Expira en 60 mins
                const expires = new Date().getTime() + 60 * 60 * 1000;
                localStorage.setItem(`auth_${area}`, JSON.stringify({ auth: true, expires }));
                setIsAuthenticated(true);
            } else {
                setErrorMsg(data.error || 'Clave incorrecta');
            }
        } catch (e) {
            setErrorMsg('Error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center p-4 z-[9999]">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
                <div className="w-16 h-16 bg-[#4A5D23]/10 text-[#4A5D23] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tight">Acceso Restringido</h2>
                <p className="text-gray-500 mb-6 font-medium text-sm">Por favor, introduce el PIN maestro para acceder a la zona {area === 'admin' ? 'Administrativa' : 'de Cocina'}.</p>
                
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    placeholder="••••••••"
                    className="w-full text-center text-2xl tracking-[0.5em] font-black text-gray-800 bg-gray-50 border-2 border-gray-100 rounded-xl py-4 mb-4 focus:outline-none focus:border-[#4A5D23] transition-colors"
                />
                
                {errorMsg && <p className="text-red-500 text-sm font-bold mb-4">{errorMsg}</p>}
                
                <button
                    disabled={loading || !password}
                    className="w-full bg-[#4A5D23] text-white py-4 rounded-xl font-black text-lg hover:bg-[#3a491c] transition-colors disabled:opacity-50"
                >
                    {loading ? 'Verificando...' : 'Entrar'}
                </button>
            </form>
        </div>
    );
}
