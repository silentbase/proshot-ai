import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Suspense } from "react";
import { ImagesProvider } from "@/contexts/ImagesContext";
import CreditsStatus from "@/components/dashboard/CreditsStatus";
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
