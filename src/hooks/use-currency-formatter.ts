import { useCallback } from "react";
import { CURRENCY_CONFIG } from "@/lib/constants";

export function useCurrencyFormatter() {
    const format = useCallback((amount: number): string => {
        return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
            style: "currency",
            currency: CURRENCY_CONFIG.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }, []);

    return { format };
}
