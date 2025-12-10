import { getStripePlanAction, getUserCreditsAction } from "@/utils/stripe/actions";
import { redirect } from "next/navigation";
import DeleteAccountButton from "./DeleteAccountButton";

import EditProfileForm from "./EditProfileForm";
import EditPlanSection from "./EditPlanSection";
import { createClient } from "@/utils/supabase/server";
import getCreditAmount from "@/utils/helpers/getCreditAmount";

export default async function AccountPage() {
    
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login");
    }
  
    const plan = await getStripePlanAction()
    const totalCredits = getCreditAmount(plan?.name!)
    const currentCredits = await getUserCreditsAction();

    const { data: trackingRow, error: trackErr } = await supabase
        .from('users_table').select('name').eq('id', user.id).single()

    if (trackErr) console.error('fetchPlan error', trackErr)

    const name = trackingRow?.name

    return (

        <div className="max-w-xl mx-auto mt-12 px-4 h-[73vh]">
            <h1 className="text-3xl font-bold mb-8">Kontoeinstellungen</h1>

            <section className="mb-8">
                <EditProfileForm
                    user={user!} name={name} plan={plan!}
                />
            </section>

            <section className="mb-8">
                <div>
                    <div className="py-3">
                        <span className="font-medium">Aktueller Plan: </span>
                        <span className="text-primary font-semibold">
                            {plan?.name || "Kein Plan"}
                        </span>
                        {plan?.isCanceled ? (

                            <span className="">
                                {" (Gekündigt)"}
                            </span>

                        ) : null}
                         <span className="text-primary font-semibold tracking-tight flex items-center gap-1 md:hidden">
                            <span className="text-base">{currentCredits}</span>
                            <span className="text-foreground text-xs">/ {totalCredits} Credits</span>
                        </span>
                    </div>
                    
                    <EditPlanSection user={user!} name={name} plan={plan!} ></EditPlanSection>
                </div>
            </section>

            <section className="delete_account_section">
                <DeleteAccountButton />
            </section>
        </div>


    );
}