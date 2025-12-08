'use client'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ResetPasswordForm from '@/components/ResetPasswordForm'
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function ResetPassword() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [canShow, setCanShow] = useState(false)

    useEffect(() => {
        // Check if there's a code parameter (from email link)
        const code = searchParams.get('code')
        
        if (!code) {
            // No code means they didn't come from email link
            router.push('/passwort-vergessen')
            return
        }
        
        setCanShow(true)
    }, [router, searchParams])

    if (!canShow) {
        return null
    }
    return (
        <div className="flex items-center justify-center bg-muted min-h-screen" >
            <Card className="w-[350px] mx-auto">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Enter your new Password</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <ResetPasswordForm />
                </CardContent>
                <CardFooter className="flex-col text-center">
                </CardFooter>
            </Card>
        </div>
    )
}