// app/dashboard/DashboardContent.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardContent({ children }: { children: React.ReactNode }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()


    // Optional: check plan
    /* const checkUserInDB = await db.select().from(usersTable).where(eq(usersTable.email, user!.email!))
    if (checkUserInDB[0].plan === "none") redirect('/subscribe') */

    return <>{children}</>
}
