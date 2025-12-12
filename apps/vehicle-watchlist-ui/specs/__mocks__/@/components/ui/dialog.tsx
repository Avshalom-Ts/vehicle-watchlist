import React from 'react';

type BaseProps = { children?: React.ReactNode; className?: string };

export const Dialog = ({ children, open }: { children?: React.ReactNode; open?: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null;

export const DialogContent = ({ children, className }: BaseProps) => (
    <div className={className}>{children}</div>
);

export const DialogHeader = ({ children, className }: BaseProps) => (
    <div className={className}>{children}</div>
);

export const DialogTitle = ({ children, className }: BaseProps) => (
    <h2 className={className}>{children}</h2>
);

export const DialogDescription = ({ children, className }: BaseProps) => (
    <p className={className}>{children}</p>
);

export const DialogFooter = ({ children, className }: BaseProps) => (
    <div className={className}>{children}</div>
);
