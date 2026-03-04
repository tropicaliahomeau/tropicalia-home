'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const hideFooterPaths = ['/login', '/register', '/checkout'];
    const shouldHideFooter = hideFooterPaths.includes(pathname);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            {!shouldHideFooter && <Footer />}
        </div>
    );
}
