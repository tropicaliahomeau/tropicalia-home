
'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import styles from './messages.module.css';

// Mock Data
const CONTACTS = [
    { id: 1, name: "Support Team", avatar: "ST", online: true },
    { id: 2, name: "Kitchen Manager", avatar: "KM", online: false },
];

const INITIAL_MESSAGES = [
    { id: 1, senderId: 1, text: "Hello! Welcome to TropicaliaHome support. How can we help you today?", time: "09:00 AM" },
    { id: 2, senderId: 'me', text: "Hi, I have a question about next week's menu.", time: "09:05 AM" },
    { id: 3, senderId: 1, text: "Sure thing! What would you like to know?", time: "09:06 AM" },
];

// Metadata removed because this is a client component

export default function MessagesPage() {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const [activeContact, setActiveContact] = useState(CONTACTS[0]);
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msg = {
            id: messages.length + 1,
            senderId: 'me',
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, msg]);
        setNewMessage("");

        // Simulate reply
        setTimeout(() => {
            const reply = {
                id: messages.length + 2,
                senderId: activeContact.id,
                text: "Thanks for your message! Our team will get back to you shortly.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, reply]);
        }, 1500);
    };

    if (isLoading || !user) {
        return <div className="p-8 text-center">Loading Messages...</div>;
    }

    return (
        <div className="container mx-auto px-4">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Messages</h1>
                </div>

                <div className={styles.chatLayout}>
                    {/* Sidebar */}
                    <div className={styles.sidebar}>
                        <div className={styles.sidebarHeader}>
                            Conversions
                        </div>
                        <div className={styles.contactList}>
                            {CONTACTS.map(contact => (
                                <div
                                    key={contact.id}
                                    className={`${styles.contactItem} ${activeContact.id === contact.id ? styles.activeContact : ''}`}
                                    onClick={() => setActiveContact(contact)}
                                >
                                    <div className={styles.avatar}>
                                        {contact.avatar}
                                    </div>
                                    <div className={styles.contactInfo}>
                                        <div className={styles.contactName}>{contact.name}</div>
                                        <div className={styles.lastMessage}>Click to view chat</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={styles.chatArea}>
                        <div className={styles.chatHeader}>
                            <div className={styles.avatar}>
                                {activeContact.avatar}
                            </div>
                            <div>
                                <div className={styles.contactName}>{activeContact.name}</div>
                                <div className="text-xs text-[var(--text-secondary)]">
                                    {activeContact.online ? 'Online' : 'Offline'}
                                </div>
                            </div>
                        </div>

                        <div className={styles.messagesList}>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`${styles.messageBubble} ${msg.senderId === 'me' ? styles.sent : styles.received}`}
                                >
                                    {msg.text}
                                    <span className={styles.messageTime}>{msg.time}</span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className={styles.inputArea} onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                className={styles.messageInput}
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className={styles.sendButton}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
