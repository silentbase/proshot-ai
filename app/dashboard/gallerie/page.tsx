import { createClient } from '@/utils/supabase/server'
import { UserGeneration } from '@/contexts/ImagesContext'
import GalleryClient from './GalleryClient'

async function fetchGalleryImages(): Promise<UserGeneration[]> {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.id) {
        return []
    }

    try {
        // First, get user generations
        const { data: generations, error: genError } = await supabase
            .from('user_generations')
            .select('id, user_id, text_prompt, updated_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (genError || !generations || generations.length === 0) {
            return []
        }

        // Get generation IDs
        const generationIds = generations.map(gen => gen.id)

        // Get all generated images
        const { data: generatedImagesWithIds, error: idsError } = await supabase
            .from('generated_images')
            .select('id, generation_id, image_path')
            .in('generation_id', generationIds)
            .order('created_at', { ascending: false })

        if (idsError || !generatedImagesWithIds || generatedImagesWithIds.length === 0) {
            return []
        }

        // Extract all valid image paths
        const allImagePaths = generatedImagesWithIds
            .map(img => img.image_path)
            .filter(path => path && path.trim() !== '')

        if (allImagePaths.length === 0) {
            return []
        }

        // Get all signed URLs in a single request
        const { data: urlsData, error: urlError } = await supabase
            .storage
            .from('generated-images')
            .createSignedUrls(allImagePaths, 60 * 60) // 1 hour expiry

        if (urlError || !urlsData) {
            return []
        }

        // Create results by joining generation data with image data
        const imageResults: UserGeneration[] = []
        generatedImagesWithIds.forEach((img) => {
            const generation = generations.find(gen => gen.id === img.generation_id)
            const urlInfo = urlsData.find(u => u.path === img.image_path)

            if (generation && urlInfo?.signedUrl) {
                imageResults.push({
                    id: img.id,
                    user_id: generation.user_id,
                    generated_image_url: urlInfo.signedUrl,
                    text_prompt: generation.text_prompt,
                    updated_at: generation.updated_at
                })
            }
        })

        return imageResults
    } catch (err) {
        console.error('Error fetching gallery images:', err)
        return []
    }
}

export default async function GalleryPage() {
    const images = await fetchGalleryImages()

    return <GalleryClient initialImages={images} />
}