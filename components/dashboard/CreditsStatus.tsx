

import getCreditAmount from '@/utils/helpers/getCreditAmount'
import { getStripePlanAction, getUserCreditsAction } from '@/utils/stripe/actions'
import CreditsStatusButton from './CreditsStatusButton'
import { createClient } from '@/utils/supabase/server'

export default async function CreditsStatus() { //TODO: no credits status if not signed in.. also header login instead of profile icon

    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()

    var loading = true
    const plan = await getStripePlanAction()
    const totalCredits = getCreditAmount(plan?.name!)
    const currentCredits = await getUserCreditsAction();
    const isFreePlan = !plan
    var loading = false

    if (!data.user) {
        return <></>
    }

    {/* if (loading) {
        return (
            <div className="w-full h-4 rounded-full overflow-hidden border border-primary mt-7">
                <div className="h-full bg-primary/40 animate-pulse" style={{ width: '100%' }} />
            </div>
        )
    }*/}

    const used = Math.max(0, totalCredits! - currentCredits)
    var percentUsed = (totalCredits! > 0 ? (used / totalCredits!) * 100 : 0)

    percentUsed == 0 ? percentUsed = percentUsed : percentUsed = percentUsed.toFixed(2) as unknown as number

    const statusContent = (
        <>
            <span className="text-primary font-semibold tracking-tight flex items-center gap-1">
                <span className="text-base">{currentCredits}</span>
                <span className="text-foreground text-xs">/ {totalCredits} Credits übrig</span>
            </span>
            <div className="w-full h-4 bg-muted rounded-full border dark:border-foreground/0 border-foreground/40 overflow-hidden relative py-2 ">
                <div
                    className="h-full absolute top-0 bg-primary transition-all rounded-xl"
                    style={{ width: `${percentUsed}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[0.75rem] font-medium dark:text-primary-foreground/80 select-none">
                    {`${percentUsed}%`}
                </span>
            </div>
            {plan && <div className='py-2 relative'>
                <span className="text-xs absolute right-0">{plan?.name + " Plan"} </span>

            </div>}

        </>
    )

    return (
        <div className="space-y-3 w-full max-w-xs p-3">
            <div className={isFreePlan && currentCredits === 0 ? "opacity-40 pointer-events-none select-none" : ""}>
                {statusContent}
            </div>
            <div className="flex justify-end items-center text-xs">


                {((isFreePlan || currentCredits === 0)) && (
                    <CreditsStatusButton />
                )}
            </div>
        </div>
    )
}