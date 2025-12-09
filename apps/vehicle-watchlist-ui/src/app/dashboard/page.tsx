'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, User } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check authentication
        if (!AuthService.isAuthenticated()) {
            router.push('/');
            return;
        }

        const userData = AuthService.getUser();
        setUser(userData);
        setIsLoading(false);
    }, [router]);

    if (isLoading) {
        return (
            <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </main>
        );
    }

    return (
        <main className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
            <div className="container mx-auto max-w-6xl space-y-6">
                {/* Welcome Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold">Welcome back, {user?.name}!</h1>
                        <p className="text-muted-foreground mt-1">Manage your vehicle watchlist</p>
                    </div>
                </div>

                {/* User Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                        </CardTitle>
                        <CardDescription>Your account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p className="text-lg">{user?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p className="text-lg">{user?.email}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Watchlist Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                My Watchlist
                            </CardTitle>
                            <CardDescription>Vehicles you're tracking</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">0</p>
                            <p className="text-sm text-muted-foreground mt-1">No vehicles yet</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your latest actions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">No recent activity</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>Saved Searches</CardTitle>
                            <CardDescription>Quick access to searches</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">No saved searches</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                        <Button>
                            <Car className="h-4 w-4 mr-2" />
                            Add Vehicle
                        </Button>
                        <Button variant="outline">Search Vehicles</Button>
                        <Button variant="outline">View Analytics</Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
