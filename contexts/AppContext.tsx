'use client'
import { getStripePlanAction } from '@/utils/stripe/actions'
import { StripePlan } from '@/utils/stripe/api'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react'

interface Image {
    id: string
    url: string
    updated_at: string
}

interface UploadData {
    originalImage: File,
    referenceImage: File,
    textPrompt: string,
}

interface AppContextType {
    user: User | null
    setUser: (user: User | null) => void
    plan: StripePlan | null
    setPlan: (plan: StripePlan | null) => void
    name: string | null
    setName: (name: string | null) => void
    images: Image[]
    setImages: (images: Image[]) => void
    uploadData: UploadData[]
    setUploadData: (uploadData: UploadData[]) => void
    loading: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {

    const [user, setUser] = useState<User | null>(null)
    const [name, setName] = useState<string | null>(null)
    const [plan, setPlan] = useState<StripePlan | null>(null)
    const [images, setImages] = useState<Image[]>([])
    const [uploadData, setUploadData] = useState<UploadData[]>([])

    // split loading into user/plan so they don't block each other
    const [loadingUser, setLoadingUser] = useState(true)
    const [loadingPlan, setLoadingPlan] = useState(false)
    const [loadingName, setLoadingName] = useState(false)

    const supabase = createClient()

    let mounted = true

    const fetchUser = async () => {
        setLoadingUser(true)
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!mounted) return
            setUser(user ?? null)
        } catch (err) {
            if (mounted) setUser(null)
        } finally {
            if (mounted) setLoadingUser(false)
        }
    }

    // 1) auth: fetch current user and subscribe to auth changes
    useEffect(() => {
        fetchUser()
    }, [])

    // 2) plan: fetch plan whenever user changes
    useEffect(() => {
        let mounted = true
        const fetchPlan = async () => {
            if (!user) {
                setPlan(null)
                setLoadingPlan(false)
                return
            }
            setLoadingPlan(true)
            try {
                const plan = await getStripePlanAction()
                if (!mounted) return
                setPlan(plan ?? null)
            } catch (err) {
                console.error('fetchPlan error', err)
                if (mounted) setPlan(null)
            } finally {
                if (mounted) setLoadingPlan(false)
            }
        }

        fetchPlan()
        return () => {
            mounted = false
        }
    }, [user])


    // 3) name: fetch name whenever user changes
    useEffect(() => {
        let mounted = true
        const fetchName = async () => {
            if (!user) {
                setName(null)
                setLoadingName(false)
                return
            }
            setLoadingName(true)
            try {
                const supabase = createClient()

                const { data: trackingRow, error: trackErr } = await supabase
                    .from('users_table').select('name').eq('id', user.id).single()

                if (trackErr) console.error('fetchPlan error', trackErr)

                if (!mounted) return
                setName(trackingRow?.name! ?? null)
            } catch (err) {
                console.error('fetchPlan error', err)
                if (mounted) setName(null)
            } finally {
                if (mounted) setLoadingName(false)
            }
        }

        fetchName()
        return () => {
            mounted = false
        }
    }, [user])

    const loading = loadingUser || loadingPlan || loadingName

    const value = useMemo(() => ({
        user,
        setUser,
        name,
        setName,
        plan,
        setPlan,
        images,
        setImages,
        uploadData,
        setUploadData,
        loading,

    }), [user, plan, name, images, uploadData, loading])



    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export default function useAppContext() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useAppContext must be used inside <AppProvider>')
    }
    return context
}
