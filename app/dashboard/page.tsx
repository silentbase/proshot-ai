import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { createClient } from '@/utils/supabase/server'
import DashboardUI from '@/components/dashboard/DashboardUI'

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Erstellen Sie kreative Werbeanzeigen mit KI. Verwalten Sie Ihre generierten Bilder und Credits.',
    robots: {
        index: false,
        follow: false,
    },
}

export default async function Dashboard() {
    const supabase = createClient()


    const { data, error } = await supabase.auth.getUser()


    return (
        <div className="">
            <DashboardUI authUser={data.user} />
        </div>
    )
}