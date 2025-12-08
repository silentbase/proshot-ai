'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSupabase } from '@/hooks/useSupabase'
import useAppContext from '@/contexts/AppContext'

export interface UserGeneration {
    id: string
    user_id: string
    generated_image_url: string
    text_prompt: string
    updated_at: string
}

interface ImagesContextType {
    images: UserGeneration[]
    setImages: (images: UserGeneration[]) => void
    loading: boolean
    fetchImages: () => Promise<void>
    handleDelete: (id: string) => Promise<void>
    handleDownload: (imageUrl: string, imageName: string) => void
    refreshImages: () => Promise<void>
}

const ImagesContext = createContext<ImagesContextType | undefined>(undefined)

export function ImagesProvider({ children }: { children: React.ReactNode }) {
    const supabase = useSupabase()
    const [images, setImages] = useState<UserGeneration[]>([])
    const [loading, setLoading] = useState(false)
    const { user } = useAppContext()

    const fetchImages = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            // First, get user generations
            const { data: generations, error: genError } = await supabase
                .from('user_generations')
                .select('id, user_id, text_prompt, updated_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (genError) {
                console.error('Error fetching generations:', genError);
                return;
            }

            if (!generations || generations.length === 0) {
                setImages([]);
                return;
            }

            // Get generation IDs
            const generationIds = generations.map(gen => gen.id);

            // Then, get all generated images for these generations (we'll get IDs later)
            const { data: generatedImages, error: imgError } = await supabase
                .from('generated_images')
                .select('generation_id, image_path')
                .in('generation_id', generationIds)
                .order('created_at', { ascending: false });

            if (imgError) {
                console.error('Error fetching generated images:', imgError);
                return;
            }

            if (!generatedImages || generatedImages.length === 0) {
                setImages([]);
                return;
            }

            // Extract all valid image paths
            const allImagePaths = generatedImages
                .map(img => img.image_path)
                .filter(path => path && path.trim() !== '');

            if (allImagePaths.length === 0) {
                setImages([]);
                return;
            }

            // Get all signed URLs in a single request
            const { data: urlsData, error: urlError } = await supabase
                .storage
                .from('generated-images')
                .createSignedUrls(allImagePaths, 60 * 60); // 1 hour expiry

            if (urlError || !urlsData) {
                console.error('Error getting signed URLs:', urlError);
                return;
            }

            // First get the generated_images with their actual IDs
            const { data: generatedImagesWithIds, error: idsError } = await supabase
                .from('generated_images')
                .select('id, generation_id, image_path')
                .in('generation_id', generationIds)
                .order('created_at', { ascending: false });

            if (idsError || !generatedImagesWithIds) {
                console.error('Error fetching generated images with IDs:', idsError);
                return;
            }

            // Create results by joining generation data with image data
            const imageResults: UserGeneration[] = [];
            generatedImagesWithIds.forEach((img) => {
                const generation = generations.find(gen => gen.id === img.generation_id);
                const urlInfo = urlsData.find(u => u.path === img.image_path);

                if (generation && urlInfo?.signedUrl) {
                    imageResults.push({
                        id: img.id, // Use the actual generated_images.id
                        user_id: generation.user_id,
                        generated_image_url: urlInfo.signedUrl,
                        text_prompt: generation.text_prompt,
                        updated_at: generation.updated_at
                    });
                }
            });

            setImages(imageResults);
        } catch (err) {
            console.error('Error processing images:', err);
        } finally {
            setLoading(false);
        }
    }

    // For manual refresh - this will force a reload
    const refreshImages = async () => {
        await fetchImages();
    }

    const handleDelete = async (generatedImageId: string) => {
        try {
            // 1. First get the generated image record to get the image path and generation_id
            const { data: generatedImage, error: fetchError } = await supabase
                .from('generated_images')
                .select('id, image_path, generation_id')
                .eq('id', generatedImageId)
                .single();

            if (fetchError || !generatedImage) {
                console.error('Could not find generated image:', fetchError);
                return;
            }

            // 2. Delete the image from storage
            const { error: storageError } = await supabase
                .storage
                .from('generated-images')
                .remove([generatedImage.image_path]);

            if (storageError) {
                console.error('Error deleting image from storage:', storageError);
            }

            // 3. Delete the generated_images record
            const { error: deleteError } = await supabase
                .from('generated_images')
                .delete()
                .eq('id', generatedImageId);

            if (deleteError) {
                console.error('Error deleting generated image from DB:', deleteError);
                return;
            }

            // 4. Check if this was the last image for this generation
            const { data: remainingImages, error: checkError } = await supabase
                .from('generated_images')
                .select('id')
                .eq('generation_id', generatedImage.generation_id);

            // If no more images exist for this generation, delete the generation record too
            if (!checkError && (!remainingImages || remainingImages.length === 0)) {
                const { error: genDeleteError } = await supabase
                    .from('user_generations')
                    .delete()
                    .eq('id', generatedImage.generation_id);

                if (genDeleteError) {
                    console.error('Error deleting generation record:', genDeleteError);
                }
            }

            // Update context state - remove this specific image
            setImages(prevImages => prevImages.filter(img => img.id !== generatedImageId));
        } catch (error) {
            console.error("Error in delete operation:", error);
        }
    }

    const handleDownload = async (imageUrl: string, imageName: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = imageName || 'generated-image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the object URL
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading image:', error);
            // Fallback to simple link method
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = imageName || 'generated-image.png';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Set up real-time listeners (no automatic fetching - server provides initial data)
    useEffect(() => {
        if (!user?.id) return;

        // Set up realtime listeners
        supabase.realtime.setAuth();
        const changes = supabase
            .channel(`user_:${user?.id}`, {
                config: { private: true },
            })
            .on('broadcast', { event: 'INSERT' }, async (payload) => {

                // Safely access nested properties
                const record = payload?.payload?.record;
                if (!record || !record.id) {
                    console.error("Missing required data in payload:", payload);
                    return;
                }

                try {
                    // Fetch the generation data
                    const { data: generationData, error: genError } = await supabase
                        .from('user_generations')
                        .select('id, user_id, text_prompt, updated_at')
                        .eq('id', record.id)
                        .single();

                    if (genError || !generationData) {
                        console.error("Error fetching generation data:", genError);
                        return;
                    }

                    // Retry logic to handle race condition where images might not be inserted yet
                    let generatedImages = null;
                    let retryCount = 0;
                    const maxRetries = 10;
                    const retryDelay = 500; // 500ms between retries

                    while (retryCount < maxRetries) {
                        const { data: images, error: imgError } = await supabase
                            .from('generated_images')
                            .select('id, image_path')
                            .eq('generation_id', record.id);

                        if (!imgError && images && images.length > 0) {
                            generatedImages = images;
                            break;
                        }

                        retryCount++;
                        if (retryCount < maxRetries) {
                            await new Promise(resolve => setTimeout(resolve, retryDelay));
                        }
                    }

                    if (!generatedImages || generatedImages.length === 0) {
                        console.error("No generated images found after all retries for generation:", record.id);
                        return;
                    }

                    // Get signed URLs for all images in this generation
                    const imagePaths = generatedImages
                        .map(img => img.image_path)
                        .filter(path => path && path.trim() !== '');

                    if (imagePaths.length === 0) {
                        console.error("No valid image paths found for generation:", record.id);
                        return;
                    }

                    const { data: urlsData, error: urlError } = await supabase
                        .storage
                        .from('generated-images')
                        .createSignedUrls(imagePaths, 60 * 60);

                    if (urlError || !urlsData) {
                        console.error("Error getting signed URLs:", urlError);
                        return;
                    }

                    // Create new image entries using actual database IDs
                    const newImages = generatedImages.map((img: any) => {
                        const urlInfo = urlsData.find(u => u.path === img.image_path);
                        return {
                            id: img.id, // Use actual generated_images.id
                            user_id: generationData.user_id,
                            generated_image_url: urlInfo?.signedUrl || '',
                            text_prompt: generationData.text_prompt,
                            updated_at: generationData.updated_at
                        };
                    });

                    // Add new images to the beginning of the array
                    setImages(currentImages => {
                        const updatedImages = [...newImages, ...currentImages];
                        return updatedImages;
                    });
                } catch (err) {
                    console.error("Error in broadcast handler:", err);
                }
            })
            .on('broadcast', { event: 'DELETE' }, (payload) => {
                //console.log("Delete event received:", payload);
                //setImages(prevImages => prevImages.filter(img => img.id !== payload.payload.id));
            })
            .subscribe()

        return () => {
            changes.unsubscribe();
        }
    }, [user?.id]);

    const value = {
        images,
        setImages,
        loading,
        fetchImages,
        handleDelete,
        handleDownload,
        refreshImages, // Keep this for manual refresh when needed
    }

    return <ImagesContext.Provider value={value}>{children}</ImagesContext.Provider>
}

// Custom hook to use the context
export function useImagesContext() {
    const context = useContext(ImagesContext)
    if (context === undefined) {
        throw new Error('useImagesContext must be used within an ImagesProvider')
    }
    return context
}