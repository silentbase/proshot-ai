
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ForgotPasswordForm from '@/components/ForgotPasswordForm'
export default function ForgotPassword() {
    return (
        <div className="flex items-center justify-center bg-muted min-h-screen" >
            <Card className="w-[350px] mx-auto">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Passwort vergessen?</CardTitle>
                    <CardDescription>Geben Sie Ihre E-Mail-Adresse ein</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <ForgotPasswordForm />
                </CardContent>
                <CardFooter className="flex-col text-center">
                    <Link className="w-full text-sm text-muted-foreground " href="/login">
                        Zurück zur Anmeldung
                    </Link>
                    <Link className="w-full text-sm text-muted-foreground" href="/signup">
                        Noch kein Konto? Registrieren
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}