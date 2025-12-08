
"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFormState, useFormStatus } from 'react-dom'
import { resetPassword } from '@/app/auth/actions'
import { useSearchParams } from "next/navigation";
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

function GetCodeHiddenInput() {
    const searchParams = useSearchParams();
    return <Input type="hidden" name="code" value={searchParams.get('code')!} />
}

function Submit() {
    // ✅ `pending` will be derived from the form that wraps the Submit component
    const { pending } = useFormStatus();

    return <Button className="w-full mt-4" type="submit" disabled={pending}>
        {pending ? <Loader2 className="h-8 w-8 animate-spin" /> : "Passwort ändern"}
    </Button>

}

export default function ResetPasswordForm() {
    const initialState = {
        message: ''
    }
    const [formState, formAction] = useFormState(resetPassword, initialState)
    return (<>
        <form action={formAction}>
            <div className="grid gap-2">
                <Label htmlFor="email">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Enter New Password"
                    name="password"
                    required
                />
                <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Confirm Password"
                    name="confirm_password"
                    required
                />
                <Suspense>
                    <GetCodeHiddenInput />
                </Suspense>
            </div>
            <Submit />
            {formState?.message && (
                <p className="text-sm text-red-500 text-center py-2">{formState.message}</p>
            )}
        </form >
    </>)
}