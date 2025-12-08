'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

interface MobileMenuButtonProps {
    activePathname?: string;
}

export default function MobileMenuButton({ activePathname = '' }: MobileMenuButtonProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    // Use either passed pathname from server or client pathname
    const currentPath = pathname || activePathname

    // Close menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [pathname])

    // Close menu when clicking outside
    useEffect(() => {
        if (!isMobileMenuOpen) return

        const handleClick = (e: MouseEvent) => {
            setIsMobileMenuOpen(false)
        }

        document.addEventListener('click', handleClick, { once: true })
        return () => document.removeEventListener('click', handleClick)
    }, [isMobileMenuOpen])

    // Helper function to check if a route is active
    const isActive = (path: string) => {
        return currentPath === path || currentPath.startsWith(`${path}/`)
    }

    return (
        <>
            <div


                className="md:hidden text-foreground hover:text-foreground/70 cursor-pointer justify-start"
                onClick={(e) => {
                    e.stopPropagation()
                    setIsMobileMenuOpen(!isMobileMenuOpen)
                }}
            >
                {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                ) : (
                    <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle menu</span>
            </div>

            {/* Mobile navigation menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 right-0 z-40 border-t md:hidden animate-in slide-in-from-top duration-300 bg-background">
                    <nav className="container mx-auto py-4">
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/dashboard"
                                    className={cn(
                                        "flex w-full px-4 py-2 rounded-md hover:bg-muted",
                                        isActive('/dashboard') && "bg-primary/10 text-primary font-medium"
                                    )}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/dashboard/gallerie"
                                    className={cn(
                                        "flex w-full px-4 py-2 rounded-md hover:bg-muted",
                                        isActive('/dashboard/gallerie') && "bg-primary/10 text-primary font-medium"
                                    )}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Gallery
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/subscribe"
                                    className={cn(
                                        "flex w-full px-4 py-2 rounded-md hover:bg-muted",
                                        isActive('/subscribe') && "bg-primary/10 text-primary font-medium"
                                    )}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Pricing
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </>
    )
}