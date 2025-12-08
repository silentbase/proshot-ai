'use client'
import { useCreditsContext } from "@/contexts/CreditsContext";
import { Button } from "../ui/button";
import { Loader2, Rocket } from "lucide-react";
import { useState } from "react";

export default function CreditsStatusButton() {
    const { showBuyCreditsModal, setShowBuyCreditsModal } = useCreditsContext();
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Button
            variant="default"
            size="sm"
            className="transition px-3 py-1 flex items-center gap-1 bg-muted hover:bg-muted/50 text-foreground border border-primary shimmer-on-hover"
            onClick={() => setShowBuyCreditsModal(true)}
            aria-label="Go Pro"
        >

            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Upgrade Plan</span>
                </>
            ) : (
                <>
                    <Rocket className="h-4 w-4 mr-1" />
                    <span>Upgrade Plan</span>
                </>
            )}


        </Button>
    )
}