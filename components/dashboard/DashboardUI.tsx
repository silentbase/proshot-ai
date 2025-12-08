'use client'
import { useState } from 'react';
import { useGenerationContext } from '@/contexts/GenerationContext';
import { ImageDropZone } from '@/components/dashboard/ImageDropZone';
import { ReferenceImageSelector } from '@/components/dashboard/ReferenceImageSelector';
import { PromptInput } from '@/components/dashboard/PromptInput';
import { ActionBar } from '@/components/dashboard/ActionBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { toast, Toaster } from '../ui/sonner';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { Download, Maximize2 } from 'lucide-react';
import ImageDownloadWrapper from './ImageDownloadWrapper';
import { ImageLightbox } from './ImageLightbox';
import { cn } from '@/lib/utils';
import { useCreditsContext } from '@/contexts/CreditsContext';
import { checkCredits } from '@/utils/stripe/actions';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import Image from 'next/image';

export default function DashboardUI({ authUser }: any) {
    const supabase = createClient();
    const router = useRouter()

    const { spendCredits } = useCreditsContext();

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const {
        projectData,
        setProjectData,
        imageResults,
        setImageResults,
        generationStatus,
        setGenerationStatus,
        isUploading,
        setIsUploading,
        referenceFilesMap,
        referenceFiles,
        productFile,
        errors,
        setErrors,
        settings // Add settings to context
    } = useGenerationContext();

    const uploadImageFile = async (file: File) => {
        try {
            const objectUrl = URL.createObjectURL(file);
            return objectUrl;
        } catch (err) {
            console.error('Preview error:', err);
            toast.error('Fehler beim Vorbereiten der Bildvorschau');
            return null;
        }
    };

    function toBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = error => reject(error)
        })
    }

    const imageGenerationApi = async (images: File[],
        text_prompt: string) => {

        var input_images: string[] = [];
        for (const image of images) {
            if (image) {
                const base64 = await toBase64(image);
                input_images.push(base64);
            }
        }

        const { data, error } = await supabase.functions.invoke('ai-generation', {
            body: {
                input_images: input_images,
                text_prompt: text_prompt,
                settings: {
                    numberOfImages: settings.numberOfImages,
                    outputFormat: settings.outputFormat,
                    aspectRatio: settings.aspectRatio
                }
            }
        });

        if (error && error instanceof FunctionsHttpError) {
            const errorMessage = await error.context.json()

            if (errorMessage.error.status == 413) {
                toast.error('Bild überschreitet die maximal erlaubte Größe.')
                return
            }

            toast.error('Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.')
            console.log('Function returned an error', errorMessage)
        }

        if (error) {
            throw new Error(error);
        }

        return data
    }

    const startGeneration = async () => {

        const { data, error } = await supabase.auth.getUser()
        if (error || !data?.user) {
            router.push('/login')
            return
        }

        const sufficienthCredits = await checkCredits(1)
        if (!sufficienthCredits) {
            toast.error("Nicht genügend Credits")
            return
        }

        if (checkForErrors()) {
            setGenerationStatus("error");
            return;
        }

        setGenerationStatus("generating");

        try {
            setIsUploading(true);
            const userId = authUser?.id

            let originalPath: string | null = null;
            let referencePath: string | null = null;
            let signedOriginalUrl = '';
            let signedReferenceUrl = [];

            // Upload product image if present //


            if (productFile.current) {
                const fileName = `${userId}/${Date.now()}_${productFile.current?.name}`;
                const { error: uploadErr1 } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, productFile.current!);

                if (uploadErr1) throw uploadErr1;
                //save this path to original_image_url in user_generations
                originalPath = fileName;
                const { data: signed1, error: signErr1 } = await supabase.storage
                    .from('product-images')
                    .createSignedUrl(fileName, 60 * 60);

                if (signErr1) throw signErr1;
                signedOriginalUrl = signed1.signedUrl;

            } else if (projectData.original_image_url) {
                signedOriginalUrl = projectData.original_image_url;
            }

            // Upload reference image if present //
            const referenceUrls = [];
            const referencePaths = [];

            if (referenceFiles.current.length > 0) {

                for (const refFile of referenceFiles.current) {
                    const refName = `${userId}/${Date.now()}_${refFile.name}`;

                    const { error: uploadErr2 } = await supabase.storage
                        .from('reference-images')
                        .upload(refName, refFile);

                    if (uploadErr2) throw uploadErr2;
                    referencePaths.push(refName);

                    const { data: signed2, error: signErr2 } = await supabase.storage
                        .from('reference-images')
                        .createSignedUrl(refName, 60 * 60);

                    if (signErr2) throw signErr2;
                    referenceUrls.push(signed2.signedUrl);
                }

                // Use these in your API call
                // referencePaths for database storage
                // referenceUrls for API calls
            } else if (projectData.reference_image_urls) {
                signedReferenceUrl = projectData.reference_image_urls;
            }


            //Call image-generation API
            const generationResponse = await imageGenerationApi([productFile.current!, ...referenceFiles.current!],
                projectData.text_prompt);

            // Extract the image URL from the response
            const generated_images = generationResponse //[{ url: 'http://127.0.0.1:54321/storage/v1/object/sign/generated-images/1966710e-1afa-4982-9475-424d3d893351/1761065836621_055ec0e7-2f84-4010-9bbf-f6219c9e6e63?token=eyJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJnZW5lcmF0ZWQtaW1hZ2VzLzE5NjY3MTBlLTFhZmEtNDk4Mi05NDc1LTQyNGQzZDg5MzM1MS8xNzYxMDY1ODM2NjIxXzA1NWVjMGU3LTJmODQtNDAxMC05YmJmLWY2MjE5YzllNmU2MyIsImlhdCI6MTc2MTEyMTI4OSwiZXhwIjoxNzYzNzEzMjg5fQ.pP_tZgq-XwST0mViOnZC48G_ORJt1VCR7AR8bAJ_Jco' }] //
            //generationResponse;


            const generatedImagePaths = await saveGeneratedImage(generated_images)

            // Store the current aspect ratio setting at generation time
            const generationAspectRatio = settings.aspectRatio;

            // Use Promise.all to generate all signed URLs:
            const generatedImageSignedUrlPromises = generatedImagePaths.map(async (path) => {

                const { data: signedUrl, error: signErr } = await supabase.storage
                    .from('generated-images')
                    .createSignedUrl(path, 60 * 60);

                if (signErr) throw signErr;
                return {
                    image_url: signedUrl.signedUrl,
                    aspectRatio: generationAspectRatio // Use the captured aspect ratio
                };
            });

            // Wait for all signed URLs to be generated
            const generatedImageSignedUrlArray = await Promise.all(generatedImageSignedUrlPromises);

            // Now you have all signed URLs in generatedImageSignedUrlArray


            // Track this generation in our table
            const { data: trackingRow, error: trackErr } = await supabase
                .from('user_generations')
                .insert({
                    user_id: userId,
                    //title: projectData.title,
                    original_image_path: originalPath ?? null,
                    //reference_image_path: referencePath ?? null,
                    text_prompt: projectData.text_prompt || null,
                    //generated_image_path: generatedImagePaths[0] /
                })
                .select()
                .single();

            let usedCredits = 1
            switch (settings.numberOfImages) {
                case 1:
                    usedCredits = 1
                    break;
                case 2:
                    usedCredits = 2
                    break;
                case 3:
                    usedCredits = 3
                    break;
                case 4:
                    usedCredits = 4
                    break;
                default:
                    usedCredits = 1
                    break;
            }

            await spendCredits(usedCredits)

            //new approach
            if (!trackErr && trackingRow) {

                // Prepare batch insert for REFERENCE IMAGES
                const referenceInserts = referencePaths.map(path => ({
                    generation_id: trackingRow.id,
                    image_path: path
                }));

                // Insert all reference images
                const { error: refError } = await supabase
                    .from('reference_images')
                    .insert(referenceInserts);

                if (refError) {
                    console.error('Failed to save reference images:', refError);
                }

                // Prepare batch insert for GENERATION IMAGES
                const generationInserts = generatedImagePaths.map(path => ({
                    generation_id: trackingRow.id,
                    image_path: path
                }));

                // Insert all generated images
                const { error: genError } = await supabase
                    .from('generated_images')
                    .insert(generationInserts);

                if (genError) {
                    console.error('Failed to save generated images:', genError);
                }


            }

            if (trackErr) {
                console.error('user_generations insert error:', trackErr);
            }

            setImageResults(generatedImageSignedUrlArray)
            setIsUploading(false);

            setGenerationStatus("completed");
            toast.success('Fotos erfolgreich generiert');

        } catch (error) {
            console.error('Generation error:', error);
            setGenerationStatus('error')
        };
    }

    // 1. First, modify the saveGeneratedImage function to return simple paths
    const saveGeneratedImage = async (generatedImageData: any) => {
        const userId = authUser?.id;

        // Handle the case where generatedImageData might be an object with images array
        let imagesToProcess = [];

        if (Array.isArray(generatedImageData)) {
            imagesToProcess = generatedImageData;
        } else if (generatedImageData && generatedImageData.images) {
            imagesToProcess = generatedImageData.images;
        } else if (generatedImageData && generatedImageData.url) {
            // Single image case
            imagesToProcess = [generatedImageData];
        } else {
            console.error('Unexpected data structure:', generatedImageData);
            throw new Error('Invalid image data structure');
        }

        // Process each image with Promise.all to wait for all uploads
        const uploadPromises = imagesToProcess.map(async (imageItem: any) => {
            // Handle different possible structures
            const imageUrl = imageItem.url || imageItem.image_url || imageItem;

            if (!imageUrl || typeof imageUrl !== 'string') {
                console.error('Invalid image URL:', imageItem);
                throw new Error('Invalid image URL');
            }

            // Fetch the image
            const response = await fetch(imageUrl);
            const blob = await response.blob();

            // Create a unique filename
            const filePath = `${userId}/${Date.now()}_${crypto.randomUUID()}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from("generated-images")
                .upload(filePath, blob);

            if (error) throw error;

            console.log("Stored at:", data.path);
            return data.path; // Just return the path string
        });

        // Wait for all uploads to complete and return simple path strings
        return await Promise.all(uploadPromises);
    }



    const canStartGeneration = Boolean(
        projectData.title?.trim() &&
        (projectData.original_image_url ||
            projectData.reference_image_urls ||
            projectData.text_prompt?.trim())
    );

    const hasGeneratedResults = imageResults.length > 0;

    const checkForErrors = () => {
        var isError = false;
        setErrors(prev => ({ ...prev, inputPrompt: null, productImage: null, referenceImage: null }));

        if (projectData.text_prompt.length < 5) {
            setErrors(prev => ({ ...prev, inputPrompt: "Die Beschreibung muss mindestens 5 Zeichen lang sein." }));
            isError = true;
        }
        if (!projectData.text_prompt.length) {
            setErrors(prev => ({ ...prev, inputPrompt: "Bitte fügen Sie eine Beschreibung hinzu." }));
            isError = true;
        }
        if (!projectData.original_image_url) {
            setErrors(prev => ({ ...prev, productImage: "Bitte laden Sie ein Produktbild hoch." }));
            isError = true;
        }
        return isError;
    }

    // Update your image results display:

    // Helper function to determine aspect ratio class
    const getAspectRatioClass = (ratio: string) => {
        switch (ratio) {
            case '1:1': return 'aspect-square';
            case '4:3': return 'aspect-[4/3]';
            case '3:4': return 'aspect-[3/4]';
            case '16:9': return 'aspect-[16/9]';
            case '9:16': return 'aspect-[9/16]';
            case '21:9': return 'aspect-[21/9]';
            default: return 'aspect-square';
        }
    };

    return (
        <main>
            <div className="w-full bg-muted/30">
                <div className="flex w-full">
                    <div className="flex-1 flex">
                        <main className="flex-1 flex flex-col">
                            <div className="flex-1 p-6">
                                <div className="max-w-5xl mx-auto space-y-6">
                                    {/* Project Title */}
                                    {/*<Card className="card-elegant">
                                        <CardHeader>
                                            <CardTitle>Project Setup</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">Project Title</label>
                                                <input
                                                    type="text"
                                                    value={projectData.title}
                                                    onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
                                                    placeholder="Enter project title..."
                                                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                                                    disabled={generationStatus === "generating"}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card> */}

                                    {/* Product Image Upload */}
                                    <Card className="card-elegant">
                                        <CardHeader>
                                            <CardTitle>Produktbild</CardTitle>
                                        </CardHeader>
                                        <CardContent>

                                            <ImageDropZone
                                                onImageUpload={async (file) => {
                                                    //const url = await uploadImageFile(file);
                                                    const url = URL.createObjectURL(file)
                                                    if (url) {
                                                        setProjectData(prev => ({ ...prev, original_image_url: url }));
                                                        productFile.current = file
                                                    }
                                                    return url;
                                                }}
                                                uploadedImageUrl={projectData.original_image_url}
                                                onImageRemove={() => {
                                                    setProjectData(prev => ({ ...prev, original_image_url: null }));
                                                    productFile.current = null
                                                }}
                                                disabled={generationStatus === "generating"}
                                                errorMsg={errors.productImage}
                                            />
                                        </CardContent>
                                    </Card>

                                    {/* Reference Image Selection */}
                                    <Card className="card-elegant">
                                        <CardHeader>
                                            <CardTitle>Referenz-Stil</CardTitle>
                                        </CardHeader>
                                        <CardContent>

                                            <ReferenceImageSelector
                                                onImageUpload={async (file) => {
                                                    const url = URL.createObjectURL(file);
                                                    referenceFilesMap.current[url] = file;
                                                    return url;
                                                }}
                                                onImagesChange={(urls) => {
                                                    setProjectData(prev => ({ ...prev, reference_image_urls: urls }));

                                                    // Update reference files array based on selected URLs
                                                    referenceFiles.current = urls.map(url => referenceFilesMap.current[url]).filter(Boolean);
                                                }}
                                                selectedImageUrls={projectData.reference_image_urls}
                                                disabled={generationStatus === "generating"}
                                            />
                                        </CardContent>
                                    </Card>

                                    {/* Prompt Input */}
                                    <Card className="card-elegant">
                                        <CardHeader>
                                            <CardTitle>Beschreibung</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <PromptInput
                                                value={projectData.text_prompt || ''}
                                                onChange={(value) => setProjectData(prev => ({ ...prev, text_prompt: value }))}
                                                placeholder="Beschreiben Sie den Hintergrund und Stil für Ihr Produkt..."
                                                disabled={generationStatus === "generating"}
                                                errorMsg={errors.inputPrompt}
                                            />
                                        </CardContent>
                                    </Card>

                                    {/* Generated Images Results */}
                                    {true && (
                                        <Card className="card-elegant">
                                            <CardHeader>
                                                <CardTitle>Generierte Bilder</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {imageResults.length === 0 ? (
                                                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                                                        <p className="text-center">Noch keine Bilder generiert</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {imageResults.map((image, index) => (
                                                            <div
                                                                key={index}
                                                                className={cn(
                                                                    "relative bg-muted rounded-lg overflow-hidden group",
                                                                    getAspectRatioClass(image.aspectRatio || settings.aspectRatio)
                                                                )}
                                                            >
                                                                <NextImage
                                                                    src={image.image_url}
                                                                    alt={`KI-generiertes Produktbild ${index + 1}`}
                                                                    fill
                                                                    className="object-cover"
                                                                    sizes="(max-width: 768px) 50vw, 33vw"
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition">
                                                                    <ImageDownloadWrapper
                                                                        imageUrl={image.image_url}
                                                                        imageName={`generated_${index}.${settings.outputFormat}`}
                                                                    >
                                                                        <span className="text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                                                            <Download />
                                                                        </span>
                                                                    </ImageDownloadWrapper>
                                                                </div>
                                                                {/* Expand Icon */}
                                                                <button
                                                                    onClick={() => {
                                                                        setLightboxIndex(index);
                                                                        setLightboxOpen(true);
                                                                    }}
                                                                    className="absolute bottom-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition z-10"
                                                                    aria-label="Vergrößern"
                                                                >
                                                                    <Maximize2 className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>

                            {/* Action Bar */}
                            <ActionBar
                                status={generationStatus}
                                onGenerate={startGeneration}
                                onExport={() => {
                                    if (imageResults.length > 0) {
                                        imageResults.forEach((image) => {
                                            //downloadImageFile(image.image_url, `generated_${image.id}.webp`);
                                        });
                                    }
                                }}
                                canGenerate={true}
                                hasResults={true}
                            />
                        </main>

                        {/* Right Panel */}
                        {/*  <div className="hidden xl:block w-80 p-6 border-l border-border bg-card/30">
                            <Card className="card-elegant">
                                <CardHeader>
                                    <CardTitle className="text-sm">Tipps</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground space-y-2">
                                    <p>• Laden Sie ein klares Produktbild für beste Ergebnisse hoch</p>
                                    <p>• Verwenden Sie Referenzbilder um den Stil zu bestimmen</p>
                                    <p>• Seien Sie spezifisch in Ihren Beschreibungen</p>
                                    <p>• Probieren Sie verschiedene Kombinationen für Abwechslung</p>
                                </CardContent>
                            </Card>
                        </div>*/}
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <ImageLightbox
                    images={imageResults.map(img => ({ url: img.image_url, aspectRatio: img.aspectRatio }))}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                    onNavigate={setLightboxIndex}
                />
            )}
        </main>
    )
}


