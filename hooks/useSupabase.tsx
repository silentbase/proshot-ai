'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useSupabase() {  // Note: export, not export default
    const [supabase] = useState(() => createClient())
    return supabase
}