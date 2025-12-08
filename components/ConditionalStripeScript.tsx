'use client'

import { useDynamicScripts } from '@/hooks/useDynamicScripts'

export function ConditionalStripeScript() {
    // Automatically loads all scripts based on cookie preferences
    useDynamicScripts()
    return null
}
