import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="lg:pl-60">
                <Header />
                <main className="p-4 pb-20 md:p-6 lg:p-8 lg:pb-8">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <MobileNav />
        </div>
    );
}
