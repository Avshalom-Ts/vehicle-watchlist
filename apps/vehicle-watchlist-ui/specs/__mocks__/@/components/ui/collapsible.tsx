import React from 'react';

export const Collapsible = ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="collapsible">{children}</div>
);

export const CollapsibleTrigger = ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
);

export const CollapsibleContent = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
