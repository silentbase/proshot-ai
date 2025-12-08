'use client'

import Link from 'next/link'
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ResetPasswordSuccess() {
    const router = useRouter()
    const [canShow, setCanShow] = useState(false)

    useEffect(() => {
        const hasSeenPage = sessionStorage.getItem('hasSeenResetSuccess')
        
        if (hasSeenPage) {
            router.push('/login')
            return
        }
        
        sessionStorage.setItem('hasSeenResetSuccess', 'true')
        setCanShow(true)
    }, [router])

    if (!canShow) {
        return null
    }

    return (
        <div className="flex items-center justify-center bg-muted min-h-screen" >
            <Card className="w-[350px] mx-auto">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Ihr Passwort wurde erfolgreich zurückgesetzt!</CardTitle>
                    <CardDescription>Melden Sie sich <Link href="/login" className='text-primary'>hier</Link> an</CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}