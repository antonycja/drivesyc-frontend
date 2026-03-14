'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Building2, User, Mail, Phone, MapPin } from 'lucide-react';
import ApiProxy from '@/app/api/lib/proxy';

function InfoRow({ icon: Icon, label, value }) {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0 mt-0.5">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    {label}
                </p>
                <p className="text-sm font-medium mt-0.5">{value}</p>
            </div>
        </div>
    );
}

/**
 * SettingsView — display school profile and current user info.
 *
 * Props:
 *   onNavigate (view: string) => void
 *   auth       — useAuth() result
 */
export default function SettingsView({ onNavigate, auth }) {
    const [school, setSchool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSchool = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, status } = await ApiProxy.get('/api/stats');
            if (status === 200) {
                setSchool(data);
            } else {
                setError(data?.message || 'Failed to load school settings.');
            }
        } catch {
            setError('Unable to reach the service. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchool();
    }, []);

    const user = auth?.user;

    return (
        <div className="flex flex-col gap-6 p-4 pt-0 max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate('dashboard')}
                        className="flex items-center gap-1"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold">Settings</h2>
                        <p className="text-sm text-muted-foreground">
                            School profile and account information
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchSchool}
                    disabled={loading}
                >
                    <RefreshCw
                        className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                    />
                    Refresh
                </Button>
            </div>

            {/* Error state */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Account card — always visible */}
            {user && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Your Account
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <InfoRow
                            icon={User}
                            label="Name"
                            value={
                                [user.first_name, user.last_name].filter(Boolean).join(' ') ||
                                user.name ||
                                null
                            }
                        />
                        <InfoRow icon={Mail} label="Email" value={user.email} />
                        <InfoRow icon={Phone} label="Phone" value={user.phone_number} />
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                                Role
                            </span>
                            <Badge variant="secondary" className="capitalize">
                                {user.role}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* School info card */}
            {loading && (
                <Card className="animate-pulse">
                    <CardContent className="p-6 space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-100 rounded w-2/3" />
                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                    </CardContent>
                </Card>
            )}

            {!loading && school && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            School Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <InfoRow
                            icon={Building2}
                            label="School name"
                            value={school.school_name || school.name}
                        />
                        <InfoRow
                            icon={MapPin}
                            label="Address"
                            value={school.address}
                        />
                        <InfoRow
                            icon={Phone}
                            label="Contact phone"
                            value={school.phone_number}
                        />
                        <InfoRow
                            icon={Mail}
                            label="Contact email"
                            value={school.email}
                        />

                        {/* Quick stats from the same endpoint */}
                        <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">
                                Quick stats
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[
                                    { label: 'Instructors', value: school.active_instructors ?? school.total_instructors },
                                    { label: 'Learners', value: school.active_learners ?? school.total_learners },
                                    { label: 'Vehicles', value: school.total_vehicles },
                                    { label: 'Bookings', value: school.total_bookings },
                                    { label: 'Completed', value: school.completed_bookings },
                                ]
                                    .filter((s) => s.value !== null && s.value !== undefined)
                                    .map((s) => (
                                        <div
                                            key={s.label}
                                            className="rounded-lg border bg-gray-50 p-3 text-center"
                                        >
                                            <p className="text-xl font-bold">{s.value}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {s.label}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Placeholder note */}
            <p className="text-xs text-muted-foreground">
                School profile editing will be available in a future update. Contact your
                administrator to update school details.
            </p>
        </div>
    );
}
