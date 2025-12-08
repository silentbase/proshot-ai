import { features } from "process";
import { Plan, plans } from "./utils/globals/plans";

if (process.env.NODE_ENV === "production") {
    require("dotenv").config(); // Load from .env in production
} else {
    require("dotenv").config({ path: ".env.local" }); // Load from .env.local in development
}

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Types
interface Product {
    name: string;
    subscription: boolean;
}

interface StripeProduct {
    id: string;
    name: string;
    metadata?: {
        features?: string;
    };
}

interface WebhookEndpoint {
    url: string;
}

// Configuration
const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ||
    "http://localhost:3000";
const CURRENCY = "eur";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Product Plans

const subscription: Product = {
    name: IS_PRODUCTION ? "Subscription" : "Subscription-Test",
    subscription: true,
};

// Helper Functions
async function createProduct(plan: Plan): Promise<StripeProduct> { //TODO create 1 product & 3 prices
    // Check if product exists
    const existingProducts = await stripe.products.list({ active: true });
    let product = existingProducts.data.find((p: StripeProduct) =>
        p.name === plan.name
    );

    if (!product) {
        // Create new product if it doesn't exist
        product = await stripe.products.create({
            name: plan.name,
            description: plan.description,
            metadata: {
                features: JSON.stringify(plan.features),
                credits: plan.credits,
            },
        });
        console.log(`Created product: ${plan.name}`);
    } else {
        // Update existing product's features
        product = await stripe.products.update(product.id, {
            description: plan.description,
            metadata: {
                features: JSON.stringify(plan.features),
                credits: plan.credits,
            },
        });
        console.log(`Updated product: ${plan.name}`);
    }

    return product;
}

async function createPrice(product: StripeProduct, plan: Plan): Promise<void> {
    // Check if price exists
    const existingPrices = await stripe.prices.list({
        product: product.id,
        active: true,
    });

    const alreadyExists = existingPrices.data.some((price: any) =>
        price.unit_amount === plan.price &&
        ((plan.subscription && price.recurring?.interval) ||
            (!plan.subscription && !price.recurring))
    );

    if (!alreadyExists) {
        var price = null;
        // Create new price if none exists
        if (plan.subscription) {
            price = await stripe.prices.create({
                product: product.id,
                unit_amount: plan.price,
                currency: CURRENCY,
                recurring: { interval: "month" },
            });
        } else {
            price = await stripe.prices.create({
                product: product.id,
                unit_amount: plan.price,
                currency: CURRENCY,
            });
        }
        // Set as default price
        await stripe.products.update(product.id, {
            default_price: price.id,
        });
        console.log(`Created price for ${plan.name}: ${price.id}`);
    }
}

async function setupWebhook(): Promise<void> {
    // Skip webhook setup in development
    if (!IS_PRODUCTION) {
        console.log("Skipping webhook setup in development");
        console.log(
            "Use Stripe CLI for local testing: https://stripe.com/docs/stripe-cli",
        );
        return;
    }

    const webhooks = await stripe.webhookEndpoints.list();
    const webhookUrl = `${PUBLIC_URL}/webhook/stripe`;

    if (
        !webhooks.data.some((webhook: WebhookEndpoint) =>
            webhook.url === webhookUrl
        )
    ) {
        await stripe.webhookEndpoints.create({
            enabled_events: [
                "customer.subscription.created",
                "customer.subscription.deleted",
                "customer.subscription.updated", //add event maybe
                "checkout.session.completed",
            ],
            url: webhookUrl,
        });
        console.log("Created webhook endpoint");
    }
}

// Main Setup Function
async function setupStripe(): Promise<void> {
    try {
        console.log(
            `Setting up Stripe in ${
                IS_PRODUCTION ? "production" : "development"
            } mode...`,
        );

        // Delete previous products
        const products = await stripe.products.list({
            active: true,
        });

        for (const product of products.data) {
            try {
                await stripe.products.del(product.id);
                console.log("Product deleted.");
            } catch (err: any) {
                await stripe.products.update(product.id, {
                    active: false,
                });
                console.log("Product couldn't be deleted. Product archived.");
            }
        }

        // Setup products and prices
        for (const plan of plans) {
            const product = await createProduct(plan);
            await createPrice(product, plan);
        }

        // Setup webhook
        await setupWebhook();

        console.log("Stripe setup completed successfully");
    } catch (error) {
        console.error("Error setting up Stripe:", error);
        throw error;
    }
}

// Run Setup
setupStripe().catch(console.error);
