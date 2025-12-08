'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'

interface ConfirmDialogProps {
    message: string
    onConfirm: () => Promise<void> | void
    trigger: React.ReactNode
}

export function ConfirmModal({ message, onConfirm, trigger }: ConfirmDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleConfirm = async () => {
        setLoading(true)
        setError(null)
        try {
            await onConfirm()
            setOpen(false)
        } catch (err: any) {
            setError(err?.message || 'Etwas ist schief gelaufen')
        } finally {
            setLoading(false)
        }
    }
    return (
        <>
            <div onClick={() => setOpen(true)}>{trigger}</div>

            {open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-background p-6 shadow-lg rounded-lg w-full max-w-sm">
                        <h2 className="text-lg font-semibold mb-4">{message}</h2>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant={'destructive'}
                                onClick={handleConfirm}
                                className="min-w-28"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Bestätigen"}
                            </Button>

                            <Button
                                variant={'secondary'}
                                onClick={() => {
                                    setOpen(false)
                                    setError(null)
                                }}
                                className="px-4 py-2 border rounded min-w-28"
                            >
                                Abbrechen
                            </Button>
                        </div>
                        {error && <p className="text-sm text-red-600 mt-6">{error}</p>}
                    </div>
                </div>
            )}
        </>
    )
}
