'use client'
import { Button } from "@/components/ui/button";
import { useCreditsContext } from "@/contexts/CreditsContext";
import { BillingPortalFlowType } from "@/utils/Enums";
import { getBillingPortalLink } from "@/utils/stripe/actions";
import { StripePlan } from "@/utils/stripe/api";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface AccountDataProps {
    user: User
    name: string
    plan: StripePlan
}
export default function EditPlanSection({ plan }: AccountDataProps) {

    const router = useRouter()
    const [cancelLoading, setCancelLoading] = useState(false)
    const [updateLoading, setUpdateLoading] = useState(false)

    const { showBuyCreditsModal, setShowBuyCreditsModal } = useCreditsContext();


    const handleCancelPlan = async () => {
        setCancelLoading(true)

        const { url, error } = await getBillingPortalLink(BillingPortalFlowType.SubCancel)
        if (error) {
            toast.error(error)
            setCancelLoading(false)
            return
        }
        setCancelLoading(false)
        router.push(url!)
    }
    return (

        <div>
            {plan?.name && !plan?.isCanceled ? (<div className="flex gap-2">
                <form onSubmit={async (e) => {
                    setUpdateLoading(true)
                    e.preventDefault()

                    setShowBuyCreditsModal(true)
                    // const { url, error } = await getBillingPortalLink(BillingPortalFlowType.SubUpdate)
                    setUpdateLoading(false)

                    /* if (error) {
                          toast.error(error)
                          return
                      }
  
                      router.push(url!)*/

                }} >
                    <Button variant={"outline"} className="min-w-28">
                        {updateLoading ? <Loader2 className="animate-spin" /> : "Plan aktualisieren"}

                    </Button>
                </form>

                <form onSubmit={(e) => {
                    e.preventDefault()
                    handleCancelPlan()
                }} >
                    <Button variant="secondary" type="submit" className="min-w-28">
                        {cancelLoading ? <Loader2 className="animate-spin" /> : "Plan kündigen"}
                    </Button>
                </form>

            </div>) :
                (<div className="flex gap-2">
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        setShowBuyCreditsModal(true)
                    }} >
                        <Button variant={'outline'} type="submit" className="btn btn-danger border-primary min-w-28">
                            Plan upgraden
                        </Button>
                    </form>

                </div>)}

        </div>

    )
}