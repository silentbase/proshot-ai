import { CreditAmount } from "../Enums";
import { IS_PRODUCTION } from "../env";

export interface Plan {
    name: string;
    price: number;
    description: string;
    subscription: boolean;
    features: string[];
    credits: number,
}

// Use NEXT_PUBLIC_ENV for client-safe environment checks


export const plans: Plan[] = [
    {
        name: IS_PRODUCTION ? "Basic" : "Basic-Test",
        price: 790,
        description: "Perfekt für Einsteiger",
        subscription: true,
        features: [
            "30 Generierungen pro Monat",
            "KI-gestützte Bildgenerierung",
            "Hochladen eigener Produktbilder",
            "Referenzbilder für bessere Ergebnisse",
            "Download in hoher Qualität",
        ],
        credits: CreditAmount.Basic
    },
    {
        name: IS_PRODUCTION ? "Standart" : "Standart-Test",
        price: 1990,
        description: "Ideal für kleine Unternehmen",
        subscription: true,
        features: [
            "100 Generierungen pro Monat",
            "Alles in Basic",
            "Prioritäts-Support",
        ],
        credits: CreditAmount.Standart
    },
    {
        name: IS_PRODUCTION ? "Premium" : "Premium-Test",
        price: 7990,
        description: "Für professionelle Teams",
        subscription: true,
        features: [
            "500 Generierungen pro Monat",
            "Alles in Pro"
        ],
        credits: CreditAmount.Premium
    },
];