'use client'

import { useState } from "react";
import NextImage from 'next/image';
import { Button } from "@/components/ui/button";
import { Upload, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReferenceImageSelectorProps {
    onImageUpload: (file: File) => Promise<string | null>;
    onImagesChange: (urls: string[]) => void;
    selectedImageUrls: string[];
    disabled?: boolean;
}

export function ReferenceImageSelector({
    onImageUpload,
    onImagesChange,
    selectedImageUrls,
    disabled
}: ReferenceImageSelectorProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const MAX_FILES = 5;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || disabled) return;

        // Check if adding these files would exceed the maximum
        if (selectedImageUrls.length + e.target.files.length > MAX_FILES) {
            setError(`You can upload a maximum of ${MAX_FILES} reference images`);
            e.target.value = '';

            return;
        }

        setError(null);
        const files = Array.from(e.target.files);
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const newUrls = [];
            let completed = 0;

            // Process files sequentially to avoid overwhelming the server
            for (const file of files) {
                const url = await onImageUpload(file);
                if (url) {
                    newUrls.push(url);
                }

                // Update progress
                completed++;
                setUploadProgress(Math.round((completed / files.length) * 100));
            }

            if (newUrls.length > 0) {
                // Add all new URLs to the existing selection
                onImagesChange([...selectedImageUrls, ...newUrls]);
            }
        } catch (error) {
            console.error("Error uploading images:", error);
            setError("Error uploading images. Please try again.");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            // Reset the input
            e.target.value = '';
        }
    };

    const handleRemoveImage = (urlToRemove: string) => {
        if (disabled) return;
        onImagesChange(selectedImageUrls.filter(url => url !== urlToRemove));
    };

    // Determine if we should show the upload button
    const showUploadButton = selectedImageUrls.length < MAX_FILES;

    return (
        <div className="space-y-4">
            {/* Information text */}
            {/*{selectedImageUrls.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    Upload reference images to influence the style of your generated product images.
                </p>
            )}*/}

            {/* Error message */}
            {error && (
                <div className="text-sm text-destructive flex items-center gap-2 bg-destructive/10 p-2 rounded">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            {/* Upload counter */}
            <div className="text-xs text-muted-foreground">
                {selectedImageUrls.length} of {MAX_FILES} images uploaded
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Upload button - only show if under the limit */}
                {showUploadButton && (
                    <div className="relative border border-dashed rounded-md aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={disabled || isUploading}
                            multiple
                        />
                        <div className="flex flex-col items-center justify-center p-4 text-muted-foreground">
                            {isUploading ? (
                                <div className="space-y-2 text-center">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                    <div className="text-xs">{uploadProgress}%</div>
                                </div>
                            ) : (
                                <>
                                    <Upload className="h-8 w-8 mb-2" />
                                    <span className="text-xs text-center">Upload (max {MAX_FILES})</span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Selected images */}
                {selectedImageUrls.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative rounded-md border overflow-hidden aspect-square group">
                        <NextImage
                            src={url}
                            alt={`Referenzbild ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, 150px"
                            onError={(e) => {
                                // Handle image loading error
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
                            }}
                        />
                        {!disabled && (
                            <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer"
                                onClick={() => handleRemoveImage(url)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}