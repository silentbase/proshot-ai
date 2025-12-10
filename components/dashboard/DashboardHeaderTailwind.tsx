import Link from "next/link"
import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'
import DashboardHeaderProfileDropdown from "./DashboardHeaderProfileDropdown"
import Image from "next/image"

export default async function DashboardHeaderTailwind() {
    // Get user data from server
    const cookieStore = cookies()
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Get current path from headers to determine active links
    const headersList = headers()
    const pathname = headersList.get('x-invoke-path') || ''

    // Helper function to check if a route is active
    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(`${path}/`)
    }

    // Prepare user data to pass to client components
    const userData = user ? {
        email: user.email,
        id: user.id
    } : null

    return (
        <header className="sticky top-0 container-left-padding container-right-padding max-md:px-4 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Mobile menu button as client component */}
                    {/* <MobileMenuButton
                        activePathname={pathname}
                    />*/}

                    <Link href="/dashboard" className="flex items-center gap-2 px-3 pl-0 py-2">
                        <Image src="/logo.png" alt="ProShot AI Logo" width={32} height={32} className="h-8 w-auto" priority />
                        <span className="font-bold text-lg">ProShot AI</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                {/*<nav className="hidden md:block">
                    <ul className="flex items-center gap-6">
                        <li>
                            <Link
                                href="/dashboard"
                                className={cn(
                                    "nav-link text-sm",
                                    isActive('/dashboard') && "active"
                                )}
                            >
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/dashboard/gallerie"
                                className={cn(
                                    "nav-link text-sm",
                                    isActive('/dashboard/gallerie') && "active"
                                )}
                            >
                                Gallerie
                            </Link>
                        </li>

                    </ul>
                </nav>*/}

                <div className="flex items-end">
                    {/* User profile dropdown as client component */}
                    <DashboardHeaderProfileDropdown />
                </div>
            </div>
        </header>
    )
}