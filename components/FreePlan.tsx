import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { Check } from "lucide-react"

export async function FreePlan() {

    const freeProduct = {
        name: "Start",
        description: "Kostenlos ausprobieren",
        features: [
            { feature: 'feature 1' },
            { feature: 'feature 2' },
            { feature: 'feature 3' },
        ]
    }

    return (

        <Card >
            <CardHeader>
                <CardTitle>Start</CardTitle>
                <CardDescription>{'Kostenlos ausprobieren'}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">
                    {'Kostenlos'}
                </p>
                <ul className="mt-4 space-y-2">
                    {freeProduct.features?.map((feature, index) => (
                        <li key={index} className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-primary" />
                            {feature.feature}
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Link href={'/dashboard'}>
                    <Button className="w-full">Get Started</Button>
                </Link>

            </CardFooter>
        </Card>
    )
}