import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { CircleCheckBig } from "lucide-react"
import { redirect } from 'next/navigation'
import Script from 'next/script'

export default async function SubscribeSuccess({
    searchParams,
}: {
    searchParams: { session_id?: string }
}) {
    // Redirect if no session_id (direct access without checkout)
    if (!searchParams.session_id) {
        redirect('/dashboard')
    }

    return (
        <>
        <div className="flex items-center justify-center bg-muted min-h-[90vh]">
            <Card className="w-[350px] mx-auto">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold"> <CircleCheckBig className="text-green-500 inline relative bottom-[1px]" /> Erfolgreich</CardTitle>
                    <CardDescription>Vielen Dank für Ihr Abonnement!</CardDescription>
                </CardHeader>

                <CardFooter className="flex-col text-center">
                    <Button className="w-full text-sm " >
                        <Link href="/dashboard">
                            Zum Dashboard
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
        </>
    )
}