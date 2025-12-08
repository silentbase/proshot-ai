import { NextResponse } from "next/server";
import { generateStripeBillingPortalLink } from "@/utils/stripe/api";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, flowType } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 },
            );
        }

        /* const portalFlowType = flowType === 'subscription_update'
            ? BillingPortalFlowType.SubscriptionUpdate
            : BillingPortalFlowType.StandartFlow;*/

        // Call your existing server function
        const url = await generateStripeBillingPortalLink(
            email,
            flowType,
        );

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error("Error generating billing portal link:", error);
        return NextResponse.json(
            {
                error: error.message ||
                    "Failed to generate billing portal link",
            },
            { status: 500 },
        );
    }
}
