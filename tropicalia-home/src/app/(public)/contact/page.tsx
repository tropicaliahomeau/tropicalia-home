
import { Metadata } from 'next';
import styles from './contact.module.css';

export const metadata: Metadata = {
    title: 'Contact Us | TropicaliaHome',
    description: 'Get in touch with us for inquiries, support, or feedback.',
};

export default function ContactPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Contact Us</h1>
                <p className={styles.subtitle}>We'd love to hear from you. Send us a message or visit us.</p>
            </div>

            <div className={styles.contentGrid}>
                <div className={styles.infoCard}>
                    <h3 className={styles.infoTitle}>Contact Information</h3>

                    <div className={styles.infoItem}>
                        <svg className={styles.icon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        <div>
                            <span className={styles.infoLabel}>Phone</span>
                            <p className={styles.infoText}>0405 048 216</p>
                        </div>
                    </div>

                    <div className={styles.infoItem}>
                        <svg className={styles.icon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        <div>
                            <span className={styles.infoLabel}>Email</span>
                            <p className={styles.infoText}>tropicaliahome.au@gmail.com</p>
                        </div>
                    </div>

                    <div className={styles.infoItem}>
                        <svg className={styles.icon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <div>
                            <span className={styles.infoLabel}>Address</span>
                            <p className={styles.infoText}>201 Ballarat Road, Footscray, 3011, VIC</p>
                        </div>
                    </div>
                </div>

                <div className={styles.formCard}>
                    <form>
                        <div className={styles.formGroup}>
                            <label htmlFor="name" className={styles.label}>Name</label>
                            <input type="text" id="name" className={styles.input} placeholder="Your name" />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.label}>Email</label>
                            <input type="email" id="email" className={styles.input} placeholder="Your email" />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="message" className={styles.label}>Message</label>
                            <textarea id="message" className={styles.textarea} placeholder="How can we help?"></textarea>
                        </div>
                        <button type="submit" className={styles.button}>Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
