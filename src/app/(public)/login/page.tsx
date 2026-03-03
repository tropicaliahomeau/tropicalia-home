'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import styles from './login.module.css';

// Metadata removed because this is a client component

export default function LoginPage() {
    const { login } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // For demo purposes: tropicaliahome.au@gmail.com -> ADMIN, others -> CLIENT
        let role: "CUSTOMER" | "ADMIN" = "CUSTOMER";
        if (email === "tropicaliahome.au@gmail.com") role = "ADMIN";

        login(email, role);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>Sign in to manage your lunch subscription</p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
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
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            type="password"
                            id="password"
                            className={styles.input}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.button}>
                        Sign In
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>
                        Don't have an account?{' '}
                        <Link href="/register" className={styles.link}>
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
