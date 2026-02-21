"use client";

import { useSettingsStore } from "@/stores/settings-store";
import { useEffect } from "react";

export function DynamicTheme() {
    const { themeColor } = useSettingsStore();

    useEffect(() => {
        if (!themeColor) return;

        const root = document.documentElement;

        // Apply the selected hex color to CSS variables used by Tailwind v4 inline theme
        root.style.setProperty('--primary', themeColor);
        root.style.setProperty('--sidebar-primary', themeColor);
        root.style.setProperty('--ring', themeColor);

        // Ensure foreground text on primary elements remains legible (white)
        root.style.setProperty('--primary-foreground', '#ffffff');
        root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
    }, [themeColor]);

    return null;
}
