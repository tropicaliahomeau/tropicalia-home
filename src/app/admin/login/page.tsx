'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function AdminLoginPage() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Point #1: Double Factor Security Code
        if (code === '947962') {
            // Set cookie for middleware
            document.cookie = "admin_auth=true; path=/; max-age=3600"; // 1 hour session
            router.push('/admin/dashboard');
        } else {
            setError('Código de seguridad incorrecto. Acceso denegado.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-[#4A5D23] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                        T
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Panel Administrativo</h1>
                    <p className="text-gray-500 text-sm">Tropicalia Home v2</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="code" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                            Código de Seguridad (2FA)
                        </label>
                        <input
                            type="password"
                            id="code"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                                setError('');
                            }}
                            className="w-full p-4 text-center text-3xl font-mono tracking-[0.5em] border-2 border-gray-200 rounded-xl focus:border-[#4A5D23] focus:ring-0 transition-all bg-gray-50"
                            placeholder="******"
                            maxLength={6}
                            required
                        />
                        {error && <p className="text-red-500 text-sm mt-3 font-medium text-center animate-shake">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#4A5D23] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#3a491c] transition-all shadow-xl shadow-green-900/20 active:scale-95"
                    >
                        Validar Acceso
                    </button>

                    <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest mt-6">
                        🔒 Acceso Restringido • Solo Personal Autorizado
                    </p>
                </form>
            </div>
        </div>
    );
}
