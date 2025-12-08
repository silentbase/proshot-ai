import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Metadata } from 'next'

import Link from 'next/link'
import Image from 'next/image'

import ProviderSigninBlock from '@/components/ProviderSigninBlock'
import LoginForm from "@/components/LoginForm"

export const metadata: Metadata = {
    title: 'Anmelden',
    description: 'Melden Sie sich bei Ihrem ProShot AI Konto an, um kreative Werbeanzeigen zu erstellen.',
    robots: {
        index: true,
        follow: true,
    },
}

export default function Login() {
    return (
        <div className="flex items-center justify-center bg-muted min-h-screen">
            <Card className="w-[350px] mx-auto">
                <CardHeader className="space-y-1 text-center">


                    <CardTitle className="text-2xl font-bold">Anmelden</CardTitle>
                    <CardDescription>Wählen Sie Ihre bevorzugte Anmeldemethode</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <LoginForm />
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Oder fortfahren mit</span>
                        </div>
                    </div>
                    <ProviderSigninBlock />
                </CardContent>
                <CardFooter className="flex-col text-center">
                    <Link className="w-full text-sm text-muted-foreground " href="/passwort-vergessen">
                        Passwort vergessen?
                    </Link>
                    <Link className="w-full text-sm text-muted-foreground" href="/signup">
                        Noch kein Konto? Registrieren
                    </Link>
                </CardFooter>
            </Card>
        </div >

    )
}