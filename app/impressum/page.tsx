import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Impressum',
    description: 'Impressum und rechtliche Informationen von ProShot AI',
    robots: {
        index: true,
        follow: true,
    },
}

export default function ImpressumPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Impressum</h1>

            <div className="space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Angaben gemäß § 5 TMG</h2>
                    <div className="space-y-2">
                        <p className="font-semibold text-lg">ProShot AI</p>
                        <p>Inhaber: Suhieb Al-Khatib</p>
                        <p>Kolbergerstraße 24</p>
                        <p>13357 Berlin</p>
                        <p>Deutschland</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Kontakt</h2>
                    <div className="space-y-2">
                        <p>
                            E-Mail:{' '}
                            <a
                                href="mailto:support@proshotai.app"
                                className="text-primary hover:underline"
                            >
                                support@proshotai.app
                            </a>
                        </p>
                        <p>Telefon: 0176 35927258</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Unternehmensform</h2>
                    <p>Einzelunternehmen</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Verantwortlich für den Inhalt</h2>
                    <p>Suhieb Al-Khatib</p>
                    <p>Kolbergerstraße 24</p>
                    <p>13357 Berlin</p>
                </section>

                <section className="pt-8 border-t">
                    <p className="text-sm text-muted-foreground">
                        Weitere rechtliche Informationen finden Sie in unseren{' '}
                        <Link href="/agb" className="text-primary hover:underline">
                            AGB
                        </Link>
                        {' '}und der{' '}
                        <Link href="/datenschutz" className="text-primary hover:underline">
                            Datenschutzerklärung
                        </Link>
                        .
                    </p>
                </section>
            </div>
        </div>
    )
}
