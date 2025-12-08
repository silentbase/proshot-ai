import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'AGB',
    description: 'Allgemeine Geschäftsbedingungen von ProShot AI',
    robots: {
        index: true,
        follow: true,
    },
}

export default function AGBPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>

            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">§1 Geltungsbereich</h2>
                    <p className="text-muted-foreground">
                        Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge, Nutzungen und
                        Geschäftsbeziehungen zwischen ProShot AI (nachfolgend &quot;Anbieter&quot;) und den Nutzern der
                        Plattform proshotai.app (nachfolgend &quot;Nutzer&quot;).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">§2 Leistungsbeschreibung</h2>
                    <div className="space-y-2 text-muted-foreground">
                        <p>
                            (1) ProShot AI ist ein KI-basiertes SaaS-Tool zur Erstellung von Werbefotos. Nutzer
                            laden Bildmaterial hoch, welches automatisiert verarbeitet wird.
                        </p>
                        <p>(2) Der Anbieter stellt unterschiedliche Abomodelle zur Verfügung.</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">§3 Registrierung & Nutzung</h2>
                    <div className="space-y-2 text-muted-foreground">
                        <p>(1) Für die Nutzung ist eine Registrierung notwendig (Google Auth).</p>
                        <p>(2) Nach Registrierung erhält der Nutzer 5 kostenlose Credits.</p>
                        <p>
                            (3) Der Nutzer ist verantwortlich für die Sicherung seiner Zugangsdaten.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">§4 Abonnements & Preise</h2>
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            Es stehen folgende monatliche Abo-Modelle zur Verfügung (monatlich kündbar):
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            <li>7,90 € / Monat</li>
                            <li>19,90 € / Monat</li>
                            <li>79,90 € / Monat</li>
                        </ul>
                        <p className="text-muted-foreground">
                            Die Abrechnung erfolgt über Stripe (PayPal, Kreditkarte inkl.). Rechnungen werden
                            automatisch generiert.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">§5 Nutzungsregeln</h2>
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            (1) Nutzer dürfen <strong>keine</strong> Inhalte hochladen, die:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            <li>sexuell eindeutig, pornografisch oder minderjährig sind,</li>
                            <li>gewaltverherrlichend oder extremistisch sind,</li>
                            <li>gegen geltendes Gesetz der Bundesrepublik Deutschland verstoßen.</li>
                        </ul>
                        <p className="text-muted-foreground">
                            (2) Der Anbieter ist berechtigt, entsprechende Inhalte zu löschen und Accounts zu
                            sperren.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">§6 Rechte an generierten Inhalten</h2>
                    <div className="space-y-2 text-muted-foreground">
                        <p>
                            (1) Nutzer erhalten die <strong>vollen kommerziellen Rechte</strong> an den durch
                            ProShot AI generierten Bildern.
                        </p>
                        <p>
                            (2) Der Anbieter behält ausschließlich technisch notwendige Rechte zur Verarbeitung.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">§7 Haftungsausschluss</h2>
                    <div className="space-y-2 text-muted-foreground">
                        <p>
                            (1) Generierte KI-Inhalte können Fehler enthalten. Eine Gewähr für Richtigkeit,
                            Eignung oder Vollständigkeit wird nicht übernommen.
                        </p>
                        <p>(2) Der Anbieter haftet nur für Vorsatz oder grobe Fahrlässigkeit.</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">§8 Kündigung</h2>
                    <p className="text-muted-foreground">
                        Abonnements können jederzeit zum nächsten Abrechnungszeitraum gekündigt werden.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">§9 Widerrufsbelehrung</h2>
                    <p className="text-muted-foreground">
                        Da digitale Inhalte unmittelbar nach Kauf bereitgestellt werden, erlischt das
                        Widerrufsrecht nach bestätigter Zustimmung des Kunden gemäß §356 Abs. 5 BGB.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">§10 Schlussbestimmungen</h2>
                    <p className="text-muted-foreground">
                        Es gilt deutsches Recht. Erfüllungsort und Gerichtsstand ist Berlin.
                    </p>
                </section>

                <section className="pt-8 border-t">
                    <p className="text-sm text-muted-foreground">
                        Stand: Dezember 2025 · Weitere Informationen:{' '}
                        <Link href="/impressum" className="text-primary hover:underline">
                            Impressum
                        </Link>
                        {' '}·{' '}
                        <Link href="/datenschutz" className="text-primary hover:underline">
                            Datenschutzerklärung
                        </Link>
                    </p>
                </section>
            </div>
        </div>
    )
}
