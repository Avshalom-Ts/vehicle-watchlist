'use client';

import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Search, Loader2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { VehicleFilters } from '@/lib/vehicle-service';

type SearchType = 'plate' | 'manufacturer' | 'model' | 'color' | 'fuelType' | 'ownership' | 'all';

interface SearchFormProps {
    initialPlate?: string;
    onSearch: (plate: string) => void;
    onFilterSearch?: (filters: VehicleFilters) => void;
    isLoading?: boolean;
}

const searchTypeLabels: Record<SearchType, string> = {
    plate: 'License Plate',
    manufacturer: 'Manufacturer',
    model: 'Model',
    color: 'Color',
    fuelType: 'Fuel Type',
    ownership: 'Ownership',
    all: 'All Filters',
};

const searchTypePlaceholders: Record<SearchType, string> = {
    plate: 'Enter license plate number (e.g., 1234567)',
    manufacturer: 'Enter manufacturer (e.g., Toyota)',
    model: 'Enter model name',
    color: 'Enter color (e.g., White)',
    fuelType: 'Enter fuel type (e.g., Petrol, Diesel)',
    ownership: 'Enter ownership type (e.g., Private)',
    all: 'manufacturer model color fuelType ownership yearFrom-yearTo',
};

export function SearchForm({ initialPlate = '', onSearch, onFilterSearch, isLoading = false }: SearchFormProps) {
    const [searchType, setSearchType] = useState<SearchType>('plate');
    const [searchValue, setSearchValue] = useState(initialPlate);
    const [error, setError] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Advanced filters
    const [yearFrom, setYearFrom] = useState('');
    const [yearTo, setYearTo] = useState('');

    const parseAllFilters = (value: string): VehicleFilters => {
        const parts = value.trim().split(/\s+/);
        const filters: VehicleFilters = {};

        for (const part of parts) {
            // Check for year range (e.g., 2010-2020)
            if (/^\d{4}-\d{4}$/.test(part)) {
                const [from, to] = part.split('-');
                filters.yearFrom = parseInt(from);
                filters.yearTo = parseInt(to);
            }
            // Check for single year
            else if (/^\d{4}$/.test(part)) {
                filters.yearFrom = parseInt(part);
                filters.yearTo = parseInt(part);
            }
            // Otherwise treat as text filter (manufacturer, model, color, etc.)
            else if (part.length > 0) {
                // Try to match common patterns
                if (!filters.manufacturer) {
                    filters.manufacturer = part;
                } else if (!filters.model) {
                    filters.model = part;
                } else if (!filters.color) {
                    filters.color = part;
                }
            }
        }

        return filters;
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!searchValue.trim()) {
            setError('Please enter a search value');
            return;
        }

        if (searchType === 'plate') {
            // License plate validation (7-8 digits, dashes allowed)
            const cleanPlate = searchValue.replace(/-/g, '');
            if (!/^\d{7,8}$/.test(cleanPlate)) {
                setError('License plate must be 7-8 digits');
                return;
            }
            onSearch(searchValue);
        } else if (onFilterSearch) {
            let filters: VehicleFilters = {};

            if (searchType === 'all') {
                filters = parseAllFilters(searchValue);
            } else {
                filters[searchType] = searchValue;
            }

            // Add year filters if set
            if (yearFrom) filters.yearFrom = parseInt(yearFrom);
            if (yearTo) filters.yearTo = parseInt(yearTo);

            onFilterSearch(filters);
        } else {
            // Fallback: show error if trying non-plate search without filter handler
            setError('Filter search not available. Please select "License Plate" to search.');
        }
    };

    const handleClear = () => {
        setSearchValue('');
        setYearFrom('');
        setYearTo('');
        setError('');
    };

    return (
        <form onSubmit={handleSearch} className="w-full space-y-1">
            {/* Search Type Selector and Input */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Select
                    value={searchType}
                    onValueChange={(value: SearchType) => {
                        setSearchType(value);
                        setError('');
                    }}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full sm:w-48 h-12">
                        <SelectValue placeholder="Search by..." />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(searchTypeLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex-1 relative">
                    <Input
                        type="text"
                        placeholder={searchTypePlaceholders[searchType]}
                        value={searchValue}
                        onChange={(e) => {
                            setSearchValue(e.target.value);
                            setError('');
                        }}
                        className="h-12 text-lg pr-10"
                        dir={searchType === 'plate' ? 'ltr' : 'auto'}
                        disabled={isLoading}
                    />
                    {searchValue && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <Button type="submit" size="lg" className="h-12 px-8" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                        <Search className="w-5 h-5 mr-2" />
                    )}
                    {isLoading ? 'Searching...' : 'Search'}
                </Button>
            </div>

            {error && (
                <p className="text-sm font-bold tracking-wide text-red-600">{error}</p>
            )}

            {/* Advanced Filters (Year Range) */}
            {searchType !== 'plate' && onFilterSearch && (
                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" type="button" className="text-muted-foreground">
                            {showAdvanced ? (
                                <ChevronUp className="w-4 h-4 mr-2" />
                            ) : (
                                <ChevronDown className="w-4 h-4 mr-2" />
                            )}
                            Advanced Filters
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                        <div className="grid grid-cols-2 gap-4 max-w-md">
                            <div className="space-y-2">
                                <Label htmlFor="yearFrom">Year From</Label>
                                <Input
                                    id="yearFrom"
                                    type="number"
                                    placeholder="1990"
                                    min="1900"
                                    max="2100"
                                    value={yearFrom}
                                    onChange={(e) => setYearFrom(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="yearTo">Year To</Label>
                                <Input
                                    id="yearTo"
                                    type="number"
                                    placeholder="2024"
                                    min="1900"
                                    max="2100"
                                    value={yearTo}
                                    onChange={(e) => setYearTo(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            )}

            {/* Help text for "All Filters" mode */}
            {searchType === 'all' && (
                <p className="text-xs text-muted-foreground">
                    Tip: Enter multiple search terms separated by spaces. Use year range like "2010-2020".
                    Example: "Toyota Corolla White 2015-2020"
                </p>
            )}
        </form>
    );
}

