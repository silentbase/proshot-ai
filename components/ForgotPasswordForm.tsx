
"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFormState, useFormStatus } from 'react-dom'
import { forgotPassword } from '@/app/auth/actions'
import { Loader2 } from "lucide-react"
export default function ForgotPasswordForm() {
    const initialState = {
        message: ''
    }
    const [formState, formAction] = useFormState(forgotPassword, initialState)
    function Submit() {
        // ✅ `pending` will be derived from the form that wraps the Submit component
        const { pending } = useFormStatus();

        return <Button className="w-full mt-4" type="submit" disabled={pending}>
            {pending ? <Loader2 className="h-8 w-8 animate-spin" /> : "Passwort zurücksetzen"}
        </Button>

    }
    return (<>
        <form action={formAction}>
            <div className="grid gap-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@beispiel.de"
                    name="email"
                    required
                />
            </div>
            <Submit></Submit>
            {formState?.message && (
                <p className="text-sm text-red-500 text-center py-2">{formState.message}</p>
            )}
        </form >
    </>)
}