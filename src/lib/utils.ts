import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCY_CONFIG } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: "currency",
    currency: CURRENCY_CONFIG.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getMonthName(month: number): string {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return months[month - 1] || "";
}

export function getBudgetStatusColor(percentage: number): string {
  if (percentage < 50) return "bg-primary";
  if (percentage < 80) return "bg-chart-1";
  if (percentage <= 100) return "bg-warning";
  return "bg-destructive";
}

export function getAmountColor(amount: number): string {
  return amount >= 0 ? "text-income" : "text-expense";
}

export function generateId(): string {
  return crypto.randomUUID();
}
