'use client'

import downloadImageFile from "@/utils/helpers/downloadImageFile";

interface ImageDownloadWrapperProps {
    imageUrl: string;
    imageName: string
    children: React.ReactNode
}

export default function ImageDownloadWrapper({ imageUrl, imageName, children }: ImageDownloadWrapperProps) {

    return (

        <div
            onClick={() => { downloadImageFile(imageUrl, imageName) }}

            className="space-y-3 cursor-pointer"
        >
            {children}
        </div>
    )
}