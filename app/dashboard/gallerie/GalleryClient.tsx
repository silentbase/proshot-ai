'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, MoreVertical, Trash2, Maximize2 } from 'lucide-react'
import { useImagesContext, UserGeneration } from '@/contexts/ImagesContext'
import { ImageLightbox } from '@/components/dashboard/ImageLightbox'
import Image from 'next/image'

interface GalleryClientProps {
    initialImages: UserGeneration[]
}

export default function GalleryClient({ initialImages }: GalleryClientProps) {
    const { images, setImages, handleDelete, handleDownload } = useImagesContext()
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxIndex, setLightboxIndex] = useState(0)

    // Hydrate context with server-fetched data
    useEffect(() => {
        setImages(initialImages)
    }, [initialImages, setImages])

    return (
        <main className='container-padding pr-0' onClick={e => {
            e.stopPropagation();
            setMenuOpenId(null);
        }}>
            <Card className="card-elegant">
                <CardHeader>
                    <CardTitle>Gallerie</CardTitle>
                </CardHeader>
                <CardContent>
                    {images.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                            <p className="text-center">Noch keine Bilder in der Galerie</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 ">
                            {images.map((image, index) => (
                                <div key={image.id} className="space-y-3">
                                    <div className="relative bg-muted rounded-lg aspect-square group">
                                        <Image
                                            src={image.generated_image_url}
                                            alt={`Generiertes Werbebild ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                                        />
                                        <button
                                            className="absolute top-2 right-2 z-50 p-1 rounded-full bg-black/80 text-white opacity-0 group-hover:opacity-100 transition"
                                            onClick={e => {
                                                e.stopPropagation();
                                                setMenuOpenId(image.id === menuOpenId ? null : image.id);
                                            }}
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        {/* Expand Icon */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setLightboxIndex(index);
                                                setLightboxOpen(true);
                                            }}
                                            className="absolute bottom-2 left-2 z-50 p-1 rounded-full bg-black/80 text-white opacity-0 group-hover:opacity-100 transition"
                                            aria-label="Vergrößern"
                                        >
                                            <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
                                        </button>

                                        {menuOpenId === image.id && (
                                            <div className="absolute top-9 right-2 z-50 bg-background shadow-border shadow-sm rounded w-32 flex flex-col">
                                                <button
                                                    className="flex items-center gap-2 px-4 py-3 dark:hover:bg-muted hover:bg-global_grey text-sm"
                                                    onClick={() => {
                                                        handleDownload(image.generated_image_url, `generated_${image.id}`);
                                                        setMenuOpenId(null);
                                                    }}
                                                >
                                                    <Download size={16} /> Download
                                                </button>
                                                <button
                                                    className="flex items-center gap-2 px-4 py-3 dark:hover:bg-muted hover:bg-red-100 text-sm text-red-600"
                                                    onClick={() => {
                                                        handleDelete(image.id);
                                                        setMenuOpenId(null);
                                                    }}
                                                >
                                                    <Trash2 size={16} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(image.updated_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Lightbox */}
            {lightboxOpen && (
                <ImageLightbox
                    images={images.map(img => ({ id: img.id, url: img.generated_image_url }))}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                    onNavigate={setLightboxIndex}
                />
            )}
        </main>
    )
}
