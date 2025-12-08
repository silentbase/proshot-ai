import React from 'react';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function Container({ children, className = "" }: ContainerProps) {
    return (
        <div className={` px-4 sm:px-6 lg:px-12 ${className}`}> {/*container mx-auto*/}
            {children}
        </div>
    );
}