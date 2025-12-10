'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FolderOpen, Images, Settings, ChevronDown, ChevronUp, Square, RectangleHorizontal, RectangleVertical, Icon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useGenerationContext } from "@/contexts/GenerationContext"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const navigationItems = [
    { title: "Startseite", url: "/dashboard", icon: Home },
    { title: "Galerie", url: "/dashboard/gallerie", icon: FolderOpen }
]

interface SidebarProps {
    className?: string;
}

export function DashboardSidebar({ className }: SidebarProps) {

    const aspectOptions = [
        { ratio: "1:1", label: "\n Instagram / Facebook Feed" },
        { ratio: "4:3", label: "\n Website / E-commerce" },
        { ratio: "4:5", label: 'Instagram / Facebook Portrait Ad' },
        { ratio: "9:16", label: "TikTok / Reels" },
        { ratio: "16:9", label: "Landscape" },
        //{ ratio: "21:9", label: "Website Header" },
    ] as const;

    const pathname = usePathname()
    const isHorizontal = className?.includes("horizontal");
    const { settings, setSettings } = useGenerationContext();
    const [isSettingsOpen, setIsSettingsOpen] = useState(true); // Default to open
    const settingsButtonRef = useRef<HTMLButtonElement>(null);
    const settingsMenuRef = useRef<HTMLDivElement>(null);

    // Close settings dropdown when clicking outside in mobile view
    useEffect(() => {
        if (isHorizontal && isSettingsOpen) {
            const handleClickOutside = (e: MouseEvent) => {
                if (
                    settingsMenuRef.current &&
                    settingsButtonRef.current &&
                    !settingsMenuRef.current.contains(e.target as Node) &&
                    !settingsButtonRef.current.contains(e.target as Node)
                ) {
                    setIsSettingsOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isHorizontal, isSettingsOpen]);

    // Close settings when changing route
    useEffect(() => {
        if (isHorizontal) {
            setIsSettingsOpen(false);
        }
    }, [pathname, isHorizontal]);

    const isActive = (path: string) => {
        if (path === "/dashboard") {
            return pathname === path
        }
        return pathname.startsWith(path)
    }

    return (
        <div className="sideNav" >
            <nav className={cn(
                "border-border bg-card/30",
                isHorizontal
                    ? "w-full px-4 py-3"
                    : "w-64"
            )}>
                <div>
                    <ul className={cn(
                        "bg-background",
                        isHorizontal
                            ? "flex items-start space-x-2"
                            : "flex flex-col space-y-3 "
                    )}>
                        {/* Regular navigation items */}
                        {navigationItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <li key={item.title} className="w-full bg-background">
                                    <Link
                                        prefetch={true}
                                        href={item.url}
                                        className={cn(
                                            "bg-muted",
                                            isHorizontal
                                                ? "flex flex-col items-center p-2 rounded-md"
                                                : "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            isActive(item.url) &&
                                            "bg-primary/10 text-primary dark:bg-primary/80 dark:text-accent  font-medium"
                                        )}
                                    >
                                        <Icon size={isHorizontal ? 16 : 18} />
                                        <span className={isHorizontal ? "text-xs mt-1" : "text-sm"}>
                                            {item.title}
                                        </span>
                                    </Link>
                                </li>
                            )
                        })}

                        {/* Settings with collapsible content */}
                        <li key="settings" className="w-full relative">
                            <div className={cn(
                                "rounded-lg overflow-hidden transition-all"
                            )}>
                                {/* Settings header/toggle */}
                                <Button
                                    ref={settingsButtonRef}
                                    variant="ghost"
                                    className={cn(
                                        isHorizontal
                                            ? "flex flex-col items-center p-2 rounded-md w-full h-auto"
                                            : "flex items-center justify-between w-full gap-3 px-3 py-2 rounded-lg transition-colors",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        (!isHorizontal && isSettingsOpen) && "font-medium",
                                        (isHorizontal && isSettingsOpen) && "bg-primary/10 text-primary font-medium"
                                    )}
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                >
                                    <div className={cn(
                                        isHorizontal
                                            ? "flex flex-col items-center"
                                            : "flex items-center gap-3"
                                    )}>
                                        <Settings size={isHorizontal ? 16 : 18} />
                                        <span className={isHorizontal ? "text-xs mt-1" : "text-sm"}>
                                            Einstellungen
                                        </span>
                                    </div>
                                    {!isHorizontal && (
                                        isSettingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>

                                {/* Persistent dropdown content */}
                                {isSettingsOpen && (
                                    <>
                                        {/* Mobile overlay */}
                                        {isHorizontal && (
                                            <div
                                                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                                                onClick={() => setIsSettingsOpen(false)}
                                            />
                                        )}

                                        <div
                                            ref={settingsMenuRef}
                                            className={cn(
                                                "bg-background border-t border-border p-3 space-y-3",
                                                isHorizontal
                                                    ? "fixed top-[calc(var(--header-height)+3.5rem)] left-4 right-4 z-50 rounded-lg shadow-lg border md:left-auto md:right-4 md:w-80"
                                                    : ""
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-medium">Generierungs-Einstellungen</div>
                                                {isHorizontal && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 p-0 rounded-full"
                                                        onClick={() => setIsSettingsOpen(false)}
                                                    >
                                                        <ChevronUp className="h-4 w-4" />
                                                        <span className="sr-only">Close</span>
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Number of Images */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm">Anzahl der Bilder</label>
                                                    <span className="text-xs text-muted-foreground">{settings.numberOfImages}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {[1, 2, 4].map((num) => (
                                                        <Button
                                                            key={num}
                                                            size="sm"
                                                            variant={settings.numberOfImages === num ? "default" : "outline"}
                                                            className="flex-1 h-7 text-xs"
                                                            onClick={() => setSettings(prev => ({ ...prev, numberOfImages: num }))}
                                                        >
                                                            {num}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Output Format */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm">Ausgabeformat</label>
                                                    <span className="text-xs text-muted-foreground">{settings.outputFormat.toUpperCase()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {(['webp', 'png', 'jpeg'] as const).map((format) => (
                                                        <Button
                                                            key={format}
                                                            size="sm"
                                                            variant={settings.outputFormat === format ? "default" : "outline"}
                                                            className="flex-1 h-7 text-xs"
                                                            onClick={() => setSettings(prev => ({ ...prev, outputFormat: format }))}
                                                        >
                                                            {format.toUpperCase()}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Aspect Ratio */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm">Bildformat</label>
                                                    <span className="text-xs text-muted-foreground">{settings.aspectRatio}</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {aspectOptions.map(({ ratio, label }) => (

                                                        <Button
                                                            key={ratio}
                                                            size="sm"
                                                            variant={settings.aspectRatio === ratio ? "default" : "outline"}
                                                            className={` flex-1 h-7 text-xs peer:bg-primary group gap-2 transition-all ${settings.aspectRatio === ratio ? "border-primary" : "border-muted"
                                                                }`}
                                                            onClick={() =>
                                                                setSettings((prev) => ({
                                                                    ...prev,
                                                                    aspectRatio: ratio,
                                                                }))
                                                            }
                                                        >
                                                            {/* Mini ratio preview box */}

                                                            {ratio}

                                                            {/* Hover text */}
                                                            <span className="absolute bottom-[-1.5rem] whitespace-pre-line text-[11px] text-foreground hidden group-hover:block transition-opacity">
                                                                {label}
                                                            </span>
                                                        </Button>


                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    )
}
