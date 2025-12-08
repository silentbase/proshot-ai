import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import SignupForm from "@/components/SignupForm"
import ProviderSigninBlock from "@/components/ProviderSigninBlock"

export const metadata: Metadata = {
    title: 'Registrieren',
    description: 'Erstellen Sie Ihr kostenloses ProShot AI Konto und starten Sie mit der KI-gestützten Bildgenerierung.',
    robots: {
        index: true,
        follow: true,
    },
}

export default function Signup() {
    return (
        <div className="flex items-center justify-center bg-muted min-h-screen">

            <Card className="w-[370px] mx-auto">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Registrieren</CardTitle>
                    <CardDescription>Erstellen Sie jetzt Ihr Konto!</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <SignupForm />
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
                    <Link className="w-full text-sm text-muted-foreground" href="/login">
                        Bereits ein Konto? Anmelden
                    </Link>
                </CardFooter>
            </Card>
        </div >

    )
}