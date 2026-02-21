"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, ArrowLeftRight, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOTTOM_NAV_ITEMS } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
    LayoutDashboard,
    Wallet,
    ArrowLeftRight,
    BarChart3,
};

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
            <div className="flex items-center justify-around h-16 px-2">
                {BOTTOM_NAV_ITEMS.map((item) => {
                    const Icon = iconMap[item.icon];
                    const isActive =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 min-w-[60px] py-1.5 rounded-lg transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {Icon && (
                                <Icon
                                    className={cn(
                                        "h-5 w-5",
                                        isActive && "drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]"
                                    )}
                                />
                            )}
                            <span className="text-[10px] font-medium leading-none">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
