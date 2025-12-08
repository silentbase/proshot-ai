import React from 'react';

interface PageWrapperProps {
    children: React.ReactNode;
    className?: string;
    fullWidth?: boolean;
}

interface SectionProps {
    children: React.ReactNode;
    className?: string;
}

export function PageWrapper({ children, className = "", fullWidth = false }: PageWrapperProps) {
    return (
        <div className={`flex flex-col min-h-screen ${className}`}>
            {children}
        </div>
    );
}

export function Header({ children, className = "" }: SectionProps) {
    return (
        <header className={`w-full ${className}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {children}
            </div>
        </header>
    );
}

export function Main({ children, className = "" }: SectionProps) {
    return (
        <main className={`flex-grow w-full ${className}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </div>
        </main>
    );
}

export function Footer({ children, className = "" }: SectionProps) {
    return (
        <footer className={`w-full ${className}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </div>
        </footer>
    );
}