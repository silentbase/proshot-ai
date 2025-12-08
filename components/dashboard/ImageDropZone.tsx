'use client'
import { useState, useCallback } from "react";
import NextImage from 'next/image';
import { useDropzone } from "react-dropzone";
import { Upload, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageDropZoneProps {
    onImageUpload: (file: File) => Promise<string | null>;
    uploadedImageUrl?: string | null;
    fileName?: string | 'Product Image',
    onImageRemove?: () => void;
    disabled?: boolean;
    errorMsg: string | null
}

export function ImageDropZone({
    onImageUpload,
    uploadedImageUrl,
    onImageRemove,
    disabled,
    errorMsg
}: ImageDropZoneProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState('');

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0 && !disabled) {
            setIsUploading(true);
            await onImageUpload(acceptedFiles[0]);
            setIsUploading(false);
            setFileName(acceptedFiles[0].name)
        }
    }, [onImageUpload, disabled]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        multiple: false
    });

    if (uploadedImageUrl) {
        return (
            <div className="relative group">
                <div className="aspect-video bg-muted rounded-xl overflow-hidden border-2 border-border shadow-sm">
                    <NextImage
                        src={uploadedImageUrl}
                        alt="Hochgeladenes Produktbild"
                        fill
                        className="object-contain bg-white"
                        onError={(e) => {
                            console.error('Image failed to load:', uploadedImageUrl);
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEyVjE5QTIgMiAwIDAgMSAxOSAyMUg1QTIgMiAwIDAgMSAzIDE5VjVBMiAyIDAgMCAxIDUgM0gxMiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik05IDlIMTVWMTVIOVY5WiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                        }}
                    />
                </div>

                {/* Image info overlay */}
                <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-muted-foreground">{fileName ?? 'Produktbild'}</p>
                </div>

                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="bg-background/90 backdrop-blur-sm shadow-sm"
                        onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                    setIsUploading(true);
                                    await onImageUpload(file);
                                    setIsUploading(false);
                                }
                            };
                            input.click();
                        }}
                        disabled={disabled || isUploading}
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Anderes Bild
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        className="backdrop-blur-sm shadow-sm"
                        onClick={onImageRemove}
                        disabled={disabled}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {isUploading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin h-10 w-10 border-3 border-primary border-t-transparent rounded-full" />
                            <span className="text-sm font-medium text-foreground">Bild wird hochgeladen...</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={cn(
                "aspect-video border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                "flex flex-col items-center justify-center gap-4 p-8",
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                disabled && "cursor-not-allowed opacity-50"
            )}
        >
            <input {...getInputProps()} disabled={disabled} />

            {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full" />
                    <p className="text-base font-medium text-foreground">Wird hochgeladen...</p>
                </div>
            ) : (
                <>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-primary" />
                    </div>

                    <div className="text-center">
                        <p className="text-lg font-medium text-foreground mb-1">
                            {isDragActive ? "Bild hier ablegen" : "Produktbild hier ablegen"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            oder klicken um zu durchsuchen • PNG, JPG, WEBP bis zu 5MB
                        </p>
                    </div>
                </>
            )}
            {errorMsg && <div className="text-sm text-red-500 mt-2">{errorMsg}</div>}
        </div>
    );
}