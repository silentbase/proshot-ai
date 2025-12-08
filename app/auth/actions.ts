"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
    createStripeCustomer,
    deleteStripeCustomer,
    getStripePlan,
    syncStripeSubscription,
} from "@/utils/stripe/api";
import { db } from "@/utils/db/db";
import { usersTable } from "@/utils/db/schema";
import { eq } from "drizzle-orm";
import { createServiceRoleClient } from "@/utils/supabase/ServiceRole";
import {
    getStripePlanAction,
    getStripePlanOfUserAction,
} from "@/utils/stripe/actions";

const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ||
    "http://localhost:3000";

const translateAuthError = (errorMessage: string): string => {
    const translations: Record<string, string> = {
        "Invalid login credentials": "Ungültige Anmeldedaten",
        "Email not confirmed": "E-Mail nicht bestätigt",
        "User not found": "Benutzer nicht gefunden",
        "Invalid email or password": "Ungültige E-Mail oder Passwort",
        "Email already registered": "E-Mail bereits registriert",
        "Password should be at least 6 characters":
            "Passwort muss mindestens 6 Zeichen lang sein",
        "Passwords do not match": "Passwörter stimmen nicht überein",
        "Failed to create user": "Benutzer konnte nicht erstellt werden",
        "Failed to setup user account":
            "Benutzerkonto konnte nicht eingerichtet werden",
        "New password should be different from the old password.":
            "Das neue Passwort muss sich vom alten unterscheiden",
        "Auth session missing!": "Zurücksetzung des Passworts fehlgeschlagen.",
        "An account with this email already exists. Please login instead.":
            "Ein Konto mit dieser E-Mail existiert bereits. Bitte melden Sie sich stattdessen an.",
        "already registered": "bereits registriert",
        "Please cancel your subscription first, before deleting your account.":
            "Bitte kündigen Sie zuerst Ihr Abonnement, bevor Sie Ihr Konto löschen.",
    };

    // Check for partial matches
    for (const [key, value] of Object.entries(translations)) {
        if (errorMessage.includes(key)) {
            return value;
        }
    }

    return errorMessage;
};

export async function resetPassword(
    currentState: { message: string },
    formData: FormData,
) {
    const supabase = createClient();
    const passwordData = {
        password: formData.get("password") as string,
        confirm_password: formData.get("confirm_password") as string,
        code: formData.get("code") as string,
    };
    if (passwordData.password !== passwordData.confirm_password) {
        return { message: translateAuthError("Passwords do not match") };
    }

    const { data } = await supabase.auth.exchangeCodeForSession(
        passwordData.code,
    );

    let { error } = await supabase.auth.updateUser({
        password: passwordData.password,
    });
    if (error) {
        return { message: translateAuthError(error.message) };
    }
    redirect(`/passwort-vergessen/reset/success`);
}

export async function forgotPassword(
    currentState: { message: string },
    formData: FormData,
) {
    const supabase = createClient();
    const email = formData.get("email") as string;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${PUBLIC_URL}/passwort-vergessen/reset`,
    });

    if (error) {
        return { message: translateAuthError(error.message) };
    }
    redirect(`/passwort-vergessen/success`);
}

export async function signup(
    currentState: { message: string },
    formData: FormData,
) {
    const supabase = createServiceRoleClient();

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        name: formData.get("name") as string,
    };

    // Check if user exists in our database first
    const existingDBUser = await db.select().from(usersTable).where(
        eq(usersTable.email, data.email),
    );

    if (existingDBUser.length > 0) {
        const { data: { user } } = await supabase.auth.admin.getUserById(
            existingDBUser[0].id,
        );

        if (user && !user.email_confirmed_at) {
            const { error } = await supabase.auth.resend({
                type: "signup",
                email: user.email!,
            });

            if (error) {
                if (error.code === "over_email_send_rate_limit") {
                    return {
                        message:
                            "E-Mail-Versandlimit erreicht. Bitte warten Sie einen Moment.",
                    };
                }
            }

            return {
                message:
                    "Wir haben Ihnen eine neue Bestätigungs-E-Mail gesendet.",
            };
        }
        return {
            message: translateAuthError(
                "An account with this email already exists. Please login instead.",
            ),
        };
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
        {
            email: data.email,
            password: data.password,
            options: {
                emailRedirectTo: `${PUBLIC_URL}/auth/callback`,
                data: {
                    email_confirm: process.env.NODE_ENV !== "production",
                    full_name: data.name,
                },
            },
        },
    );

    if (!signUpData?.user) {
        return { message: translateAuthError("Failed to create user") };
    }

    try {
        // create Stripe Customer Record using signup response data
        const stripeID = await createStripeCustomer(
            signUpData.user.id,
            signUpData.user.email!,
            data.name,
        );

        // Create record in DB
        await db.insert(usersTable).values({
            id: signUpData.user.id,
            name: data.name,
            email: signUpData.user.email!,
            stripe_id: stripeID,
        });
    } catch (err) {
        console.error(
            "Error in signup:",
            err instanceof Error ? err.message : "Unknown error",
        );
        return { message: translateAuthError("Failed to setup user account") };
    }

    revalidatePath("/", "layout");
    redirect(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
}

export async function loginUser(
    currentState: { message: string },
    formData: FormData,
) {
    const supabase = createClient();

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
        return { message: translateAuthError(error.message) };
    }

    await syncStripeSubscription(data.email);

    revalidatePath("/", "layout");
    redirect("/dashboard");
}

export async function logout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    redirect("/login");
}

export async function signInWithGoogle() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${PUBLIC_URL}/auth/callback`,
            queryParams: {
                access_type: "offline",
                prompt: "select_account",
            },
        },
    });

    if (data.url) {
        redirect(data.url); // use the redirect API for your server framework
    }
}

export async function signInWithGithub() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
            redirectTo: `${PUBLIC_URL}/auth/callback`,
        },
    });

    if (data.url) {
        redirect(data.url); // use the redirect API for your server framework
    }
}

export async function deleteUserAction() {
    const supabase = createClient();

    // 1. Get current user
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
        console.error("No user found or error:", userError);
        return;
    }
    const userPlan = await getStripePlanOfUserAction();

    // 2. Check if user has a plan (not "none")
    const userRecord = await db.select().from(usersTable).where(
        eq(usersTable.id, user.id),
    );
    const isPlanActive = !userRecord[0]?.isCanceled;

    if (userPlan && isPlanActive) {
        console.error(
            "User does have an active plan. Cannot delete account.",
        );

        throw new Error(
            translateAuthError(
                "Please cancel your subscription first, before deleting your account.",
            ),
        );
    }

    const serviceRoleClient = createServiceRoleClient();
    // Example for your users table
    await supabase.from("users_table").delete().eq("id", user.id);

    // 3. Delete the user from Supabase Auth (requires service role on server)
    const { data, error: deleteError } = await serviceRoleClient
        .auth.admin
        .deleteUser(
            user.id,
            false,
        );

    const { success, error } = await deleteStripeCustomer(
        userRecord[0].stripe_id,
    );

    !success ? console.log(error) : "";

    if (deleteError) {
        console.error("Error deleting user from Auth:", deleteError);
    } else {
        console.log("User and all related data deleted.");
        redirect("/login");
    }
}
