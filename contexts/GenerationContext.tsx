'use client'

import { createContext, useContext, useRef, useState, ReactNode } from 'react';

interface ProjectData {
    title: string;
    original_image_url: string | null;
    reference_image_urls: string[];
    text_prompt: string;
}

interface GenerationSettings {
    numberOfImages: number;
    outputFormat: 'webp' | 'png' | 'jpeg';
    aspectRatio: '1:1' | '4:3' | '4:5' | '9:16' | '16:9' | '21:9';
}

interface GenerationContextType {
    projectData: ProjectData;
    setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
    imageResults: any[];
    setImageResults: React.Dispatch<React.SetStateAction<any[]>>;
    generationStatus: "ready" | "generating" | "completed" | "error";
    setGenerationStatus: React.Dispatch<React.SetStateAction<"ready" | "generating" | "completed" | "error">>;
    isUploading: boolean;
    setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
    referenceFilesMap: React.MutableRefObject<{ [url: string]: File }>;
    referenceFiles: React.MutableRefObject<File[]>;
    productFile: React.MutableRefObject<File | null>;
    errors: Record<string, string | null>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
    settings: GenerationSettings;
    setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>;
    clearAll: () => void;
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export function GenerationProvider({ children }: { children: ReactNode }) {
    const [projectData, setProjectData] = useState<ProjectData>({
        title: '',
        original_image_url: null,
        reference_image_urls: [],
        text_prompt: '',
    });

    const [imageResults, setImageResults] = useState<any[]>([]);
    const [generationStatus, setGenerationStatus] = useState<"ready" | "generating" | "completed" | "error">("ready");
    const [isUploading, setIsUploading] = useState(false);

    const [settings, setSettings] = useState<GenerationSettings>({
        numberOfImages: 1,
        outputFormat: 'webp',
        aspectRatio: '4:3'
    });

    const referenceFilesMap = useRef<{ [url: string]: File }>({});
    const referenceFiles = useRef<File[]>([]);
    const productFile = useRef<File | null>(null);

    const [errors, setErrors] = useState<Record<string, string | null>>({
        inputPrompt: null,
        productImage: null,
        referenceImage: null
    });

    const clearAll = () => {
        setProjectData({
            title: '',
            original_image_url: null,
            reference_image_urls: [],
            text_prompt: '',
        });
        setImageResults([]);
        setGenerationStatus("ready");
        setIsUploading(false);
        referenceFilesMap.current = {};
        referenceFiles.current = [];
        productFile.current = null;
        setErrors({
            inputPrompt: null,
            productImage: null,
            referenceImage: null
        });
        // Don't reset settings as they should persist
    };

    return (
        <GenerationContext.Provider value={{
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
            settings,
            setSettings,
            clearAll
        }}>
            {children}
        </GenerationContext.Provider>
    );
}

export function useGenerationContext() {
    const context = useContext(GenerationContext);
    if (context === undefined) {
        throw new Error('useGenerationContext must be used within a GenerationProvider');
    }
    return context;
}