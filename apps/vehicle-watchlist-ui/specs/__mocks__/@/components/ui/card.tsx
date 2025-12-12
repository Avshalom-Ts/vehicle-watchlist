import React from 'react';

type BaseProps = { children?: React.ReactNode; className?: string };

export const Card = ({ children, className, onClick }: BaseProps & { onClick?: () => void }) => (
    <div className={className} onClick={onClick}>{children}</div>
);

export const CardHeader = ({ children, className }: BaseProps) => (
    <div className={className}>{children}</div>
);

export const CardContent = ({ children, className }: BaseProps) => (
    <div className={className}>{children}</div>
);

export const CardTitle = ({ children, className }: BaseProps) => (
    <h3 className={className}>{children}</h3>
);

export const CardDescription = ({ children, className }: BaseProps) => (
    <p className={className}>{children}</p>
);

export const CardFooter = ({ children, className }: BaseProps) => (
    <div className={className}>{children}</div>
);
