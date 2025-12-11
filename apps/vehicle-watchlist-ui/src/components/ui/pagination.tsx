'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className,
}: PaginationProps) {
    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const showEllipsisStart = currentPage > 3;
        const showEllipsisEnd = currentPage < totalPages - 2;

        if (totalPages <= 7) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (showEllipsisStart) {
                pages.push('ellipsis');
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }

            if (showEllipsisEnd) {
                pages.push('ellipsis');
            }

            // Always show last page
            if (!pages.includes(totalPages)) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const handleClick = (page: number) => {
        console.log('Pagination button clicked, page:', page);
        onPageChange(page);
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav
            className={cn('flex items-center justify-center gap-1', className)}
            aria-label="Pagination"
        >
            {/* Previous Button */}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleClick(currentPage - 1)}
                disabled={currentPage <= 1}
                className="gap-1"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) =>
                    page === 'ellipsis' ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="flex h-9 w-9 items-center justify-center"
                        >
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </span>
                    ) : (
                        <Button
                            type="button"
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleClick(page)}
                            className="h-9 w-9 p-0"
                        >
                            {page}
                        </Button>
                    )
                )}
            </div>

            {/* Next Button */}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleClick(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="gap-1"
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </nav>
    );
}

interface PaginationInfoProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    className?: string;
}

export function PaginationInfo({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    className,
}: PaginationInfoProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <p className={cn('text-sm text-muted-foreground', className)}>
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems.toLocaleString()}</span> results
        </p>
    );
}
