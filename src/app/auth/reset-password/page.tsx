'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import ApiProxy from '@/app/api/lib/proxy';

/**
 * ResetPasswordPage — two-mode page:
 *   - With ?token=xxx  → show new password + confirm form (confirm flow)
 *   - Without token    → show email request form via PasswordResetForm component
 */
export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    // Shared error/success state (also threaded into PasswordResetForm)
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({ new_password: '', confirm_password: '' });

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleConfirmReset = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.new_password) {
            setError('New password is required.');
            return;
        }
        if (form.new_password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (form.new_password !== form.confirm_password) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const { data, status } = await ApiProxy.post(
                '/api/auth/reset-password',
                {
                    token,
                    new_password: form.new_password,
                    confirm_password: form.confirm_password,
                },
                false
            );

            if (status === 200) {
                setSuccess('Password updated successfully. Redirecting to login...');
                setTimeout(() => router.push('/auth/login'), 2500);
            } else {
                setError(
                    data?.detail || data?.message || 'Failed to reset password. The link may have expired.'
                );
            }
        } catch {
            setError('Unable to connect. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold">
                        {token ? 'Set new password' : 'Reset password'}
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {token ? (
                        /* Confirm-reset form — shown when ?token= is in the URL */
                        <form onSubmit={handleConfirmReset} className="space-y-4" noValidate>
                            <div className="space-y-1">
                                <Label htmlFor="new_password">New password</Label>
                                <Input
                                    id="new_password"
                                    type="password"
                                    value={form.new_password}
                                    onChange={(e) => handleChange('new_password', e.target.value)}
                                    placeholder="Min. 8 characters"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="confirm_password">Confirm password</Label>
                                <Input
                                    id="confirm_password"
                                    type="password"
                                    value={form.confirm_password}
                                    onChange={(e) =>
                                        handleChange('confirm_password', e.target.value)
                                    }
                                    placeholder="Repeat password"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                                    {success}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Updating...' : 'Update password'}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                <Link
                                    href="/auth/login"
                                    className="font-medium text-primary hover:underline"
                                >
                                    Back to login
                                </Link>
                            </p>
                        </form>
                    ) : (
                        /* Email-request form — reuses the existing PasswordResetForm component */
                        <PasswordResetForm
                            onBackToLogin={() => router.push('/auth/login')}
                            error={error}
                            setError={setError}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
