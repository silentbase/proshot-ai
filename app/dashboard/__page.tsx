'use client'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/client'
import DashboardUI from '@/components/dashboard/DashboardUI'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'

export default function Dashboard() {

    const supabase = createClient()

    const [status, setStatus] = useState('loading')
    const [user, setUser] = useState<any>(null)


    useEffect(() => {
        const run = async () => {
            const { data: { user }, error } = await supabase.auth.getUser()

            if (user && !error) {
                setUser(user)
                setStatus('ready')
            } else {
                // redirect after brief pause
                redirect('/login')
            }
        }
        run()
    })

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="animate-spin h-10 w-10 rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
            </div>
        )
    }

    return (
        <div className="container">
            <main>
                <DashboardUI authUser={user} />
            </main>
        </div>
    )
}