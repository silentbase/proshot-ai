'use client'
import { useEffect, useCallback } from 'react';
import NextImage from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
    images: { id?: string; url: string; aspectRatio?: string }[];
    currentIndex: number;
    onClose: () => void;
    onNavigate: (index: number) => void;
}

export function ImageLightbox({ images, currentIndex, onClose, onNavigate }: ImageLightboxProps) {
    const currentImage = images[currentIndex];

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            onNavigate(currentIndex - 1);
        }
    }, [currentIndex, onNavigate]);

    const handleNext = useCallback(() => {
        if (currentIndex < images.length - 1) {
            onNavigate(currentIndex + 1);
        }
    }, [currentIndex, images.length, onNavigate]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                handlePrevious();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, handlePrevious, handleNext]);

    // Prevent body scroll when lightbox is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
                aria-label="Schließen"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-white/10 text-white text-sm">
                {currentIndex + 1} / {images.length}
            </div>

            {/* Previous Button */}
            {currentIndex > 0 && (
                <button
                    onClick={handlePrevious}
                    className="absolute left-8 md:left-12 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
                    aria-label="Vorheriges Bild"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
            )}

            {/* Next Button */}
            {currentIndex < images.length - 1 && (
                <button
                    onClick={handleNext}
                    className="absolute right-8 md:right-12 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
                    aria-label="Nächstes Bild"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
            )}

            {/* Image Container */}
            <div className="w-full h-full flex items-center justify-center p-16 relative">
                <NextImage
                    src={currentImage.url}
                    alt={`Generiertes Bild ${currentIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                />
            </div>

            {/* Click backdrop to close */}
            <div
                className="absolute inset-0 -z-10"
                onClick={onClose}
            />
        </div>
    );
}
