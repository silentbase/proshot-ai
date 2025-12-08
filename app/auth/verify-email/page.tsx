'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export default function VerifyEmailPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const email = searchParams.get('email') || ''
    const [isResending, setIsResending] = useState(false)
    const [cooldown, setCooldown] = useState(0)
    const [isChecking, setIsChecking] = useState(true)
    const [rateLimitError, setRateLimitError] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            // Redirect if no email parameter
            if (!email) {
                router.push('/login')
                return
            }

            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            // If user is authenticated and email is confirmed, redirect to dashboard
            if (user && user.email_confirmed_at) {
                router.push('/dashboard')
                return
            }

            setIsChecking(false)
        }

        checkAuth()
    }, [email, router])

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [cooldown])

    const handleResendEmail = async () => {
        if (!email) {
            toast.error('E-Mail-Adresse nicht gefunden')
            return
        }

        setIsResending(true)
        setRateLimitError(false)
        const supabase = createClient()

        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        })
        error ? console.log("ERROR: " + error?.code) : ""

        setIsResending(false)

        if (error) {
            if (error.code === 'over_email_send_rate_limit') {
                setRateLimitError(true)
                setCooldown(60)
            } else {
                toast.error('Fehler beim Versenden der E-Mail. Bitte versuchen Sie es später erneut.')
            }
        } else {
            toast.success('Bestätigungs-E-Mail wurde erneut gesendet!')
            setCooldown(60)
        }
    }

    if (isChecking) {
        return (
            <div className="container mx-auto px-4 py-16 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-2xl">
            <div className="flex flex-col items-center text-center space-y-6">
                <div className="rounded-full bg-primary/10 p-4">
                    <Mail className="h-12 w-12 text-primary" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">E-Mail bestätigen</h1>
                    <p className="text-lg text-muted-foreground">
                        Vielen Dank für Ihre Registrierung!
                    </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 space-y-4 w-full max-w-md">
                    <p className="text-sm">
                        Wir haben eine Bestätigungs-E-Mail an
                    </p>
                    <p className="font-semibold text-primary break-all">
                        {email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        gesendet. Bitte klicken Sie auf den Link in der E-Mail, um Ihr Konto zu aktivieren.
                    </p>
                </div>

                <div className="space-y-4  w-full max-w-md">

                    <Button
                        onClick={handleResendEmail}
                        disabled={isResending || cooldown > 0}
                        variant="outline"
                        className="w-full"
                    >
                        {isResending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Wird gesendet...
                            </>
                        ) : cooldown > 0 ? (
                            rateLimitError ? 'E-Mail erneut senden' : `E-Mail erneut senden (${cooldown}s)`
                        ) : (
                            'E-Mail erneut senden'
                        )}
                    </Button>

                    {rateLimitError && (
                        <p className="text-xs text-red-500 mt-2">
                            Bitte warten Sie {cooldown} Sekunden, bevor Sie es erneut versuchen.
                        </p>
                    )}

                    <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-3">
                            Haben Sie bereits ein Konto?
                        </p>
                        <Button asChild variant="secondary" className="w-full">
                            <Link href="/login">
                                Zur Anmeldung
                            </Link>
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground pt-2">
                        Bei Problemen kontaktieren Sie uns unter{' '}
                        <a
                            href="mailto:support@proshotai.app"
                            className="text-primary hover:underline"
                        >
                            support@proshotai.app
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
