'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import styles from './register.module.css';

// Metadata removed because this is a client component

export default function RegisterPage() {
    const { register } = useUser();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [hasAllergies, setHasAllergies] = useState<boolean | null>(null);
    const [allergyDetails, setAllergyDetails] = useState('');
    const [referrerPhone, setReferrerPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (hasAllergies === null) {
            alert("Por favor indica si tienes alguna alergia (Módulo Obligatorio).");
            return;
        }

        if (hasAllergies && !allergyDetails.trim()) {
            alert("Please describe your allergies (max 5 words).");
            return;
        }

        if (hasAllergies && allergyDetails.trim().split(/\s+/).length > 5) {
            alert("Allergy description must be max 5 words.");
            return;
        }

        const fullName = `${firstName} ${lastName}`;
        const finalAllergies = hasAllergies ? allergyDetails : "Ninguna";
        register(fullName, email, phone, finalAllergies, referrerPhone);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Create Account</h1>
                <p className={styles.subtitle}>Join TropicaliaHome for delicious daily lunches</p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="firstName" className={styles.label}>First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                className={styles.input}
                                placeholder="John"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="lastName" className={styles.label}>Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                className={styles.input}
                                placeholder="Doe"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className={styles.input}
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="phone" className={styles.label}>Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            className={styles.input}
                            placeholder="04XX XXX XXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>

                    {/* Allergy Module (Mandatory) */}
                    <div className={`${styles.inputGroup} p-4 bg-orange-50 rounded-xl border border-orange-100 mb-6`}>
                        <label className="block text-sm font-bold text-orange-800 mb-3">
                            ⚠️ ¿Tienes alguna alergia? (Obligatorio)
                        </label>
                        <div className="flex gap-4 mb-3">
                            <button
                                type="button"
                                onClick={() => { setHasAllergies(true); setAllergyDetails(''); }}
                                className={`flex-1 py-2 rounded-lg font-bold transition-all border ${hasAllergies === true ? 'bg-orange-500 text-white border-orange-600 shadow-md' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                                SÍ
                            </button>
                            <button
                                type="button"
                                onClick={() => { setHasAllergies(false); setAllergyDetails(''); }}
                                className={`flex-1 py-2 rounded-lg font-bold transition-all border ${hasAllergies === false ? 'bg-gray-500 text-white border-gray-600 shadow-md' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                                NO
                            </button>
                        </div>

                        {hasAllergies && (
                            <div className="animate-fade-in">
                                <label htmlFor="allergyDetails" className="block text-xs font-medium text-orange-700 mb-1">
                                    Describe tu alergia (Máx 5 palabras):
                                </label>
                                <input
                                    type="text"
                                    id="allergyDetails"
                                    className={`${styles.input} border-orange-200 focus:ring-orange-500`}
                                    placeholder="Ex: Maní, Mariscos, Gluten"
                                    value={allergyDetails}
                                    onChange={(e) => setAllergyDetails(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <div className={`${styles.inputGroup} p-4 bg-gray-50 rounded-lg border border-dashed border-[#4A5D23]`}>
                        <label htmlFor="referrer" className="block text-sm font-medium text-[#4A5D23] mb-1">
                            🎁 ¿Alguien te refirió? (Opcional)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">Ingresa su número para ayudarlos a ganar semanas gratis.</p>
                        <input
                            type="tel"
                            id="referrer"
                            className={styles.input}
                            placeholder="Número del amigo"
                            value={referrerPhone}
                            onChange={(e) => setReferrerPhone(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            type="password"
                            id="password"
                            className={styles.input}
                            placeholder="Create a strong password"
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className={styles.input}
                            placeholder="Confirm your password"
                            minLength={8}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.checkboxGroup}>
                        <input type="checkbox" id="terms" className={styles.checkbox} required />
                        <label htmlFor="terms" className={styles.termsText}>
                            I agree to the <Link href="/terms" className={styles.link}>Terms of Service</Link> and <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
                        </label>
                    </div>

                    <button type="submit" className={styles.button}>
                        Registrarme
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>
                        Already have an account?{' '}
                        <Link href="/login" className={styles.link}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
