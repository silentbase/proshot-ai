'use client'

import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Info } from 'lucide-react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthErrorPage() {
    const router = useRouter()

    useEffect(() => {
        // Mark that user has seen this page
        const hasSeenErrorPage = sessionStorage.getItem('hasSeenAuthError')

        if (hasSeenErrorPage) {
            // Redirect to login if they've already seen it
            router.push('/login')
            return
        }

        // Mark as seen
        sessionStorage.setItem('hasSeenAuthError', 'true')
    }, [router])

    return (
        <div className="container mx-auto px-4 py-16 max-w-2xl">
            <div className="flex flex-col items-center text-center space-y-6">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-4">
                    <Info className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Anmeldung erforderlich</h1>
                </div>

                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-6 space-y-3 w-full max-w-md">
                    <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        <h2 className="font-semibold">Gute Nachrichten!</h2>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-400">
                        Wenn Sie auf den Bestätigungslink geklickt haben, wurde Ihre E-Mail bereits verifiziert.
                    </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 space-y-4 w-full max-w-md">
                    <h2 className="font-semibold">Warum sehe ich diese Seite?</h2>
                    <p className="text-sm text-muted-foreground text-left">
                        Der Bestätigungslink wurde möglicherweise in einem anderen Browser oder Tab geöffnet.
                        Aus Sicherheitsgründen ist Ihre Sitzung nur in dem Browser gültig, in dem Sie den Link geöffnet haben.
                    </p>
                </div>

                <div className="space-y-4 pt-4">
                    <Button asChild variant="default" size="lg" className="w-full max-w-xs">
                        <Link href="/login">
                            Jetzt anmelden
                        </Link>
                    </Button>

                    <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                            Funktioniert die Anmeldung nicht?{' '}
                            <Link href="/passwort-vergessen" className="text-primary hover:underline">
                                Passwort zurücksetzen
                            </Link>
                        </p>
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
