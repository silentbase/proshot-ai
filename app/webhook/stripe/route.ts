import { db } from "@/utils/db/db";
import { usersTable } from "@/utils/db/schema";
import { BillingPortalFlowType } from "@/utils/Enums";
import getCreditAmount from "@/utils/helpers/getCreditAmount";
import {
    getBillingPortalLink,
    getStripePlanAction,
} from "@/utils/stripe/actions";
import { stripe } from "@/utils/stripe/api";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const event = await req.json();

        // NOTE: handle other event types as you need
        switch (event.type) {
            case "customer.created":
                console.log("Customer created");
                break;
            case "customer.deleted":
                console.log("Customer deleted");
                break;
            case "customer.subscription.created": {
                console.log("Subscription created");

                try {
                    var isCanceled = event.data.object.cancel_at_period_end;

                    const productId = event.data.object.plan.product;
                    const product = await stripe.products.retrieve(productId);

                    await db.update(usersTable)
                        .set({
                            plan: event.data.object.id,
                            isCanceled: isCanceled ? true : false,
                            credits: product?.metadata
                                ?.credits as unknown as number,
                        })
                        .where(
                            eq(
                                usersTable.stripe_id,
                                event.data.object.customer,
                            ),
                        );
                } catch (error) {
                    console.error("customer.subscription.created error");
                }

                break;
            }
            case "customer.subscription.updated": {
                console.log("Subscription updated");

                try {
                    var isCanceled = event.data.object.cancel_at_period_end;

                    const productId = event.data.object.plan.product;
                    const product = await stripe.products.retrieve(productId);

                    await db.update(usersTable)
                        .set({
                            plan: event.data.object.id,
                            isCanceled: isCanceled ? true : false,
                            credits: product?.metadata
                                ?.credits as unknown as number,
                        })
                        .where(
                            eq(
                                usersTable.stripe_id,
                                event.data.object.customer,
                            ),
                        );
                } catch (error) {
                    console.error("customer.subscription.updated error");
                }

                break;
            }
            case "customer.subscription.deleted": {
                console.log("subscription deleted");
                // 1. Get all subscriptions for this customer
                var subs = await stripe.subscriptions.list({
                    customer: event.data.object.customer,
                    status: "all",
                });

                // 2. Select only active or pending subs
                const activeOrPending = subs.data.filter(
                    (s) => s.status !== "canceled",
                );

                // 3. Determine the current subscription
                const currentSub = activeOrPending.length > 0
                    ? activeOrPending[0]
                    : null;

                // 4. If no subscription exists → clear plan & credits
                if (!currentSub) {
                    await db.update(usersTable)
                        .set({ plan: null, credits: 0 })
                        .where(
                            eq(
                                usersTable.stripe_id,
                                event.data.object.customer,
                            ),
                        );

                    break;
                }

                // 5. Get the price from the subscription
                const productId = currentSub.items.data[0].price.product;

                // 7. Retrieve product (contains credits metadata)
                const product = await stripe.products.retrieve(
                    productId as string,
                );

                // 8. Extract credits from metadata
                const credits = product.metadata?.credits
                    ? Number(product.metadata.credits)
                    : 0;

                // 9. Update database with detected sub + credits
                await db.update(usersTable)
                    .set({
                        plan: currentSub.id,
                        credits: credits,
                    })
                    .where(
                        eq(usersTable.stripe_id, event.data.object.customer),
                    );

                break;
            }
            case "checkout.session.completed": {
                var subs = await stripe.subscriptions.list({
                    customer: event.data.object.customer,
                });

                const latestSub = subs.data.sort((a, b) =>
                    b.created - a.created
                )[0];

                for (const sub of subs.data) {
                    if (sub.id !== latestSub.id) {
                        console.log(sub.id + " canceled");
                        await stripe.subscriptions.cancel(sub.id);
                    }
                }

                console.log("checkout session completed");
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return new Response("Success", { status: 200 });
    } catch (err) {
        return new Response(
            `Webhook error: ${
                err instanceof Error ? err.message : "Unknown error"
            }`,
            {
                status: 400,
            },
        );
    }
}
