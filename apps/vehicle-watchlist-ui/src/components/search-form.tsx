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
import { useI18n } from '@/lib/i18n-provider';

type SearchType = 'plate' | 'manufacturer' | 'model' | 'color' | 'fuelType' | 'ownership' | 'all';

interface SearchFormProps {
    initialPlate?: string;
    onSearch: (plate: string) => void;
    onFilterSearch?: (filters: VehicleFilters) => void;
    isLoading?: boolean;
}

export function SearchForm({ initialPlate = '', onSearch, onFilterSearch, isLoading = false }: SearchFormProps) {
    const { t } = useI18n();
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
            setError(t('searchForm.enterSearchValue'));
            return;
        }

        if (searchType === 'plate') {
            // License plate validation (7-8 digits, dashes allowed)
            const cleanPlate = searchValue.replace(/-/g, '');
            if (!/^\d{7,8}$/.test(cleanPlate)) {
                setError(t('searchForm.plateValidation'));
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
            setError(t('searchForm.filterNotAvailable'));
        }
    };

    const handleClear = () => {
        setSearchValue('');
        setYearFrom('');
        setYearTo('');
        setError('');
    };

    return (
        <form onSubmit={handleSearch} className="w-full space-y-3">
            {/* Search Type Selector and Input */}
            <div className="flex flex-col gap-3 md:flex-row">
                {/* Search type dropdown - on top for desktop, bottom for mobile (using order) */}
                <Select
                    value={searchType}
                    onValueChange={(value: SearchType) => {
                        setSearchType(value);
                        setError('');
                    }}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full md:w-48 h-12 order-2 md:order-1">
                        <SelectValue placeholder={t('searchForm.searchBy')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="plate">{t('searchForm.licensePlate')}</SelectItem>
                        <SelectItem value="manufacturer">{t('searchForm.manufacturer')}</SelectItem>
                        <SelectItem value="model">{t('searchForm.model')}</SelectItem>
                        <SelectItem value="color">{t('searchForm.color')}</SelectItem>
                        <SelectItem value="fuelType">{t('searchForm.fuelType')}</SelectItem>
                        <SelectItem value="ownership">{t('searchForm.ownership')}</SelectItem>
                        <SelectItem value="all">{t('searchForm.allFilters')}</SelectItem>
                    </SelectContent>
                </Select>

                {/* Input field - first on mobile */}
                <div className="flex-1 relative order-1 md:order-2">
                    <Input
                        type="text"
                        placeholder={t(`searchForm.${searchType}Placeholder`)}
                        value={searchValue}
                        onChange={(e) => {
                            setSearchValue(e.target.value);
                            setError('');
                        }}
                        className="h-12 text-base sm:text-lg pr-10"
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

                {/* Search button - last on both mobile and desktop */}
                <Button type="submit" size="lg" className="h-12 w-full sm:w-auto sm:px-8 order-3" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                        <Search className="w-5 h-5 mr-2" />
                    )}
                    {isLoading ? t('searchForm.searching') : t('searchForm.searchButton')}
                </Button>
            </div>

            {error && (
                <p className="text-sm font-bold tracking-wide text-red-600">{error}</p>
            )}

            {/* Advanced Filters (Year Range) */}
            {searchType !== 'plate' && onFilterSearch && (
                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                    <CollapsibleTrigger asChild>
                        <div className='flex flex-col items-start'>
                            <Button variant="ghost" size="sm" type="button" className="text-muted-foreground h-fit">
                                {showAdvanced ? (
                                    <ChevronUp className="w-4 h-4 mr-2" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 mr-2" />
                                )}
                                {t('searchForm.advancedFilters')}
                            </Button>

                            {/* Help text for "All Filters" mode */}
                            {searchType === 'all' && (
                                <p className="text-xs text-muted-foreground pl-12 pr-3">
                                    {t('searchForm.allFiltersTip')}
                                </p>
                            )}
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                            <div className="space-y-2">
                                <Label htmlFor="yearFrom">{t('searchForm.yearFrom')}</Label>
                                <Input
                                    id="yearFrom"
                                    type="number"
                                    placeholder={t('searchForm.yearFromPlaceholder')}
                                    min="1900"
                                    max="2100"
                                    value={yearFrom}
                                    onChange={(e) => setYearFrom(e.target.value)}
                                    disabled={isLoading}
                                    className="h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="yearTo">{t('searchForm.yearTo')}</Label>
                                <Input
                                    id="yearTo"
                                    type="number"
                                    placeholder={t('searchForm.yearToPlaceholder')}
                                    min="1900"
                                    max="2100"
                                    value={yearTo}
                                    onChange={(e) => setYearTo(e.target.value)}
                                    disabled={isLoading}
                                    className="h-12"
                                />
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            )}


        </form>
    );
}

