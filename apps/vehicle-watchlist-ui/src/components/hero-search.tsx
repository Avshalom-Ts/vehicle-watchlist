'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface HeroSearchProps {
    className?: string;
}

export function HeroSearch({ className }: HeroSearchProps) {
    const [plate, setPlate] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validation (7-8 digits, dashes allowed)
        const cleanPlate = plate.replace(/-/g, '');
        if (!/^\d{7,8}$/.test(cleanPlate)) {
            setError('License plate must be 7-8 digits');
            return;
        }

        // Navigate to search page with plate as query param
        router.push(`/search?plate=${encodeURIComponent(plate)}`);
    };

    return (
        <form onSubmit={handleSearch} className={className}>
            <div className="flex flex-col sm:flex-row gap-3 mx-auto">
                <div className="flex-1">
                    <Input
                        type="text"
                        placeholder="Enter license plate (e.g., 8689365)"
                        value={plate}
                        onChange={(e) => {
                            setPlate(e.target.value);
                            setError('');
                        }}
                        className="h-12 text-lg text-center"
                        dir="ltr"
                    />
                    {error && (
                        <p className="text-sm text-destructive mt-1">{error}</p>
                    )}
                </div>
                <Button type="submit" size="lg" className="h-12 px-8">
                    <Search className="w-5 h-5 mr-2" />
                    Search
                </Button>
            </div>
        </form>
    );
}
