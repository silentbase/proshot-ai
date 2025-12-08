import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, ReceiptText, User, Settings, HelpCircle, LogOut, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/auth/actions'
import { generateStripeBillingPortalLink } from "@/utils/stripe/api"
import { BillingPortalFlowType } from "@/utils/Enums"
import { getBillingPortalLink } from "@/utils/stripe/actions"

import { AvatarFallback, Avatar, AvatarImage } from "../ui/avatar"
import { usersTable } from "@/utils/db/schema"

export default async function DashboardHeaderProfileDropdown() {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    // If no user, show sign-in button
    if (!user) {
        return (
            <div className="flex gap-2">
                <Link href="/login">
                    <Button variant="default" size="sm">
                        Anmelden
                    </Button>
                </Link>
                <Link href="/signup">
                    <Button variant="secondary" size="sm">
                        Registrieren
                    </Button>
                </Link>
            </div>
        )
    }

    // Check if user exists before accessing email
    let billingPortalURL = ''
    if (user?.email) {
        const { url, error } = await getBillingPortalLink(BillingPortalFlowType.StandartFlow)
        error ? billingPortalURL = '' : billingPortalURL = url!
    }

    const avatar_url = (await supabase.from('users_table').select('avatar_url').eq('email', user?.email).single()).data?.avatar_url

    // Generate initials from email if available
    const initials = user?.email
        ? user.email.substring(0, 2).toUpperCase()
        : "AI"

    return (
        <nav className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-inherit hover:text-primary-foreground tips-icon">
                        <Info className="h-5 w-5" />
                        <span className="sr-only">Tipps</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Tipps für beste Ergebnisse</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="px-3 py-2 text-sm space-y-3">
                        <div className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Laden Sie ein klares Produktbild für beste Ergebnisse hoch</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Verwenden Sie optional Referenzbilder um den Stil zu bestimmen</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Seien Sie spezifisch in Ihren Beschreibungen</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Probieren Sie verschiedene Kombinationen für Abwechslung</span>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>

                    <button
                        className=" rounded-full border border-collapse border-transparent"
                    >
                        <Avatar>
                            <AvatarImage src={avatar_url} />
                            <AvatarFallback className="text-primary bg-primary-foreground">
                                <div className="font-medium">
                                    {/* <img src="https://github.com/shadcn.png"></img>*/}
                                    <p> {initials} </p>

                                </div>
                            </AvatarFallback>
                        </Avatar>
                    </button>

                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Mein Konto</DropdownMenuLabel>
                    <div className="px-2 py-1.5">
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <Link href="/konto" className="w-full" prefetch={true}>
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profil</span>
                        </DropdownMenuItem>
                    </Link>
                    {billingPortalURL ? <Link href={billingPortalURL} className="w-full">
                        <DropdownMenuItem>
                            <ReceiptText className="mr-2 h-4 w-4" />
                            <span>Abrechnung</span>
                        </DropdownMenuItem>
                    </Link> : ""}
                    <Link href="/help" className="w-full">
                        <DropdownMenuItem>
                            <HelpCircle className="mr-2 h-4 w-4" />
                            <span>Hilfe</span>
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <form action={logout} className="w-full">
                        <button
                            type="submit"
                            className="w-full flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none cursor-pointer"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Abmelden</span>
                        </button>
                    </form>
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    )
}