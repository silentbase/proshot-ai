import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { createClient } from '@/utils/supabase/server'
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Suspense } from "react";
import { AppProvider } from "../../contexts/AppContext";
import { ImagesProvider } from "@/contexts/ImagesContext";
import { GenerationProvider } from '@/contexts/GenerationContext';
import DashboardHeaderTailwind from "@/components/dashboard/DashboardHeaderTailwind";
import { Container } from "@/components/layout/Container";
import CreditPurchaseModal from "@/components/dashboard/CreditPurchaseModal";
import CreditsStatus from "@/components/dashboard/CreditsStatus";
import { getStripePlanAction } from "@/utils/stripe/actions";
import Loading from "./loading";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SAAS Starter Kit",
    description: "SAAS Starter Kit with Stripe, Supabase, Postgres",
};


export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Check if user has plan selected. If not redirect to subscibe
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // check user plan in db
    //const plan = await getStripePlanAction()
    /*const checkUserInDB = await db.select().from(usersTable).where(eq(usersTable.email, user!.email!))
    if (checkUserInDB[0].plan === "none") {
        console.log("User has no plan selected")
        return redirect('/subscribe')
    }*/

    return (
        <Suspense fallback={<Loading />}>
            <ImagesProvider>

                <div className="min-h-screen flex flex-col">
                    {/* Header */}


                    {/* Horizontal Sidebar for Mobile */}
                    <div className="md:hidden w-full">
                        <DashboardSidebar className="horizontal" />
                    </div>

                    <div className="flex flex-1">
                        {/* Vertical Sidebar for Desktop */}
                        <div className="hidden md:flex flex-col gap-4 container-padding">
                            <DashboardSidebar className="vertical" />
                            <CreditsStatus></CreditsStatus>

                        </div>

                        {/* Main Content */}
                        <main className="flex-1">
                            {children}
                        </main>
                    </div>
                </div>

            </ImagesProvider>
        </Suspense>
    );
}
