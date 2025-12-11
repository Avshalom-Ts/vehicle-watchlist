'use client';

import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Vehicle, VehicleService, ExtendedVehicleDetails } from '@/lib/vehicle-service';
import {
    Car,
    Calendar,
    Palette,
    Fuel,
    User,
    Shield,
    Gauge,
    CircleDot,
    Hash,
    Factory,
    FileText,
    Clock,
    AlertCircle,
    Loader2,
    Cog,
    Tag,
    Activity,
} from 'lucide-react';

interface VehicleDetailsModalProps {
    vehicle: Vehicle | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface DetailRowProps {
    icon: React.ReactNode;
    label: string;
    value: string | number | null | undefined;
    highlight?: boolean;
    status?: 'success' | 'warning' | 'error';
}

function DetailRow({ icon, label, value, highlight, status }: DetailRowProps) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const statusClasses = {
        success: 'text-green-600 dark:text-green-400',
        warning: 'text-yellow-600 dark:text-yellow-400',
        error: 'text-destructive',
    };

    return (
        <div className={`flex items-start gap-2 py-2 ${highlight ? 'bg-primary/5 -mx-2 px-2 rounded-md' : ''}`}>
            <div className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`font-medium text-sm break-words ${status ? statusClasses[status] : ''} ${highlight ? 'text-primary' : ''}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 border-b pb-2">
                {title}
            </h4>
            <div className="space-y-1">{children}</div>
        </div>
    );
}

export function VehicleDetailsModal({ vehicle, open, onOpenChange }: VehicleDetailsModalProps) {
    const [extendedDetails, setExtendedDetails] = useState<ExtendedVehicleDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchedPlate, setFetchedPlate] = useState<string | null>(null);

    // Fetch extended details when modal opens with a new vehicle
    useEffect(() => {
        if (!open || !vehicle?.licensePlate) {
            return;
        }

        // Don't refetch if we already have data for this plate
        if (fetchedPlate === vehicle.licensePlate && extendedDetails) {
            return;
        }

        const fetchExtendedDetails = async () => {
            setIsLoading(true);
            setError(null);

            const result = await VehicleService.getExtendedDetails(vehicle.licensePlate);

            setIsLoading(false);

            if (!result.success) {
                setError(result.error || 'Failed to load extended details');
                return;
            }

            setExtendedDetails(result.data);
            setFetchedPlate(vehicle.licensePlate);
        };

        fetchExtendedDetails();
    }, [open, vehicle?.licensePlate, fetchedPlate, extendedDetails]);

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            // Use a small delay to avoid race conditions with closing animation
            const timeout = setTimeout(() => {
                setExtendedDetails(null);
                setError(null);
                setFetchedPlate(null);
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [open]);

    if (!vehicle) {
        return null;
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return null;
        try {
            return new Date(dateStr).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const isTestExpired = vehicle.validUntil && new Date(vehicle.validUntil) < new Date();
    const isTestExpiringSoon = vehicle.validUntil && !isTestExpired &&
        new Date(vehicle.validUntil) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className='flex flex-row justify-between px-4'>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Car className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                {vehicle.commercialName || vehicle.model}
                            </DialogTitle>
                            <DialogDescription className="text-base">
                                {vehicle.manufacturer} • {vehicle.year}
                            </DialogDescription>
                        </div>
                    </div>
                    {/* License Plate Badge */}
                    <div className="mt-4 flex justify-end">
                        <div className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-300 text-black">
                            <span className="font-extrabold tracking-wider text-2xl border-4 border-black rounded-md p-4 py-2" dir="ltr">
                                {vehicle.licensePlate}
                            </span>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-2 space-y-3">
                    {/* Test Status Alerts */}
                    {isTestExpired && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">Vehicle test has expired!</span>
                        </div>
                    )}
                    {isTestExpiringSoon && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">Vehicle test expires within 30 days</span>
                        </div>
                    )}

                    {/* Basic Info Section - 3 columns */}
                    <DetailSection title="Basic Information">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4">
                            <DetailRow
                                icon={<Hash className="w-4 h-4" />}
                                label="License Plate"
                                value={vehicle.licensePlate}
                            />
                            <DetailRow
                                icon={<Factory className="w-4 h-4" />}
                                label="Manufacturer"
                                value={vehicle.manufacturer}
                            />
                            <DetailRow
                                icon={<Hash className="w-4 h-4" />}
                                label="Manufacturer Code"
                                value={vehicle.manufacturerCode || null}
                            />
                            <DetailRow
                                icon={<Car className="w-4 h-4" />}
                                label="Model"
                                value={vehicle.model}
                            />
                            <DetailRow
                                icon={<Hash className="w-4 h-4" />}
                                label="Model Code"
                                value={vehicle.modelCode || null}
                            />
                            <DetailRow
                                icon={<FileText className="w-4 h-4" />}
                                label="Model Type"
                                value={vehicle.modelType}
                            />
                            <DetailRow
                                icon={<Tag className="w-4 h-4" />}
                                label="Commercial Name"
                                value={vehicle.commercialName}
                            />
                            <DetailRow
                                icon={<Calendar className="w-4 h-4" />}
                                label="Year of Manufacture"
                                value={vehicle.year}
                            />
                            <DetailRow
                                icon={<Palette className="w-4 h-4" />}
                                label="Color"
                                value={vehicle.color}
                            />
                            <DetailRow
                                icon={<Hash className="w-4 h-4" />}
                                label="Color Code"
                                value={vehicle.colorCode || null}
                            />
                            <DetailRow
                                icon={<Fuel className="w-4 h-4" />}
                                label="Fuel Type"
                                value={vehicle.fuelType}
                            />
                            <DetailRow
                                icon={<User className="w-4 h-4" />}
                                label="Ownership"
                                value={vehicle.ownership}
                            />
                            <DetailRow
                                icon={<FileText className="w-4 h-4" />}
                                label="Trim Level"
                                value={vehicle.trimLevel}
                            />
                            <DetailRow
                                icon={<FileText className="w-4 h-4" />}
                                label="Registration Instruction"
                                value={vehicle.registrationInstruction}
                            />
                        </div>
                    </DetailSection>

                    {/* Technical Info Section - 3 columns */}
                    <DetailSection title="Technical Details">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4">
                            <DetailRow
                                icon={<Hash className="w-4 h-4" />}
                                label="Chassis Number (VIN)"
                                value={vehicle.chassisNumber}
                            />
                            <DetailRow
                                icon={<Cog className="w-4 h-4" />}
                                label="Engine Model"
                                value={vehicle.engineModel}
                            />
                            <DetailRow
                                icon={<CircleDot className="w-4 h-4" />}
                                label="Front Tire Size"
                                value={vehicle.frontTire}
                            />
                            <DetailRow
                                icon={<CircleDot className="w-4 h-4" />}
                                label="Rear Tire Size"
                                value={vehicle.rearTire}
                            />
                            <DetailRow
                                icon={<Shield className="w-4 h-4" />}
                                label="Safety Equipment Level"
                                value={vehicle.safetyLevel}
                            />
                            <DetailRow
                                icon={<Activity className="w-4 h-4" />}
                                label="Pollution Group"
                                value={vehicle.pollutionGroup}
                            />
                        </div>
                    </DetailSection>

                    {/* Testing & Validity Section - 3 columns */}
                    <DetailSection title="Testing & Validity">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4">
                            <DetailRow
                                icon={<Calendar className="w-4 h-4" />}
                                label="First on Road"
                                value={vehicle.firstOnRoad}
                            />
                            <DetailRow
                                icon={<Clock className="w-4 h-4" />}
                                label="Last Test Date"
                                value={formatDate(vehicle.lastTestDate)}
                            />
                            <DetailRow
                                icon={<Shield className="w-4 h-4" />}
                                label="Test Valid Until"
                                value={formatDate(vehicle.validUntil)}
                                highlight={!!isTestExpired}
                                status={isTestExpired ? 'error' : isTestExpiringSoon ? 'warning' : 'success'}
                            />
                        </div>
                    </DetailSection>

                    {/* Extended Details Section - Tire Codes (from secondary API) */}
                    <DetailSection title="Extended Tire Specifications">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-sm text-muted-foreground">Loading extended details...</span>
                            </div>
                        ) : error ? (
                            <div className="text-sm text-muted-foreground py-4 text-center">
                                <AlertCircle className="w-5 h-5 mx-auto mb-2 opacity-50" />
                                {error}
                            </div>
                        ) : extendedDetails ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-4">
                                <DetailRow
                                    icon={<Gauge className="w-4 h-4" />}
                                    label="Front Tire Load Code"
                                    value={extendedDetails.frontTireLoadCode}
                                />
                                <DetailRow
                                    icon={<Gauge className="w-4 h-4" />}
                                    label="Rear Tire Load Code"
                                    value={extendedDetails.rearTireLoadCode}
                                />
                                <DetailRow
                                    icon={<Gauge className="w-4 h-4" />}
                                    label="Front Tire Speed Code"
                                    value={extendedDetails.frontTireSpeedCode}
                                />
                                <DetailRow
                                    icon={<Gauge className="w-4 h-4" />}
                                    label="Rear Tire Speed Code"
                                    value={extendedDetails.rearTireSpeedCode}
                                />
                                <DetailRow
                                    icon={<Car className="w-4 h-4" />}
                                    label="Towing Hook"
                                    value={extendedDetails.towingInfo}
                                />
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground py-4 text-center">
                                <FileText className="w-5 h-5 mx-auto mb-2 opacity-50" />
                                No extended tire specifications available for this vehicle.
                            </div>
                        )}
                    </DetailSection>
                </div>
            </DialogContent>
        </Dialog>
    );
}
