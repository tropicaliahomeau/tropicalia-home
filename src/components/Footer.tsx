import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
                    {/* Brand Column */}
                    <div className={styles.brandColumn}>
                        <div className={styles.brandBranding}>
                            <Link href="/" className={styles.logoLink}>
                                <div className={styles.logoImageWrapper}>
                                    <div className={styles.homeIconFooter}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                            <polyline points="9 22 9 12 15 12 15 22" />
                                        </svg>
                                    </div>
                                </div>
                                <span className={styles.logoText}>
                                    Tropicalia<span className={styles.logoSuffix}>Home</span>
                                </span>
                            </Link>
                            <p className={styles.tagline}>
                                Fresh, healthy, and delicious lunches ready for pickup at our Footscray location.
                            </p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className={styles.columnTitle}>Company</h3>
                        <ul className={styles.linksList}>
                            <li><Link href="/about" className={styles.link}>About Us</Link></li>
                            <li><Link href="/how-it-works" className={styles.link}>How It Works</Link></li>
                            <li><Link href="/menu" className={styles.link}>Weekly Menu</Link></li>
                            <li><Link href="/careers" className={styles.link}>Careers</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className={styles.columnTitle}>Support</h3>
                        <ul className={styles.linksList}>
                            <li><Link href="/faq" className={styles.link}>FAQ</Link></li>
                            <li><Link href="/contact" className={styles.link}>Contact Us</Link></li>
                            <li><Link href="/terms" className={styles.link}>Terms of Service</Link></li>
                            <li><Link href="/privacy" className={styles.link}>Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className={styles.columnTitle}>Get in Touch</h3>
                        <div className={styles.linksList}>
                            <div className={styles.contactItem}>
                                <span>📧</span>
                                <span>tropicaliahome.au@gmail.com</span>
                            </div>
                            <div className={styles.contactItem}>
                                <span>📞</span>
                                <span>0405 048 216</span>
                            </div>
                            <div className={styles.contactItem}>
                                <span>📍</span>
                                <span>201 Ballarat Road, Footscray, 3011, VIC</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.bottomBar}>
                    <p className={styles.copyright}>
                        © {currentYear} TropicaliaHome. All rights reserved.
                    </p>
                </div>
            </div>
        </footer >
    );
}
