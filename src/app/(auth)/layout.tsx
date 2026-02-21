export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf5ff] via-[#f3e8ff] to-[#e9d5ff]">
            <div className="w-full max-w-md mx-auto px-4">
                {children}
            </div>
        </div>
    );
}
