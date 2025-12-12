import React from 'react';

export const Label = ({ children, className, htmlFor }: { children?: React.ReactNode; className?: string; htmlFor?: string }) => (
    <label className={className} htmlFor={htmlFor}>{children}</label>
);
