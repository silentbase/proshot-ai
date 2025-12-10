import Link from 'next/link'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t bg-background mt-8 max-md:mt-0">
            <div className="container flex flex-row justify-between mx-auto container-left-padding container-right-padding py-6">
                <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear}  ProShot AI. Alle Rechte vorbehalten.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                    <Link
                        href="/impressum"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Impressum"
                    >
                        Impressum
                    </Link>
                    <Link
                        href="/agb"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        aria-label="AGB"
                    >
                        AGB
                    </Link>
                    <Link
                        href="/datenschutz"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Datenschutz"
                    >
                        Datenschutz
                    </Link>
                    <Link
                        href="/cookie-policy"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Cookie-Richtlinie"
                    >
                        Cookie-Richtlinie
                    </Link>
                </div>
            </div>
        </footer>
    )
}
