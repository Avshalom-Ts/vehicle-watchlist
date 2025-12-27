'use client';

import React, { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { AuthService } from '@/lib/auth-service';
import { useI18n } from '@/lib/i18n-provider';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useI18n();
    const redirectUrl = searchParams.get('redirect') || '/dashboard';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    useEffect(() => {
        // Redirect to dashboard if already logged in
        if (AuthService.isAuthenticated()) {
            router.push('/dashboard');
        }
    }, [router]);

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};
        const trimmedEmail = email.trim();

        if (trimmedEmail.length === 0) {
            newErrors.email = t('auth.validation.emailRequired');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            newErrors.email = t('auth.validation.emailInvalid');
        }

        if (password.length < 1) {
            newErrors.password = t('auth.validation.passwordRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setHasAttemptedSubmit(true);

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            await AuthService.login({
                email: email.trim(),
                password,
            });

            toast.success(t('auth.welcomeBack'));

            // Redirect to the intended page or dashboard after successful login
            router.push(redirectUrl);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : t('auth.loginFailed'));
            setIsLoading(false);
        }
    };

    return (
        <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold text-center">
                        {t('auth.signIn')}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t('auth.signInDescription')}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('auth.email')}</Label>
                            <Input
                                id="email"
                                type="text"
                                placeholder={t('auth.emailPlaceholder')}
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (hasAttemptedSubmit) {
                                        setErrors({ ...errors, email: undefined });
                                    }
                                }}
                                onBlur={(e) => {
                                    setEmail(e.target.value.trim());
                                }}
                                disabled={isLoading}
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t('auth.password')}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={t('auth.passwordPlaceholder')}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (hasAttemptedSubmit) {
                                        setErrors({ ...errors, password: undefined });
                                    }
                                }}
                                disabled={isLoading}
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? t('auth.signingIn') : t('auth.signInButton')}
                        </Button>
                        <p className="text-sm text-center text-muted-foreground">
                            {t('auth.dontHaveAccount')}{' '}
                            <Link
                                href={redirectUrl !== '/dashboard' ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register'}
                                className="text-primary hover:underline font-medium"
                            >
                                {t('auth.signUpHere')}
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </main>
        }>
            <LoginContent />
        </Suspense>
    );
}

