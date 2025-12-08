'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCreditsContext } from '@/contexts/CreditsContext';
import { toast } from "sonner"
import { Loader2, X, Check } from 'lucide-react';
import { checkoutSession, getStripeProductsAction } from '@/utils/stripe/actions';
import type { StripeProduct } from '@/utils/stripe/api';
import getCreditAmount from '@/utils/helpers/getCreditAmount';
import useAppContext from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';

export default function CreditPurchaseModal() {
    const router = useRouter()
    const { user, plan } = useAppContext();
    const { credits, showBuyCreditsModal, setShowBuyCreditsModal } = useCreditsContext();
    const [selectedPackage, setSelectedPackage] = useState<StripeProduct | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [maxCredits, setMaxCredits] = useState<number>(0);
    const [creditPackages, setcreditPackages] = useState<StripeProduct[]>([]);

    const IS_PRODUCTION = process.env.NEXT_PUBLIC_ENV === "production";
    const popular = IS_PRODUCTION ? "Standart" : "Standart-Test"

    const upgrade = (pkg: any) => {
        return credits === 0 || (credits < getCreditAmount(pkg.name) && plan?.name !== pkg.name && getCreditAmount(plan?.name!) < getCreditAmount(pkg.name))
    }

    useEffect(() => {
        if (selectedPackage?.name) {
            const credits = getCreditAmount(selectedPackage.name);
            setMaxCredits(credits!);
        } else {
            setMaxCredits(0);
        }
    }, [selectedPackage]);

    useEffect(() => {
        const fetchProducts = async () => {
            const products = await getStripeProductsAction();
            // Sort by price (cheapest first)
            const sorted = [...(products || [])].sort((a, b) => {
                const aPrice = a.price && typeof a.price === 'object' && 'unit_amount' in a.price
                    ? a.price.unit_amount ?? 0
                    : Number(a.price ?? 0);
                const bPrice = b.price && typeof b.price === 'object' && 'unit_amount' in b.price
                    ? b.price.unit_amount ?? 0
                    : Number(b.price ?? 0);
                return aPrice - bPrice;
            });

            setcreditPackages(sorted);
            // Select the middle package by default
            if (sorted.length > 0) {
                const defaultIdx = sorted.length > 2 ? Math.floor(sorted.length / 2) : 0;
                setSelectedPackage(sorted[defaultIdx]);
            }
        };
        fetchProducts();
    }, []);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (showBuyCreditsModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showBuyCreditsModal]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showBuyCreditsModal) {
                setShowBuyCreditsModal(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [showBuyCreditsModal, setShowBuyCreditsModal]);

    { /* const handlePurchase = async (pkg: StripeProduct) => {
        setSelectedPackage(pkg);
        setIsLoading(true);
        try {
            //const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('You must be logged in to purchase credits');
                setIsLoading(false);
                return;
            }
            const priceId = typeof pkg.price === 'string'
                ? pkg.price
                : (pkg.price?.id ?? pkg.id);

            const creditsToBuy = getCreditAmount(pkg.name);

            /* const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
                 body: {
                     priceId,
                     userId: user.id,
                     email: user.email,
                     metadata: {
                         credits: creditsToBuy,
                         packageName: pkg.name,
                     }
                 }
             });
             if (error) throw error;
             window.location.href = data.url;*//*
    } catch (error) {
        console.error('Error creating checkout session:', error);
        toast.error('Failed to initiate purchase. Please try again.');
        setIsLoading(false);
    }
};*/}

    if (!showBuyCreditsModal) {
        return null;
    }

    // Find the middle package for the "Popular" badge
    const middleIndex = creditPackages.length > 2 ? Math.floor(creditPackages.length / 2) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-background/90">
            <div
                className="w-screen h-screen bg-[hsl(var(--background))] px-4 py-10 lg:px-8 flex flex-col relative"
                style={{ minHeight: '100dvh', maxHeight: '100dvh', overflowY: 'auto' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative background blur */}
                <div aria-hidden="true" className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl pointer-events-none">
                    <div
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                        className="mx-auto aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20"
                    />
                </div>
                {/* Close button */}
                <button
                    onClick={() => setShowBuyCreditsModal(false)}
                    className="absolute top-6 right-6 rounded-full p-2 bg-muted/70 hover:bg-muted transition-colors z-10"
                    aria-label="Close"
                >
                    <X className="h-6 w-6 text-foreground" />
                </button>
                {/* Header */}
                <div className="mx-auto max-w-4xl text-center">
                    {/*<h2 className="text-base font-semibold text-[hsl(var(--primary))]">Pricing</h2>*/}
                    <p className="mt-2 text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-6xl sm:leading-tight leading-tight">
                        Wähle den perfekten Plan für dich
                    </p>
                </div>
                {/* <p className="mx-auto mt-6 max-w-2xl text-left text-lg font-medium text-pretty text-muted-foreground sm:text-xl">
                    Choose an affordable package that’s packed with the best features for generating your product images.
                </p>*/}
                {/* Pricing grid */}
                <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8 sm:mt-20 lg:grid-cols-3">
                    {creditPackages.map((pkg, idx) => {
                        const isSelected = selectedPackage?.id === pkg.id;

                        return (
                            <div
                                key={pkg.id}
                                className={[
                                    "relative rounded-3xl p-8 flex flex-col items-start bg-[hsl(var(--card))] transition-all select-none shadow-sm ring-1 ring-[hsl(var(--border))] justify-between",
                                    pkg.name == popular && !plan
                                        ? "shadow-2xl scale-105 z-20 ring-0 bg-gradient-to-br from-[hsl(var(--primary)/0.10)] to-[hsl(var(--accent)/0.15)]"
                                        : "hover:shadow-lg",
                                    (!upgrade(pkg)) ? " opacity-50 group disabled-parent" : ""
                                ].join(" ")}
                                style={{
                                    minHeight: 420,
                                    wordBreak: 'keep-all',
                                    whiteSpace: 'nowrap',

                                }}
                            >
                                <div>
                                    {(idx === middleIndex && !plan) && (
                                        <div className="absolute -top-6 left-6 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm px-4 py-1.5 rounded-full shadow-lg font-bold tracking-wide border-2 border-white z-30">
                                            Popular
                                        </div>
                                    )}
                                    {(plan?.name == pkg.name) && (
                                        <div className="absolute -top-6 left-6 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm px-4 py-1.5 rounded-full shadow-lg font-bold tracking-wide border-2 border-white z-30">
                                            Selected
                                        </div>
                                    )}
                                    <h3 className="text-lg font-bold text-[hsl(var(--primary))] mb-2">{pkg.name}</h3>
                                    <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
                                        <span className="text-5xl font-extrabold tracking-tight text-foreground">
                                            {pkg.price && typeof pkg.price === 'object' && 'unit_amount' in pkg.price
                                                ? (() => {
                                                    const amount = ((pkg.price.unit_amount ?? 0) / 100).toFixed(2);
                                                    const symbol = new Intl.NumberFormat(undefined, {
                                                        style: 'currency',
                                                        currency: pkg.price.currency?.toUpperCase() || 'USD',
                                                        currencyDisplay: 'narrowSymbol',
                                                    })
                                                        .formatToParts(1)
                                                        .find(part => part.type === 'currency')?.value || pkg.price.currency?.toUpperCase() || '';
                                                    return `${amount} ${symbol}`;
                                                })()
                                                : pkg.price}
                                        </span>
                                        <span className="block text-base text-muted-foreground ml-2 mt-2">
                                            pro Monat
                                        </span>

                                    </p>
                                    <p className="mt-6 text-base text-muted-foreground text-left">
                                        {pkg.description}
                                    </p>
                                    <ul className="mt-8 space-y-3 text-sm text-muted-foreground sm:mt-10 text-left w-full max-w-xs">
                                        <li className="flex gap-x-3">
                                            <Check className="mr-2 h-4 w-4 text-[hsl(var(--primary))]" />
                                            {pkg.features?.[0] || "No recurring fees"}
                                        </li>
                                        {pkg.features?.slice(1).map((feature, i) => (
                                            <li key={feature + i} className="flex gap-x-3">
                                                <Check className="mr-2 h-4 w-4 text-[hsl(var(--primary))]" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-10 w-full">
                                    <Button
                                        className="w-full whitespace-nowrap text-left shimmer-on-hover disabled:opacity-50
                                        group-[disabled-parent]:cursor-not-allowed group-[disabled-parent]:pointer-events-none"
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            const runCheckoutSession = async () => {
                                                setIsLoading(true)
                                                setSelectedPackage(pkg)

                                                try {

                                                    /*if (plan) {
                                                        const { url, error } = await getBillingPortalLink(BillingPortalFlowType.SubUpdate)
                                                        if (error) {
                                                            toast.error(error)
                                                            return
                                                        }
                                                        router.push(url!)
                                                        setIsLoading(false)
                                                        return
                                                    }*/
                                                    const url = await checkoutSession(pkg.price.id)
                                                    setShowBuyCreditsModal(false)

                                                    url ? router.push(url!) : ""
                                                    setIsLoading(false)

                                                } catch (error) {
                                                    setIsLoading(false)
                                                    toast.error('Ops! Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.');
                                                }
                                            }
                                            runCheckoutSession();

                                        }}

                                        disabled={isLoading && isSelected || !upgrade(pkg)}
                                    >
                                        {isLoading && isSelected ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            </>
                                        ) : (
                                            <>
                                                {plan ? (
                                                    plan.name === pkg.name ? (
                                                        "Abo erneuern"
                                                    ) : getCreditAmount(pkg.name) > getCreditAmount(plan.name) ? (
                                                        "Upgrade"
                                                    ) : (
                                                        "Subscribe"
                                                    )
                                                ) : (
                                                    "Subscribe"
                                                )}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}