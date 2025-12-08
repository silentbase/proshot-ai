'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from "sonner"
import useAppContext from './AppContext';
import { getUserCreditsAction, spendCreditsAction } from '@/utils/stripe/actions';

// Import the server actions instead of direct API calls


interface CreditsContextType {
    credits: number;
    loading: boolean;
    refreshCredits: () => Promise<void>;
    spendCredits: (amount: number) => Promise<boolean>;
    showBuyCreditsModal: boolean;
    setShowBuyCreditsModal: (show: boolean) => void;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: ReactNode }) {
    const { user } = useAppContext();
    const [credits, setCredits] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [showBuyCreditsModal, setShowBuyCreditsModal] = useState<boolean>(false);

    // Use useCallback to avoid dependency warnings
    const refreshCredits = useCallback(async () => {

        try {
            if (!user) return;

            setLoading(true);
            // Use server action instead of direct API call
            const currentCredits = await getUserCreditsAction();
            setCredits(currentCredits);
        } catch (error) {
            console.error('Error fetching credits:', error);
            toast.error('Credits konnten nicht geladen werden');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Fetch user credits on mount and when user changes
    useEffect(() => {

        if (user) {
            refreshCredits();
        }
    }, [user, refreshCredits]);

    // Function to use credits for generations
    const spendCredits = useCallback(async (amount: number): Promise<boolean> => {
        try {
            if (!user) return false;

            // Check credits locally first for better UX
            if (credits < amount) {
                setShowBuyCreditsModal(true);
                return false;
            }

            // Call server action to spend credits
            const result = await spendCreditsAction(amount);

            if (!result.success) {
                toast.error('Nicht genügend Credits');
                setShowBuyCreditsModal(true);
                return false;
            }

            // Update local state
            setCredits(result.credits);
            return true;
        } catch (error) {
            console.error('Error using credits:', error);
            toast.error('Credits konnten nicht verwendet werden. Bitte versuchen Sie es erneut.');
            return false;
        }
    }, [credits, user, setShowBuyCreditsModal]);

    return (
        <CreditsContext.Provider value={{
            credits,
            loading,
            refreshCredits,
            spendCredits,
            showBuyCreditsModal,
            setShowBuyCreditsModal
        }}>
            {children}
        </CreditsContext.Provider>
    );
}

export function useCreditsContext() {
    const context = useContext(CreditsContext);
    if (context === undefined) {
        throw new Error('useCredits must be used within a CreditsProvider');
    }
    return context;
}