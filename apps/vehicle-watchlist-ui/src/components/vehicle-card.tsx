'use client';

import React from 'react';

import { Vehicle } from '@/lib/vehicle-service';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Calendar, Fuel, Palette, User, Car, ExternalLink } from 'lucide-react';

interface VehicleCardProps {
    vehicle: Vehicle;
    onSave?: (vehicle: Vehicle) => void;
    onStar?: (vehicle: Vehicle) => void;
    onClick?: (vehicle: Vehicle) => void;
    showActions?: boolean;
    isInWatchlist?: boolean;
    isStarred?: boolean;
}

export function VehicleCard({
    vehicle,
    onSave,
    onStar,
    onClick,
    isInWatchlist = false,
    isStarred = false,
}: VehicleCardProps) {
    const handleCardClick = (e: React.MouseEvent) => {
        // Don't trigger card click when clicking on buttons
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        onClick?.(vehicle);
    };

    return (
        <Card
            className={`hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer hover:border-primary/50' : ''}`}
            onClick={handleCardClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="w-5 h-5" />
                            {vehicle.commercialName || vehicle.model}
                            {onClick && (
                                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            )}
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                            {vehicle.manufacturer}
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <div className='inline-flex items-center px-1 py-1 rounded-md bg-yellow-300 text-black'>
                            <span className="font-extrabold tracking-wider text-lg border-4 border-black rounded-md p-3 py-1" dir="ltr">
                                {vehicle.licensePlate}
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 text-sm flex-wrap">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Year:</span>
                        <span className="font-medium">{vehicle.year}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <Palette className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Color:</span>
                        <span className="font-medium">{vehicle.color || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Fuel className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Fuel:</span>
                        <span className="font-medium">{vehicle.fuelType || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Ownership:</span>
                        <span className="font-medium">{vehicle.ownership || 'N/A'}</span>
                    </div>
                </div>



                <div className="mt-4 pt-4 border-t flex justify-between gap-2">
                    <div className='flex items-center'>
                        {vehicle.validUntil && (
                            <p className="text-sm">
                                <span className="text-muted-foreground">Test valid until: </span>
                                <span className={`font-medium ${new Date(vehicle.validUntil) < new Date() ? 'text-destructive' : 'text-green-600'}`}>
                                    {new Date(vehicle.validUntil).toLocaleDateString('he-IL')}
                                </span>
                            </p>
                        )}
                    </div>
                    <div className='flex items-center gap-4'>
                        {onSave && (
                            <Button
                                variant={isInWatchlist ? 'secondary' : 'default'}
                                size="sm"
                                onClick={() => onSave(vehicle)}
                                disabled={isInWatchlist}
                            >
                                {isInWatchlist ? 'In Watchlist' : 'Save to Watchlist'}
                            </Button>
                        )}
                        {onStar && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onStar(vehicle)}
                                title={isStarred ? 'Remove star' : 'Star vehicle'}
                            >
                                <Star
                                    className={`w-4 h-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`}
                                />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
