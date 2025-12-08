import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Datenschutzerklärung',
    description: 'Datenschutzerklärung von ProShot AI gemäß DSGVO',
    robots: {
        index: true,
        follow: true,
    },
}

export default function DatenschutzPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Datenschutzerklärung (DSGVO-konform)</h1>

            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Verantwortlich</h2>
                    <div className="space-y-2 text-muted-foreground">
                        <p>ProShot AI – Suhieb Al-Khatib</p>
                        <p>Kolbergerstraße 24, 13357 Berlin</p>
                        <p>
                            E-Mail:{' '}
                            <a
                                href="mailto:support@proshotai.app"
                                className="text-primary hover:underline"
                            >
                                support@proshotai.app
                            </a>
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">
                        1. Erhebung und Speicherung personenbezogener Daten
                    </h2>
                    <div className="space-y-4">
                        <p className="text-muted-foreground">ProShot AI verarbeitet folgende Daten:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            <li>E-Mail-Adresse</li>
                            <li>Name</li>
                            <li>hochgeladene Bilder</li>
                            <li>Nutzungs- und Logdaten</li>
                            <li>Zahlungsdaten über Stripe</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. Zweck der Verarbeitung</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Bereitstellung des KI-Dienstes (Bilderstellung)</li>
                        <li>Benutzerkonto-Verwaltung</li>
                        <li>Abrechnung & Rechnungsstellung</li>
                        <li>Systemsicherheit</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. Rechtsgrundlagen</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</li>
                        <li>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</li>
                        <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung, z. B. Cookies)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Einsatz von Drittanbietern</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Supabase (EU Server)</h3>
                            <p className="text-muted-foreground">
                                Speicherung von Logins, Anwendungsdaten und hochgeladenen Bildern. Die Daten
                                werden auf Servern innerhalb der EU gehostet.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Stripe</h3>
                            <p className="text-muted-foreground">
                                Zahlungsabwicklung (inkl. Kreditkarte & PayPal). Stripe ist DSGVO-konform und
                                verarbeitet Zahlungsdaten sicher.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Google Auth</h3>
                            <p className="text-muted-foreground">
                                Login über Google-Konto. Es gelten die{' '}
                                <a
                                    href="https://policies.google.com/privacy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    Datenschutzbestimmungen von Google
                                </a>
                                .
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Nano Banana / Google Gemini API</h3>
                            <p className="text-muted-foreground">
                                Verarbeitung und Generierung von KI-Bildern. Die Bildverarbeitung erfolgt über
                                externe KI-Dienste.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">5. Cookies & Tracking</h2>
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            Unsere Website verwendet Cookies, um die Funktionalität zu gewährleisten und Ihre
                            Nutzungserfahrung zu verbessern. Sie können Ihre Cookie-Präferenzen jederzeit in
                            unserem Cookie-Banner oder in den{' '}
                            <Link href="/cookie-policy" className="text-primary hover:underline">
                                Cookie-Einstellungen
                            </Link>{' '}
                            anpassen.
                        </p>
                        <p className="text-muted-foreground">
                            Aktuell werden nur essenzielle Cookies verwendet. Bei späterer Verwendung von Google
                            Analytics oder anderen Tracking-Tools wird diese Datenschutzerklärung aktualisiert und
                            Sie werden entsprechend informiert.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">6. Speicherdauer</h2>
                    <p className="text-muted-foreground">
                        Personenbezogene Daten werden gelöscht, sobald sie für den Zweck der Verarbeitung nicht
                        mehr notwendig sind oder Sie die Löschung verlangen (sofern keine gesetzlichen
                        Aufbewahrungspflichten bestehen).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">7. Rechte der betroffenen Personen</h2>
                    <div className="space-y-4">
                        <p className="text-muted-foreground">Sie haben folgende Rechte:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            <li>
                                <strong>Auskunft (Art. 15 DSGVO)</strong> – Information über gespeicherte Daten
                            </li>
                            <li>
                                <strong>Löschung (Art. 17 DSGVO)</strong> – Recht auf Löschung Ihrer Daten
                            </li>
                            <li>
                                <strong>Berichtigung (Art. 16 DSGVO)</strong> – Korrektur falscher Daten
                            </li>
                            <li>
                                <strong>Datenübertragbarkeit (Art. 20 DSGVO)</strong> – Erhalt Ihrer Daten in
                                einem strukturierten Format
                            </li>
                            <li>
                                <strong>Widerspruch (Art. 21 DSGVO)</strong> – Widerspruch gegen die Verarbeitung
                            </li>
                        </ul>
                        <p className="text-muted-foreground">
                            Für die Ausübung Ihrer Rechte kontaktieren Sie uns unter:{' '}
                            <a
                                href="mailto:support@proshotai.app"
                                className="text-primary hover:underline"
                            >
                                support@proshotai.app
                            </a>
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">8. Beschwerderecht</h2>
                    <p className="text-muted-foreground">
                        Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, wenn Sie
                        der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen die DSGVO
                        verstößt.
                    </p>
                    <p className="text-muted-foreground mt-2">
                        Zuständige Behörde für Berlin:{' '}
                        <a
                            href="https://www.datenschutz-berlin.de/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            Berliner Beauftragte für Datenschutz und Informationsfreiheit
                        </a>
                    </p>
                </section>

                <section className="pt-8 border-t">
                    <p className="text-sm text-muted-foreground">
                        Stand: Dezember 2025 · Weitere Informationen:{' '}
                        <Link href="/impressum" className="text-primary hover:underline">
                            Impressum
                        </Link>
                        {' '}·{' '}
                        <Link href="/agb" className="text-primary hover:underline">
                            AGB
                        </Link>
                        {' '}·{' '}
                        <Link href="/cookie-policy" className="text-primary hover:underline">
                            Cookie-Richtlinie
                        </Link>
                    </p>
                </section>
            </div>
        </div>
    )
}
