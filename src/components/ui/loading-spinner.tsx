import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className }: { className?: string }) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 space-y-4 ${className}`}>
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Memuat data...</p>
        </div>
    );
}
