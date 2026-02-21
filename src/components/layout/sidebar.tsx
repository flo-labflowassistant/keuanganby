"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Wallet,
    ArrowLeftRight,
    PiggyBank,
    BarChart3,
    Bell,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
    LayoutDashboard,
    Wallet,
    ArrowLeftRight,
    PiggyBank,
    BarChart3,
    Bell,
    Settings,
};

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col border-r border-sidebar-border bg-sidebar z-30">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Wallet className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-sidebar-foreground leading-tight">
                        KeuanganBy
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-tight">
                        Pencatat Keuangan
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
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
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-sidebar-accent text-sidebar-primary border-l-[3px] border-sidebar-primary"
                                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground border-l-[3px] border-transparent"
                            )}
                        >
                            {Icon && (
                                <Icon
                                    className={cn(
                                        "h-[18px] w-[18px] shrink-0",
                                        isActive ? "text-sidebar-primary" : "text-muted-foreground"
                                    )}
                                />
                            )}
                            <span>{item.label}</span>
                            {item.badge && item.badge > 0 && (
                                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-1.5">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>


        </aside>
    );
}
