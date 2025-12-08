'use client'

import { useFormStatus } from "react-dom"
import { deleteUserAction } from "../auth/actions"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { ConfirmModal } from "@/components/ConfirmModal"

export default function DeleteAccountButton() {
    const { pending } = useFormStatus();

    return (
        <div>
            <ConfirmModal onConfirm={deleteUserAction} trigger={


                <Button
                    variant="destructive"
                    type="submit"
                    className="btn btn-danger"
                    disabled={pending}
                >
                    {pending ? <Loader2 className="h-8 w-8 animate-spin" /> : "Konto löschen"}
                </Button>

            } message={"Möchten Sie dieses Konto wirklich löschen?"}>

            </ConfirmModal>

        </div>
    )
}