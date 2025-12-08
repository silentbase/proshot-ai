
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPasswordSuccess() {
    return (
        <div className="flex items-center justify-center bg-muted min-h-screen" >
            <Card className="w-[350px] mx-auto">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Ihre Anfrage zum Zurücksetzen des Passworts wurde bearbeitet. Überprüfen Sie Ihre E-Mails</CardTitle>
                    <CardDescription>Zurück zur <Link href="/login">Anmeldung</Link></CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}