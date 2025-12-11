
import { createClient } from '@/utils/supabase/server'
import { createStripeCustomerSession, generateStripeBillingPortalLink } from "@/utils/stripe/api";
import { db } from "@/utils/db/db";
import { usersTable } from "@/utils/db/schema";
import NextImage from 'next/image';
import { eq } from "drizzle-orm";
import CustomPricingTable from "@/components/CustomPricingTable";
import CustomPricingTableTailwind from "@/components/CustomPricingTableTailWind";

export default async function Subscribe() {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // if user already has a plan, redirect to customer portal
    const checkUserInDB = await db.select().from(usersTable).where(eq(usersTable.email, user!.email!))

    /*if (checkUserInDB[0].plan != 'none') {
        var billingPortalLink = await generateStripeBillingPortalLink(user?.email!, BillingPortalFlowType.SubUpdate);
        console.log(checkUserInDB)
        redirect(billingPortalLink)
    }*/
    //----------------------------------------------------------

    const customerSessionSecret = await createStripeCustomerSession(user!.email!)

    return (
        <div className="flex flex-col min-h-screen bg-secondary">
            <header className="px-4 lg:px-6 h-16 flex items-center  bg-white border-b fixed border-b-slate-200 w-full">
                <NextImage src="/logo.png" alt="logo" width={50} height={50} />
                <span className="sr-only">Acme Inc</span>
            </header>

            <section className="w-full py-10 md:py-20 lg:py-32 bg-muted">
                <div className="container px-4 md:px-6">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-4">Pricing Plans</h2>
                    <p className="text-muted-foreground text-center mb-8 md:text-xl">Choose the perfect plan for your needs</p>
                    <CustomPricingTable></CustomPricingTable>
                    <CustomPricingTableTailwind></CustomPricingTableTailwind>
                </div>
            </section>
        </div>
    )
}