'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ApiProxy from '@/app/api/lib/proxy';

export default function RegisterPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        confirm_password: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const validate = (): string | null => {
        if (!form.first_name.trim()) return 'First name is required.';
        if (!form.last_name.trim()) return 'Last name is required.';
        if (!form.email.trim() && !form.phone_number.trim())
            return 'Email or phone number is required.';
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            return 'Please enter a valid email address.';
        if (!form.password) return 'Password is required.';
        if (form.password.length < 8) return 'Password must be at least 8 characters.';
        if (form.password !== form.confirm_password) return 'Passwords do not match.';
        return null;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            const payload: Record<string, string> = {
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                password: form.password,
                confirm_password: form.confirm_password,
            };
            if (form.email.trim()) payload.email = form.email.toLowerCase().trim();
            if (form.phone_number.trim()) payload.phone_number = form.phone_number.trim();

            const { data, status } = await ApiProxy.post('/api/auth/register', payload, false);

            if (status === 201 || status === 200) {
                setSuccess(
                    data?.message ||
                        'Registration successful. Your account is pending approval — please contact your school administrator.'
                );
                setTimeout(() => router.push('/auth/login'), 4000);
            } else {
                setError(
                    data?.detail || data?.message || 'Registration failed. Please try again.'
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
                    <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Join DriveSync to book and manage driving lessons
                    </p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="first_name">First name *</Label>
                                <Input
                                    id="first_name"
                                    value={form.first_name}
                                    onChange={(e) => handleChange('first_name', e.target.value)}
                                    placeholder="Jane"
                                    autoComplete="given-name"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="last_name">Last name *</Label>
                                <Input
                                    id="last_name"
                                    value={form.last_name}
                                    onChange={(e) => handleChange('last_name', e.target.value)}
                                    placeholder="Doe"
                                    autoComplete="family-name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="jane@example.com"
                                autoComplete="email"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="phone_number">Phone number</Label>
                            <Input
                                id="phone_number"
                                type="tel"
                                value={form.phone_number}
                                onChange={(e) => handleChange('phone_number', e.target.value)}
                                placeholder="+27 82 000 0000"
                                autoComplete="tel"
                            />
                            <p className="text-xs text-muted-foreground">
                                At least one of email or phone is required.
                            </p>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                placeholder="Min. 8 characters"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="confirm_password">Confirm password *</Label>
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

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </Button>
                    </form>

                    <p className="mt-5 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link
                            href="/auth/login"
                            className="font-medium text-primary hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
