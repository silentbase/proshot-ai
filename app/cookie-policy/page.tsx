import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
    title: 'Cookie-Richtlinie',
    description: 'Erfahren Sie, welche Cookies ProShot AI verwendet und wie wir Ihre Daten schützen.',
    robots: {
        index: true,
        follow: true,
    },
}

export default function CookiePolicyPage() {
    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Cookie-Richtlinie</CardTitle>
                    <p className="text-sm text-muted-foreground">Zuletzt aktualisiert: {new Date().toLocaleDateString('de-DE')}</p>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">Was sind Cookies?</h2>
                        <p className="text-muted-foreground">
                            Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie unsere Website besuchen.
                            Sie helfen uns, Ihre Präferenzen zu speichern und Ihnen ein besseres Nutzererlebnis zu bieten.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Welche Cookies verwenden wir?</h2>

                        <div className="space-y-4">
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">🔒 Essenzielle Cookies (Erforderlich)</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Diese Cookies sind für den Betrieb unserer Website notwendig und können nicht deaktiviert werden.
                                </p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    <li><strong>Authentifizierung (Supabase):</strong> Speichert Ihre Anmeldeinformationen, damit Sie eingeloggt bleiben</li>
                                    <li><strong>Session-Management:</strong> Verwaltet Ihre aktive Sitzung auf der Plattform</li>
                                    <li><strong>Sicherheit:</strong> Schützt vor CSRF-Angriffen und unbefugtem Zugriff</li>
                                    <li><strong>Cookie-Einstellungen:</strong> Speichert Ihre Cookie-Präferenzen</li>
                                </ul>
                            </div>

                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">💳 Zahlungs-Cookies (Optional)</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Diese Cookies ermöglichen sichere Zahlungen über Stripe.
                                </p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    <li><strong>Stripe:</strong> Verarbeitet Zahlungen sicher und speichert Zahlungsinformationen</li>
                                    <li><strong>Betrugsschutz:</strong> Hilft, betrügerische Transaktionen zu verhindern</li>
                                    <li><strong>Checkout-Session:</strong> Speichert Ihren Fortschritt während des Zahlungsvorgangs</li>
                                </ul>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Mehr Informationen: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Stripe Datenschutz</a>
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Wie lange werden Cookies gespeichert?</h2>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li><strong>Session-Cookies:</strong> Werden gelöscht, wenn Sie Ihren Browser schließen</li>
                            <li><strong>Authentifizierungs-Cookies:</strong> Bleiben bis zu 7 Tage bestehen oder bis Sie sich abmelden</li>
                            <li><strong>Präferenz-Cookies:</strong> Bleiben bis zu 1 Jahr bestehen</li>
                            <li><strong>Stripe-Cookies:</strong> Variieren je nach Cookie-Typ (siehe Stripe-Datenschutz)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Ihre Cookie-Einstellungen verwalten</h2>
                        <p className="text-muted-foreground mb-3">
                            Sie können Ihre Cookie-Einstellungen jederzeit ändern:
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>Löschen Sie Ihre Browser-Cookies in den Browser-Einstellungen</li>
                            <li>Verwenden Sie den "Nur erforderliche"-Button im Cookie-Banner</li>
                            <li>Blockieren Sie Cookies in Ihren Browser-Einstellungen (kann die Funktionalität beeinträchtigen)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Datenübertragung in Drittländer</h2>
                        <p className="text-muted-foreground">
                            Einige unserer Dienstleister (z.B. Stripe, Supabase) können Daten in die USA übertragen.
                            Diese Übertragungen erfolgen auf Grundlage von Standardvertragsklauseln und anderen
                            geeigneten Garantien gemäß DSGVO.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Ihre Rechte</h2>
                        <p className="text-muted-foreground mb-2">
                            Gemäß DSGVO haben Sie folgende Rechte:
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>Recht auf Auskunft über Ihre gespeicherten Daten</li>
                            <li>Recht auf Berichtigung falscher Daten</li>
                            <li>Recht auf Löschung Ihrer Daten</li>
                            <li>Recht auf Einschränkung der Verarbeitung</li>
                            <li>Recht auf Datenübertragbarkeit</li>
                            <li>Widerspruchsrecht gegen die Verarbeitung</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Kontakt</h2>
                        <p className="text-muted-foreground">
                            Bei Fragen zu unserer Cookie-Richtlinie oder Ihren Datenschutzrechten kontaktieren Sie uns bitte:
                        </p>
                        <div className="mt-2 text-sm text-muted-foreground">
                            <p>ProShot AI</p>
                            <p>E-Mail: privacy@proshot.ai</p>
                        </div>
                    </section>

                    <section className="border-t pt-4">
                        <p className="text-xs text-muted-foreground">
                            Diese Cookie-Richtlinie kann von Zeit zu Zeit aktualisiert werden. Wesentliche Änderungen werden
                            auf dieser Seite veröffentlicht und das Datum der letzten Aktualisierung wird angepasst.
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    )
}
