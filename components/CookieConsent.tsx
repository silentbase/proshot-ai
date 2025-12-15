'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useDynamicScripts } from '@/hooks/useDynamicScripts'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

const STORAGE_KEY = 'cookie-preferences'

type CookieCategory = 'essential' | 'analytics' | 'marketing'

interface CategoryInfo {
    label: string
    description: string
}

const CATEGORY_INFO: Record<CookieCategory, CategoryInfo> = {
    essential: {
        label: 'Erforderlich',
        description: 'Notwendig für Authentifizierung und Basisfunktionen'
    },
    analytics: {
        label: 'Analytics',
        description: 'Helfen uns, die Nutzung zu verstehen'
    },
    marketing: {
        label: 'Marketing',
        description: 'Für personalisierte Werbung und Zahlungsabwicklung'
    }
}

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [preferences, setPreferences] = useState<Record<string, boolean>>({ essential: true })
    const [availableCategories, setAvailableCategories] = useState<CookieCategory[]>(['essential'])
    const { scripts, loading, loadScriptsBasedOnConsent } = useDynamicScripts()

    const loadConsentedScripts = (prefs: Record<string, boolean>) => {
        const acceptedCategories = Object.entries(prefs)
            .filter(([_, accepted]) => accepted)
            .map(([category]) => category)

        loadScriptsBasedOnConsent(acceptedCategories)
    }

    useEffect(() => {
        // Extract unique categories from scripts
        if (!loading && scripts.length > 0) {
            const categories = Array.from(new Set(scripts.map(s => s.category))) as CookieCategory[]
            // Always include essential
            if (!categories.includes('essential')) {
                categories.unshift('essential')
            }
            setAvailableCategories(categories)

            // Initialize preferences with all categories set to false (except essential)
            const initialPrefs: Record<string, boolean> = { essential: true }
            categories.forEach(cat => {
                if (cat !== 'essential' && !(cat in initialPrefs)) {
                    initialPrefs[cat] = true
                }
            })
            setPreferences(initialPrefs)
        }
    }, [scripts, loading])

    useEffect(() => {
        // Check if user already consented
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const prefs: Record<string, boolean> = JSON.parse(stored)
            setPreferences(prefs)
            loadConsentedScripts(prefs)
            setShowBanner(false)
        } else if (!loading) {
            setShowBanner(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading])

    const handleSavePreferences = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
        loadConsentedScripts(preferences)
        updateGoogleConsent(preferences)
        setShowBanner(false)
        setShowSettings(false)
    }

    const handleAcceptAll = () => {
        const prefs: Record<string, boolean> = {}
        availableCategories.forEach(cat => {
            prefs[cat] = true
        })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
        loadConsentedScripts(prefs)
        updateGoogleConsent(prefs)
        setShowBanner(false)
        setShowSettings(false)
    }

    const handleRejectAll = () => {
        const prefs: Record<string, boolean> = { essential: true }
        availableCategories.forEach(cat => {
            if (cat !== 'essential') {
                prefs[cat] = false
            }
        })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
        loadConsentedScripts(prefs)
        updateGoogleConsent(prefs)
        setShowBanner(false)
        setShowSettings(false)
    }

    const updateGoogleConsent = (prefs: Record<string, boolean>) => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            const gtag = (window as any).gtag
            
            gtag('consent', 'update', {
                'ad_storage': prefs.marketing ? 'granted' : 'denied',
                'ad_user_data': prefs.marketing ? 'granted' : 'denied',
                'ad_personalization': prefs.marketing ? 'granted' : 'denied',
                'analytics_storage': prefs.analytics ? 'granted' : 'denied'
            })
        }
    }

    const togglePreference = (category: string) => {
        if (category === 'essential') return // Essential cookies cannot be disabled
        setPreferences((prev) => ({ ...prev, [category]: !prev[category] }))
    }

    if (!showBanner) return null

    const hasOptionalCookies = availableCategories.length > 1 || (availableCategories.length === 1 && availableCategories[0] !== 'essential')

    // Show settings modal if user clicked "Einstellungen ändern"
    if (showSettings) {
        return (
            <div className="fixed bottom-4 right-4 z-50 w-[400px] max-w-[calc(100vw-2rem)]">
                <div className="bg-background border border-border rounded-lg shadow-lg p-6 relative">
                    <button
                        onClick={() => setShowSettings(false)}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                        aria-label="Zurück"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">🍪 Cookie-Einstellungen</h3>
                        <p className="text-sm text-muted-foreground">
                            Wir nutzen Cookies, um Ihre Erfahrung zu verbessern.{' '}
                            <Link href="/cookie-policy" className="underline hover:text-primary">
                                Mehr erfahren
                            </Link>
                        </p>
                    </div>

                    <div className="space-y-4 mb-6">
                        {availableCategories.map((category) => {
                            const info = CATEGORY_INFO[category]
                            const isEssential = category === 'essential'
                            const isEnabled = preferences[category] ?? false

                            return (
                                <div key={category} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{info.label}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {info.description}
                                        </p>
                                    </div>
                                    {isEssential ? (
                                        <div className="relative inline-block w-12 h-6 ml-4">
                                            <input
                                                type="checkbox"
                                                checked={true}
                                                disabled
                                                className="sr-only"
                                            />
                                            <div className="w-12 h-6 bg-primary rounded-full cursor-not-allowed opacity-50"></div>
                                            <div className="absolute left-6 top-0.5 w-5 h-5 bg-white rounded-full transition-transform"></div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => togglePreference(category)}
                                            className="relative inline-block w-12 h-6 ml-4"
                                            role="switch"
                                            aria-checked={isEnabled}
                                        >
                                            <div
                                                className={`w-12 h-6 rounded-full transition-colors ${isEnabled ? 'bg-primary' : 'bg-muted'
                                                    }`}
                                            ></div>
                                            <div
                                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isEnabled ? 'left-6' : 'left-0.5'
                                                    }`}
                                            ></div>
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button onClick={handleSavePreferences} className="w-full">
                            Auswahl speichern
                        </Button>
                        <div className="flex gap-2">
                            <Button onClick={handleRejectAll} variant="outline" className="flex-1">
                                Alle ablehnen
                            </Button>
                            <Button onClick={handleAcceptAll} variant="outline" className="flex-1">
                                Alle akzeptieren
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Simple notice for essential-only cookies
    if (!hasOptionalCookies) {
        return (
            <div className="fixed bottom-4 right-4 z-50 w-[400px] max-w-[calc(100vw-2rem)]">
                <div className="bg-background border border-border rounded-lg shadow-lg p-6 relative">
                    <button
                        onClick={() => setShowBanner(false)}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                        aria-label="Schließen"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">🍪 Cookie-Hinweis</h3>
                        <p className="text-sm text-muted-foreground">
                            Diese Website verwendet nur erforderliche Cookies für Authentifizierung und grundlegende Funktionen.{' '}
                            <Link href="/cookie-policy" className="underline hover:text-primary">
                                Mehr erfahren
                            </Link>
                        </p>
                    </div>

                    <Button onClick={handleSavePreferences} className="w-full">
                        Verstanden
                    </Button>
                </div>
            </div>
        )
    }

    // Initial banner without cookie selection
    return (
        <div className="fixed bottom-4 right-4 z-50 w-[400px] max-w-[calc(100vw-2rem)]">
            <div className="bg-background border border-border rounded-lg shadow-lg p-6 relative">
                <button
                    onClick={() => setShowBanner(false)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                    aria-label="Schließen"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">🍪 Cookie-Hinweis</h3>
                    <p className="text-sm text-muted-foreground">
                        Wir nutzen Cookies, um Ihre Erfahrung zu verbessern.{' '}
                        <Link href="/cookie-policy" className="underline hover:text-primary">
                            Mehr erfahren
                        </Link>
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <Button onClick={handleAcceptAll} className="w-full">
                        Alle akzeptieren
                    </Button>
                    <div className="flex gap-2">
                      
                        <Button onClick={() => setShowSettings(true)} variant="outline" className="flex-1">
                            Einstellungen ändern
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
