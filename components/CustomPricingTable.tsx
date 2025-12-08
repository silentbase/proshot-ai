'use client'

import { Button } from "@/components/ui/button"
import { Check, Sparkles } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useState } from "react"
import { cn } from "@/lib/utils"

// Import from your Stripe API
import { CREDIT_PACKAGES } from "@/utils/stripe/api"

const tiers = [
    {
        name: "Starter",
        id: "price_starter",
        price: { monthly: "$9", yearly: "$90" },
        description: "Perfect for trying out our service",
        credits: 50,
        features: [
            "50 image credits",
            "Basic generation options",
            "Email support",
        ],
        featured: false,
    },
    {
        name: "Professional",
        id: "price_professional",
        price: { monthly: "$29", yearly: "$290" },
        description: "For serious product photographers",
        credits: 200,
        features: [
            "200 image credits",
            "Advanced generation options",
            "Priority support",
            "Commercial usage",
        ],
        featured: true,
    },
    {
        name: "Enterprise",
        id: "price_enterprise",
        price: { monthly: "$79", yearly: "$790" },
        description: "For teams and businesses",
        credits: 600,
        features: [
            "600 image credits",
            "All advanced options",
            "Dedicated support",
            "API Access",
            "Custom branding",
        ],
        featured: false,
    },
]

export default function CustomPricingTable() {
    const [frequency, setFrequency] = useState<"monthly" | "yearly">("monthly")
    const supabase = createClient()

    const handleSubscribe = async (priceId: string) => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                window.location.href = "/login?redirect=/subscribe"
                return
            }

            const { data, error } = await supabase.functions.invoke(
                "stripe-create-subscription",
                {
                    body: {
                        priceId,
                        userId: user.id,
                        email: user.email,
                    },
                }
            )

            if (error) throw error

            window.location.href = data.url
        } catch (error) {
            console.error("Error creating subscription:", error)
        }
    }

    return (
        <div>
            <div className="flex justify-center mb-8">
                <div className="inline-flex rounded-lg p-1 bg-muted">
                    <Button
                        variant={frequency === "monthly" ? "default" : "ghost"}
                        onClick={() => setFrequency("monthly")}
                        className="rounded-md text-sm"
                    >
                        Monthly
                    </Button>
                    <Button
                        variant={frequency === "yearly" ? "default" : "ghost"}
                        onClick={() => setFrequency("yearly")}
                        className="rounded-md text-sm"
                    >
                        Yearly
                        <span className="ml-1.5 rounded-full text-[10px] bg-primary px-2 py-0.5 text-primary-foreground">
                            Save 15%
                        </span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {tiers.map((tier) => (
                    <div
                        key={tier.name}
                        className={cn(
                            "rounded-xl border bg-background shadow-sm relative flex flex-col",
                            tier.featured &&
                            "border-primary shadow-md ring-1 ring-primary/30"
                        )}
                    >
                        {tier.featured && (
                            <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/3">
                                <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium">
                                    Popular
                                </div>
                            </div>
                        )}

                        <div className="p-6">
                            <h3 className="text-xl font-semibold leading-6">
                                {tier.name}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {tier.description}
                            </p>
                            <div className="mt-4">
                                <span className="text-3xl font-bold">
                                    {tier.price[frequency]}
                                </span>
                                <span className="text-sm text-muted-foreground ml-1">
                                    /{frequency === "monthly" ? "mo" : "yr"}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span>
                                    <strong>{tier.credits}</strong> credits included
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col justify-between">
                            <div className="p-6 pt-0">
                                <ul className="mt-6 space-y-3">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex">
                                            <Check className="h-5 w-5 text-primary shrink-0" />
                                            <span className="ml-3 text-sm">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-6 pt-0">
                                <Button
                                    onClick={() => handleSubscribe(tier.id)}
                                    className={cn(
                                        "w-full",
                                        tier.featured
                                            ? "bg-primary hover:bg-primary/90"
                                            : ""
                                    )}
                                >
                                    Subscribe
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                All plans include a 7-day free trial. Cancel anytime.
            </p>
        </div>
    )
}
