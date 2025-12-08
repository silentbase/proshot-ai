"use server";

import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";
import {
    createStripeCheckoutSession,
    deleteSubscription,
    generateStripeBillingPortalLink,
    getStripePlan,
    getStripePlanOfUser,
    getStripeProducts,
    getStripeSubscriptionPrices,
    getUserCredits,
    updateStripeSubscription,
} from "./api";

import { BillingPortalFlowType } from "../Enums";
import { db } from "@/utils/db/db";
import { creditTransactionsTable, usersTable } from "@/utils/db/schema";
import { eq } from "drizzle-orm";

export async function checkoutSession(priceId: string) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    try {
        const url = await createStripeCheckoutSession(user.email!, priceId);
        return url.toString();
    } catch (error) {
        throw error;
    }
}

export async function getStripePlanOfUserAction() {
    const supabase = createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        console.log("No User session available. Plan could not be retrieved.");
        return;
    }

    try {
        const plan = await getStripePlanOfUser(user!.email!);
        return plan;
    } catch (error) {
        console.log(error);
    }
}

export async function getStripePlanAction() {
    const supabase = createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        console.log("No User session available. Plan could not be retrieved.");
        return;
    }

    try {
        const plan = await getStripePlan(user!.email!);
        return plan;
    } catch (error) {
        console.log(error);
    }
}

export async function getBillingPortalLink(
    flowType: BillingPortalFlowType,
) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return await generateStripeBillingPortalLink(
        user.email!,
        flowType,
    );
}

export async function updateStripeSubscriptionAction(
    email: string,
    priceId: string,
) {
    try {
        const products = await updateStripeSubscription(email, priceId);
        return products;
    } catch (error) {
        console.log("Error fetching Stripe Products:", error);
        throw error;
    }
}

export async function getStripeProductsAction() {
    try {
        const products = await getStripeProducts();
        return products;
    } catch (error) {
        console.log("Error fetching Stripe Products:", error);
        throw error;
    }
}
export async function getStripeSubscriptionPricesAction() {
    try {
        const prices = await getStripeSubscriptionPrices();
        return prices;
    } catch (error) {
        console.log("Error fetching Stripe Products:", error);
        throw error;
    }
}
export async function deleteSubscriptionAction() {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    try {
        const message = await deleteSubscription(user?.email!);
        return message;
    } catch (error) {
        console.log("Error deleting subscription:", error);
        throw error;
    }
}
//********************* CREDIT LOGIC *********************//

// Fetch user's current credits
export async function getUserCreditsAction(): Promise<number> {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return 0;
    }

    const userId = user.id;

    try {
        const userCredits = await getUserCredits(userId);
        return userCredits;
    } catch (error) {
        console.error("Error fetching user credits:", error);
        throw new Error("Failed to fetch credits");
    }
}

export async function checkCredits(amount: number) {
    // Get current credits
    const currentCredits = await getUserCreditsAction();

    // Check if user has enough credits
    if (currentCredits < amount) {
        return false;
    }
    return true;
}

// Spend credits for a user
export async function spendCreditsAction(
    amount: number,
): Promise<{ success: boolean; credits: number }> {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const userId = user.id;

    try {
        // Get current credits
        const currentCredits = await getUserCreditsAction();

        // Check if user has enough credits
        if (currentCredits < amount) {
            return { success: false, credits: currentCredits };
        }

        // Deduct credits
        const newCredits = currentCredits - amount;

        // Update user's credits in the database
        await db
            .update(usersTable)
            .set({ credits: newCredits })
            .where(eq(usersTable.id, userId));

        // Record the transaction
        await db.insert(creditTransactionsTable).values({
            userId,
            amount: -amount, // Negative amount for spending
            transactionType: "usage",
            metadata: { purpose: "image_generation" },
            createdAt: new Date(),
        });

        return { success: true, credits: newCredits };
    } catch (error) {
        console.error("Error spending credits:", error);
        throw new Error("Failed to process credits transaction");
    }
}

// Add credits to a user (for purchases, refunds, etc.)
export async function addCredits(
    userId: string,
    amount: number,
    transactionType: "purchase" | "refund" | "bonus",
    metadata?: any,
): Promise<{ success: boolean; credits: number }> {
    try {
        // Get current credits
        const currentCredits = await getUserCreditsAction();

        // Add credits
        const newCredits = currentCredits + amount;

        // Update user's credits in the database
        await db
            .update(usersTable)
            .set({ credits: newCredits })
            .where(eq(usersTable.id, userId));

        // Record the transaction
        await db.insert(creditTransactionsTable).values({
            userId,
            amount,
            transactionType,
            metadata,
            createdAt: new Date(),
        });

        return { success: true, credits: newCredits };
    } catch (error) {
        console.error("Error adding credits:", error);
        throw new Error("Failed to add credits");
    }
}
