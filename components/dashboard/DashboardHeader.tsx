import { Menu, Search } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from 'next/image'

import { Badge } from "@/components/ui/badge"
import { getStripePlan, getUserName } from "@/utils/stripe/api"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import NextImage from 'next/image';
import { User } from "@supabase/supabase-js"
import DashboardHeaderProfileDropdown from "./DashboardHeaderProfileDropdown"

export default async function DashboardHeader({ authUser }: { authUser: User }) {
    //const supabase = createClient()
    //const { data: { user }, error } = await supabase.auth.getUser()
    const stripePlan = getStripePlan(authUser!.email!)
    const name = getUserName(authUser!.email!)

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container container_padding flex h-14 max-w-screen-2xl items-center">
                <div className="mr-4 hidden md:flex">
                    <Link className="mr-2 flex items-center space-x-2" href="">
                        <NextImage src="/logo.png" alt="logo" width={25} height={25} />
                    </Link>
                    <Suspense fallback={<Badge variant="outline" className="mr-2"><Skeleton className="w-[50px] h-[20px] rounded-full" /></Badge>}>
                        <Badge variant="outline" className="mr-2">{name}</Badge>
                    </Suspense>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link className="transition-colors hover:text-foreground/80 text-foreground" href="/" >
                            Startseite
                        </Link>
                        <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="#">
                            Projekte
                        </Link>
                        <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="#">
                            Aufgaben
                        </Link>
                        <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="#">
                            Berichte
                        </Link>
                        <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="#">
                            Preise
                        </Link>
                        <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/dashboard/gallerie" >
                            Galerie
                        </Link>
                        <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/dashboard/settings" >
                            Einstellungen
                        </Link>
                    </nav>
                </div>
                <Button variant="outline" size="icon" className="mr-2 md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <form>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Suchen..."
                                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                                />
                            </div>
                        </form>
                    </div>
                    <DashboardHeaderProfileDropdown />
                </div>
            </div>
        </header>
    )
}