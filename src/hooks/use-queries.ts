"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";
import { Transaction, SavingGoal, Reminder, TransactionFilter } from "@/types";

// === QUERIES ===

export function useDashboardSummary(month: number, year: number) {
    return useQuery({
        queryKey: ["dashboardSummary", month, year],
        queryFn: () => api.getDashboardSummary(month, year),
    });
}

export function useBudgetStatus(month: number, year: number) {
    return useQuery({
        queryKey: ["budgetStatus", month, year],
        queryFn: () => api.getBudgetStatus(month, year),
    });
}

export function useMonthlyTrend(month: number, year: number) {
    return useQuery({
        queryKey: ["monthlyTrend", month, year],
        queryFn: () => api.getMonthlyTrend(month, year),
    });
}

export function useTransactions(month: number, year: number, accountName?: string) {
    return useQuery({
        queryKey: ["transactions", month, year, accountName ?? "all"],
        queryFn: () => api.getTransactions(month, year, accountName),
    });
}

export function useSavingsOverview(month: number, year: number) {
    return useQuery({
        queryKey: ["savingsOverview", month, year],
        queryFn: () => api.getSavingsOverview(month, year),
    });
}

export function usePaginatedTransactions(filter: TransactionFilter) {
    return useQuery({
        queryKey: ["paginatedTransactions", filter],
        queryFn: () => api.getPaginatedTransactions(filter),
        placeholderData: (previousData) => previousData,
    });
}

export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: () => api.getCategories(),
    });
}

export function useAccounts() {
    return useQuery({
        queryKey: ["accounts"],
        queryFn: () => api.getAccounts(),
    });
}

export function useSavingGoals() {
    return useQuery({
        queryKey: ["savingGoals"],
        queryFn: () => api.getSavingGoals(),
    });
}

export function useReminders() {
    return useQuery({
        queryKey: ["reminders"],
        queryFn: () => api.getReminders(),
    });
}

export function useMonthlyBudgets(month: number, year: number) {
    return useQuery({
        queryKey: ["monthlyBudgets", month, year],
        queryFn: () => api.getMonthlyBudgets(month, year),
    });
}

// === MUTATIONS ===

export function useCreateSavingGoal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (goal: Partial<SavingGoal>) => api.createSavingGoal(goal),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["savingGoals"] });
        },
    });
}

export function useUpdateSavingGoalAmount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, addedAmount, goalName }: { id: string; addedAmount: number; goalName: string }) =>
            api.updateSavingGoalAmount(id, addedAmount, goalName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["savingGoals"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["savingsOverview"] });
            queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
            queryClient.invalidateQueries({ queryKey: ["budgetStatus"] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
        },
    });
}

export function useDeleteSavingGoal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.deleteSavingGoal(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["savingGoals"] });
            queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
            queryClient.invalidateQueries({ queryKey: ["budgetStatus"] });
            queryClient.invalidateQueries({ queryKey: ["savingsOverview"] });
        },
    });
}

export function useCreateTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (txn: Partial<Transaction>) => api.createTransaction(txn),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["paginatedTransactions"] });
            queryClient.invalidateQueries({ queryKey: ["savingsOverview"] });
            queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
            queryClient.invalidateQueries({ queryKey: ["budgetStatus"] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
        },
    });
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.deleteTransaction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["paginatedTransactions"] });
            queryClient.invalidateQueries({ queryKey: ["savingsOverview"] });
            queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
            queryClient.invalidateQueries({ queryKey: ["budgetStatus"] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
        },
    });
}

export function useUpdateCategoryBudget() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, allocation, month, year }: { id: string; allocation: number; month: number; year: number; }) =>
            api.updateCategoryBudget(id, allocation, month, year),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["monthlyBudgets"] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            queryClient.invalidateQueries({ queryKey: ["budgetStatus"] });
            queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
        },
    });
}

export function useUpdateReminderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) => api.updateReminderStatus(id, isCompleted),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reminders"] });
            queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
        },
    });
}

export function useCreateReminder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reminder: Partial<Reminder>) => api.createReminder(reminder),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reminders"] });
            queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
        },
    });
}

export function useDeleteReminder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.deleteReminder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reminders"] });
            queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
        },
    });
}
