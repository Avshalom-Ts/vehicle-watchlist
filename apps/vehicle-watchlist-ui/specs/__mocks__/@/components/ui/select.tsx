import React from 'react';

type BaseProps = { children?: React.ReactNode; className?: string };

export const Select = ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="select-root">{children}</div>
);

export const SelectTrigger = ({ children, className }: BaseProps) => (
    <button data-testid="select-trigger" className={className}>{children}</button>
);

export const SelectValue = ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>;

export const SelectContent = ({ children, className }: BaseProps) => (
    <div data-testid="select-content" className={className}>{children}</div>
);

export const SelectItem = ({ children, value, className }: BaseProps & { value?: string }) => (
    <div data-testid={`select-item-${value}`} className={className}>{children}</div>
);
