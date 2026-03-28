import React from 'react';
import PasswordGate from '@/components/PasswordGate';

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
    return (
        <PasswordGate area="kitchen">
            {children}
        </PasswordGate>
    );
}
