import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";
import { createStripeCustomer } from "@/utils/stripe/api";
import { db } from "@/utils/db/db";
import { usersTable } from "@/utils/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
    const supabase = createClient();

    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get("next") ?? "/dashboard";

    console.log("Callback called with code:", code ? "present" : "missing");

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error("Error exchanging code for session:", error.message);
            return NextResponse.redirect(`${origin}/auth/error`);
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            console.error("No user found after code exchange");
            return NextResponse.redirect(`${origin}/auth/error`);
        }

        console.log("User authenticated:", user.email);

        // check to see if user already exists in db
        const checkUserInDB = await db.select().from(usersTable).where(
            eq(usersTable.email, user.email!),
        );
        const isUserInDB = checkUserInDB.length > 0;

        if (!isUserInDB) {
            console.log("Creating new user in DB");
            try {
                // create Stripe customers
                const stripeID = await createStripeCustomer(
                    user.id,
                    user.email!,
                    user.user_metadata.full_name || user.email!.split("@")[0],
                );
                // Create record in DB
                await db.insert(usersTable).values({
                    id: user.id,
                    name: user.user_metadata.full_name ||
                        user.email!.split("@")[0],
                    email: user.email!,
                    stripe_id: stripeID,
                });
                console.log("User created successfully in DB");
            } catch (dbError) {
                console.error("Error creating user in DB:", dbError);
                // Continue anyway since auth is successful
            }
        } else {
            console.log("User already exists in DB");
        }

        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        const redirectUrl = isLocalEnv
            ? `${origin}${next}`
            : forwardedHost
            ? `https://${forwardedHost}${next}`
            : `${origin}${next}`;

        console.log("Redirecting to:", redirectUrl);
        
        // Revalidate the dashboard layout to refresh auth state
        revalidatePath("/dashboard", "layout");
        
        return NextResponse.redirect(redirectUrl);
    }

    console.error("No code parameter provided");
    return NextResponse.redirect(`${origin}/auth/error`);
}
