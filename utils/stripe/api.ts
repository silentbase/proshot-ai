import { Stripe } from "stripe";
import { db } from "../db/db";
import { creditTransactionsTable, usersTable } from "../db/schema";
import { and, count, eq } from "drizzle-orm";
import { BillingPortalFlowType } from "../Enums";
import { IS_PRODUCTION } from "../env";
import { Superscript } from "lucide-react";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ||
    "http://localhost:3000";

export interface StripePlan {
    id: string;
    name: string;
    description: string | null;
    features: string[];
    credits: number;
    price: Stripe.Price;
    isCanceled: boolean;
}

export interface StripeProduct {
    id: string;
    name: string;
    description: string | null;
    features: string[];
    price: Stripe.Price;
}

export async function getStripePlan(email: string): Promise<StripePlan | null> {
    const user = await db.select().from(usersTable).where(
        eq(usersTable.email, email),
    );

    if (user[0].plan === "none" || !user[0].plan) {
        return null;
    }

    const subscription = await stripe.subscriptions.retrieve(user[0].plan);
    const productId = subscription.items.data[0].plan.product as string;
    const product = await stripe.products.retrieve(productId);

    return {
        id: product.id,
        name: product.name,
        description: product.description,
        features: product.metadata?.features
            ? JSON.parse(product.metadata.features)
            : [],
        credits: product.metadata.credits as unknown as number,
        price: product.default_price as Stripe.Price,
        isCanceled: subscription.cancel_at_period_end,
    };
}

export async function getUserName(email: string) {
    const user = await db.select().from(usersTable).where(
        eq(usersTable.email, email),
    );

    return user[0].name;
}

export async function getStripeProducts(): Promise<StripeProduct[]> {
    const products = await stripe.products.list({
        active: true,
        expand: ["data.default_price"],
    });

    return products.data.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        features: product.metadata?.features
            ? JSON.parse(product.metadata.features)
            : [],
        price: product.default_price as Stripe.Price,
    }));
}

export async function getStripePlanOfUser(email: string) {
    const user = await db.select().from(usersTable).where(
        eq(usersTable.email, email),
    );
    const plan = await stripe.subscriptions.list({
        customer: user[0].stripe_id,
        status: "active",
        limit: 1,
    });
    if (!plan) {
        throw new Error("Keine aktiven Pläne für diesen Kunden");
    }

    return plan.data[0];
}

export async function getStripeSubscriptionPrices(): Promise<Stripe.Price[]> {
    // Replace with your actual product ID
    const products = await stripe.products.list({
        active: true,
        limit: 1,
        expand: ["data.default_price"],
    });

    const fetchedProduct = products.data[0];
    const subscription = IS_PRODUCTION ? "Subscription" : "Subscription-Test";

    if (fetchedProduct.name !== subscription) {
        throw new Error("Abonnements konnten nicht gefunden werden");
    }
    const prices = await stripe.prices.list({
        type: "recurring",
        product: fetchedProduct.id,
        active: true,
        expand: ["data.product"],
    });
    return prices.data;
}

export async function createStripeCustomer(
    id: string,
    email: string,
    name?: string,
) {
    const customer = await stripe.customers.create({
        name: name ? name : "",
        email: email,
        metadata: {
            supabase_id: id,
        },
    });
    // Create a new customer in Stripe
    return customer.id;
}

export async function createStripeCheckoutSession(
    email: string,
    priceId: string,
) {
    const user = await db.select().from(usersTable).where(
        eq(usersTable.email, email),
    );

    const checkoutSession = await stripe.checkout.sessions.create({
        customer: user[0].stripe_id,
        mode: "subscription", //at some point maybe one time offers as well
        line_items: [{
            price: priceId,
            quantity: 1,
        }],
        success_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/subscribe/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/dashboard`,
    });

    if (!checkoutSession.url) {
        throw new Error(
            "Checkout-Sitzung konnte nicht erstellt werden für E-Mail: " +
                email,
        );
    }
    //redirect(checkoutSession.url)
    return checkoutSession.url;
}

export async function updateStripeSubscription(email: string, priceId: string) {
    const user = await db.select().from(usersTable).where(
        eq(usersTable.email, email),
    );

    const subscription = await stripe.subscriptions.list({
        customer: user[0].stripe_id,
        status: "active",
        limit: 1,
    });

    const subscriptionId = subscription.data[0].id;
    const itemId = subscription.data[0].items.data[0].id;
    //const priceId = subscription.data[0].items.data[0].price

    if (subscription) {
        const sub = await stripe.subscriptions.update(subscriptionId, {
            items: [
                {
                    id: itemId,
                    price: priceId,
                },
            ],
            proration_behavior: "create_prorations", // charge difference immediately
        });
        return sub;
    }
}

export async function createStripeCustomerSession(email: string) {
    try {
        const user = await db.select().from(usersTable).where(
            eq(usersTable.email, email),
        );

        if (!user.length || !user[0].stripe_id) {
            throw new Error(
                "Benutzer nicht gefunden oder Stripe-Kunden-ID fehlt",
            );
        }

        const customerSession = await stripe.customerSessions.create({
            customer: user[0].stripe_id,
            components: {
                pricing_table: {
                    enabled: true,
                },
            },
        });

        return customerSession.client_secret;
    } catch (error) {
        console.error("Error creating Stripe customer session:", error);
        throw error;
    }
}

export async function generateStripeBillingPortalLink(
    email: string,
    flowType: BillingPortalFlowType,
) {
    try {
        const user = await db.select().from(usersTable).where(
            eq(usersTable.email, email),
        );

        if (!flowType) {
            const portalSession = await stripe.billingPortal.sessions.create({
                customer: user[0].stripe_id,
                return_url: `${PUBLIC_URL}/dashboard`,
            });
            return { url: portalSession.url };
        }

        var portalSession = null;

        switch (flowType) {
            case BillingPortalFlowType.SubUpdate:
                portalSession = await stripe.billingPortal.sessions
                    .create({
                        customer: user[0].stripe_id,
                        flow_data: {
                            type: flowType,
                            subscription_update: {
                                subscription: user[0].plan!,
                            },
                            after_completion: {
                                type: "redirect",
                                redirect: {
                                    return_url: `${PUBLIC_URL}/dashboard`,
                                },
                            },
                        },
                        return_url: `${PUBLIC_URL}/dashboard`,
                    });
                break;

            case BillingPortalFlowType.SubCancel:
                portalSession = await stripe.billingPortal.sessions
                    .create({
                        customer: user[0].stripe_id,
                        flow_data: {
                            type: flowType,
                            subscription_cancel: {
                                subscription: user[0].plan!,
                            },
                            after_completion: {
                                type: "redirect",
                                redirect: {
                                    return_url: `${PUBLIC_URL}/konto`,
                                },
                            },
                        },
                        return_url: `${PUBLIC_URL}/dashboard`,
                    });
                break;

            default:
                return {
                    error:
                        "Ops! Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.",
                };
        }

        return { url: portalSession.url };
    } catch (error) {
        console.log(error);
        return {
            error:
                "Ops! Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.",
        };
    }
}

export async function deleteSubscription(email: string) {
    // 1. Get user by email
    const user = await db.select().from(usersTable).where(
        eq(usersTable.email, email),
    );

    if (!user.length) {
        return { error: "Nutzer nicht gefunden." };
    }

    // 2. Get subscription ID (assuming plan field stores subscription ID)
    const subscriptionId = user[0].plan;
    if (!subscriptionId || subscriptionId === "none") {
        return { error: "Kein aktives Abonnement gefunden." };
    }

    try {
        // 3. Cancel the subscription in Stripe
        await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });

        return { message: "Abonnement erfolgreich gekündigt." };
    } catch (err) {
        return { error: "Abonnement konnte nicht gekündigt werden: " + err };
    }
}

export async function deleteStripeCustomer(id: string) {
    try {
        const deleted = await stripe.customers.del(id);
        return { success: true, deleted };
    } catch (err) {
        console.error("Error deleting Stripe customer:", err);
        return {
            success: false,
            error: "Stripe-Kunde konnte nicht gelöscht werden: " + err,
        };
    }
}

export async function syncStripeSubscription(email: string) {
    const user = await db.select().from(usersTable).where(
        eq(usersTable.email, email),
    );

    const subscriptions = await stripe.subscriptions.list({
        customer: user[0].stripe_id,
        status: "active",
        limit: 1,
    });

    const sub = subscriptions.data[0];

    if (!sub) {
        // No active subscription found, clean up DB
        await db.update(usersTable)
            .set({ plan: null })
            .where(eq(usersTable.stripe_id, user[0].stripe_id));
    } else {
        await db.update(usersTable)
            .set({
                plan: sub.id,
                isCanceled: sub.cancel_at_period_end ? true : false,
            })
            .where(eq(usersTable.stripe_id, user[0].stripe_id));
    }
}

//********************* CREDIT LOGIC *********************//

// Types for credit packages
interface CreditPackage {
    id: string;
    name: string;
    credits: number;
    price: number;
    popular?: boolean;
}

// Credit packages configuration
export const CREDIT_PACKAGES: CreditPackage[] = [
    { id: "price_basic", name: "Basic", credits: 10, price: 9.99 },
    {
        id: "price_standard",
        name: "Standard",
        credits: 50,
        price: 39.99,
        popular: true,
    },
    { id: "price_premium", name: "Premium", credits: 150, price: 99.99 },
];

// Get available credit packages
export function getCreditPackages(): CreditPackage[] {
    return CREDIT_PACKAGES;
}

// Get user's current credits
export async function getUserCredits(userId: string): Promise<number> {
    const user = await db.select({
        credits: usersTable.credits,
    }).from(usersTable).where(
        eq(usersTable.id, userId),
    ).limit(1);

    if (!user) {
        throw new Error("Benutzer nicht gefunden!");
    }

    return user.length > 0 ? (user[0].credits || 0) : 0;
}

// Use credits for generation
export async function useCredits(
    userId: string,
    amount: number,
): Promise<{ success: boolean; credits: number }> {
    // First get the current credits to check if sufficient
    const user = await db.select({
        credits: usersTable.credits,
    }).from(usersTable).where(
        eq(usersTable.id, userId),
    ).limit(1);

    if (!user.length || (user[0].credits || 0) < amount) {
        return {
            success: false,
            credits: user.length > 0 ? (user[0].credits || 0) : 0,
        };
    }

    // Update the credits
    const newCredits = (user[0].credits || 0) - amount;

    await db.update(usersTable)
        .set({ credits: newCredits })
        .where(eq(usersTable.id, userId));

    // Record the transaction
    await db.insert(creditTransactionsTable).values({
        userId,
        amount: -amount,
        transactionType: "usage",
        createdAt: new Date(),
        metadata: { purpose: "image_generation" },
    });

    return { success: true, credits: newCredits };
}

// Create a checkout session for credit purchase
export async function createCreditPurchaseSession(
    userId: string,
    email: string,
    packageId: string,
): Promise<string> {
    // Find the selected package
    const selectedPackage = CREDIT_PACKAGES.find((pkg) => pkg.id === packageId);
    if (!selectedPackage) {
        throw new Error("Ungültiges Paket ausgewählt");
    }

    // Get user's Stripe customer ID
    const user = await db.select({
        stripeId: usersTable.stripe_id,
    }).from(usersTable).where(
        eq(usersTable.id, userId),
    ).limit(1);

    if (!user.length || !user[0].stripeId) {
        throw new Error("Benutzer nicht gefunden oder Stripe-Kunden-ID fehlt");
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
        customer: user[0].stripeId,
        mode: "payment",
        line_items: [{
            price_data: {
                currency: "usd",
                product_data: {
                    name: `${selectedPackage.name} Credit Package`,
                    description:
                        `${selectedPackage.credits} image generation credits`,
                },
                unit_amount: Math.round(selectedPackage.price * 100), // convert to cents
            },
            quantity: 1,
        }],
        success_url: `${PUBLIC_URL}/dashboard?payment=success`,
        cancel_url: `${PUBLIC_URL}/dashboard?payment=canceled`,
        metadata: {
            userId,
            credits: selectedPackage.credits.toString(),
            packageName: selectedPackage.name,
        },
    });

    if (!checkoutSession.url) {
        throw new Error("Checkout-Sitzung konnte nicht erstellt werden");
    }

    return checkoutSession.url;
}

// Add credits to user account (called by webhook)
export async function addCredits(
    userId: string,
    amount: number,
): Promise<number> {
    // Get current credits
    const user = await db.select({
        credits: usersTable.credits,
    }).from(usersTable).where(
        eq(usersTable.id, userId),
    ).limit(1);

    const currentCredits = user.length > 0 ? (user[0].credits || 0) : 0;
    const newCredits = currentCredits + amount;

    // Update user credits
    await db.update(usersTable)
        .set({ credits: newCredits })
        .where(eq(usersTable.id, userId));

    return newCredits;
}

// Record a credit transaction
export async function recordCreditTransaction(
    userId: string,
    amount: number,
    transactionType: "purchase" | "usage" | "refund" | "bonus" | "promotion",
    paymentId?: string,
    metadata?: any,
): Promise<void> {
    await db.insert(creditTransactionsTable).values({
        userId,
        amount,
        transactionType,
        paymentId,
        metadata,
        createdAt: new Date(),
    });
}

// Get credit transaction history for a user
export async function getUserCreditTransactions(userId: string) {
    return await db.select().from(creditTransactionsTable)
        .where(eq(creditTransactionsTable.userId, userId))
        .orderBy(creditTransactionsTable.createdAt);
}

// Check if user has sufficient credits for an operation
export async function hasEnoughCredits(
    userId: string,
    requiredAmount: number,
): Promise<boolean> {
    const currentCredits = await getUserCredits(userId);
    return currentCredits >= requiredAmount;
}

// Gift credits to users (for promotions, referrals, etc.)
export async function giftCredits(
    userId: string,
    amount: number,
    reason: string,
): Promise<number> {
    const newTotal = await addCredits(userId, amount);

    // Record the transaction as a bonus
    await recordCreditTransaction(
        userId,
        amount,
        "bonus",
        undefined,
        { reason },
    );

    return newTotal;
}

// Get user's credit usage statistics
export async function getCreditUsageStats(userId: string) {
    const transactions = await getUserCreditTransactions(userId);

    // Calculate total used, purchased, and gifted credits
    const stats = transactions.reduce((acc, transaction) => {
        const amount = Math.abs(transaction.amount);

        if (transaction.transactionType === "usage") {
            acc.totalUsed += amount;
        } else if (transaction.transactionType === "purchase") {
            acc.totalPurchased += amount;
        } else if (transaction.transactionType === "bonus") {
            acc.totalGifted += amount;
        } else if (transaction.transactionType === "refund") {
            acc.totalRefunded += amount;
        }

        return acc;
    }, {
        totalUsed: 0,
        totalPurchased: 0,
        totalGifted: 0,
        totalRefunded: 0,
    });

    return {
        ...stats,
        currentBalance: await getUserCredits(userId),
        transactionCount: transactions.length,
    };
}

// Calculate the cost breakdown for a generation job
export function calculateCreditCost(
    settings: {
        numberOfImages?: number;
        quality?: "standard" | "high" | "ultra";
        complexity?: "simple" | "standard" | "complex";
    },
): number {
    // Base cost per image
    const baseCost = 1;

    // Quality multipliers
    const qualityMultipliers = {
        standard: 1,
        high: 1.5,
        ultra: 2.5,
    };

    // Complexity multipliers
    const complexityMultipliers = {
        simple: 0.8,
        standard: 1,
        complex: 1.5,
    };

    const numberOfImages = settings.numberOfImages || 1;
    const qualityMultiplier = settings.quality
        ? qualityMultipliers[settings.quality]
        : 1;
    const complexityMultiplier = settings.complexity
        ? complexityMultipliers[settings.complexity]
        : 1;

    // Calculate total cost
    const totalCost = Math.ceil(
        baseCost * numberOfImages * qualityMultiplier * complexityMultiplier,
    );

    return totalCost;
}

// Refund credits to a user (for failed generations, etc.)
export async function refundCredits(
    userId: string,
    amount: number,
    reason: string,
): Promise<number> {
    const newTotal = await addCredits(userId, amount);

    // Record the transaction as a refund
    await recordCreditTransaction(
        userId,
        amount,
        "refund",
        undefined,
        { reason },
    );

    return newTotal;
}

// Get recent credit transactions with pagination
export async function getPaginatedCreditTransactions(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
) {
    const offset = (page - 1) * pageSize;

    const transactions = await db
        .select()
        .from(creditTransactionsTable)
        .where(eq(creditTransactionsTable.userId, userId))
        .orderBy(creditTransactionsTable.createdAt)
        .limit(pageSize)
        .offset(offset);

    // Get total count for pagination

    const [{ count: totalCount }] = await db
        .select({ count: count() })
        .from(creditTransactionsTable)
        .where(eq(creditTransactionsTable.userId, userId));
    return {
        transactions,
        pagination: {
            total: Number(totalCount),
            page,
            pageSize,
            totalPages: Math.ceil(Number(totalCount) / pageSize),
        },
    };
}
