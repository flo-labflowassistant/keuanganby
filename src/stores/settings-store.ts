import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    emailNotif: boolean;
    pushNotif: boolean;
    reminderNotif: boolean;
    budgetAlert: boolean;
    themeColor: string;
    setEmailNotif: (val: boolean) => void;
    setPushNotif: (val: boolean) => void;
    setReminderNotif: (val: boolean) => void;
    setBudgetAlert: (val: boolean) => void;
    setThemeColor: (color: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            emailNotif: true,
            pushNotif: true,
            reminderNotif: true,
            budgetAlert: true,
            themeColor: '#a855f7', // Default Lilac Purple
            setEmailNotif: (val) => set({ emailNotif: val }),
            setPushNotif: (val) => set({ pushNotif: val }),
            setReminderNotif: (val) => set({ reminderNotif: val }),
            setBudgetAlert: (val) => set({ budgetAlert: val }),
            setThemeColor: (color) => set({ themeColor: color }),
        }),
        {
            name: 'finance-settings',
        }
    )
);
