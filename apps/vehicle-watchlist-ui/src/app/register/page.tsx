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

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useI18n();
    const redirectUrl = searchParams.get('redirect') || '/dashboard';
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
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

        if (name.length < 2) {
            newErrors.name = t('auth.validation.nameMinLength');
        }

        if (trimmedEmail.length === 0) {
            newErrors.email = t('auth.validation.emailRequired');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            newErrors.email = t('auth.validation.emailInvalid');
        }

        if (password.length < 8) {
            newErrors.password = t('auth.validation.passwordMinLength');
        } else if (!/[A-Z]/.test(password)) {
            newErrors.password = t('auth.validation.passwordUppercase');
        } else if (!/[a-z]/.test(password)) {
            newErrors.password = t('auth.validation.passwordLowercase');
        } else if (!/[0-9]/.test(password)) {
            newErrors.password = t('auth.validation.passwordNumber');
        }

        if (confirmPassword.length === 0) {
            newErrors.confirmPassword = t('auth.validation.confirmPasswordRequired');
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = t('auth.validation.passwordsMismatch');
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
            await AuthService.register({
                name,
                email: email.trim(),
                password,
            });

            toast.success(t('auth.accountCreated'));

            // Redirect to the intended page or dashboard after successful registration
            router.push(redirectUrl);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : t('auth.registrationFailed'));
            setIsLoading(false);
        }
    };

    return (
        <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold text-center">
                        {t('auth.signUp')}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t('auth.signUpDescription')}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('auth.name')}</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder={t('auth.namePlaceholder')}
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (hasAttemptedSubmit) {
                                        setErrors({ ...errors, name: undefined });
                                    }
                                }}
                                disabled={isLoading}
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>
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
                                placeholder={t('auth.createPassword')}
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
                            <p className="text-xs text-muted-foreground">
                                {t('auth.passwordRequirements')}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder={t('auth.confirmPasswordPlaceholder')}
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (hasAttemptedSubmit) {
                                        setErrors({ ...errors, confirmPassword: undefined });
                                    }
                                }}
                                disabled={isLoading}
                                className={errors.confirmPassword ? 'border-red-500' : ''}
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? t('auth.creatingAccount') : t('auth.signUpButton')}
                        </Button>
                        <p className="text-sm text-center text-muted-foreground">
                            {t('auth.alreadyHaveAccount')}{' '}
                            <Link
                                href="/login"
                                className="text-primary hover:underline font-medium"
                            >
                                {t('auth.signInHere')}
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </main>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </main>
        }>
            <RegisterContent />
        </Suspense>
    );
}
