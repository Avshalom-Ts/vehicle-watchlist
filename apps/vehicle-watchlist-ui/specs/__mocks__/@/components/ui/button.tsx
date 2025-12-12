import React from 'react';

export const Button = ({ children, className, onClick, disabled, type, title }: { children?: React.ReactNode; className?: string; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit' | 'reset'; title?: string }) => (
    <button className={className} onClick={onClick} disabled={disabled} type={type} title={title}>
        {children}
    </button>
);
