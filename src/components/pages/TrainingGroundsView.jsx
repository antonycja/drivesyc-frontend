'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, MapPin, RefreshCw, X } from 'lucide-react';
import ApiProxy from '@/app/api/lib/proxy';

/**
 * TrainingGroundsView — list and manage training grounds.
 *
 * Props:
 *   onNavigate (view: string) => void
 */
export default function TrainingGroundsView({ onNavigate }) {
    const [grounds, setGrounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);

    const emptyForm = { name: '', address: '', latitude: '', longitude: '', description: '' };
    const [form, setForm] = useState(emptyForm);

    const fetchGrounds = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, status } = await ApiProxy.get('/api/training-grounds');
            if (status === 200) {
                setGrounds(Array.isArray(data) ? data : []);
            } else {
                setError(data?.message || 'Failed to load training grounds.');
            }
        } catch {
            setError('Unable to reach the service. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrounds();
    }, []);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (!form.name.trim()) {
            setFormError('Name is required.');
            return;
        }

        const payload = {
            name: form.name.trim(),
            address: form.address.trim() || null,
            latitude: form.latitude !== '' ? parseFloat(form.latitude) : null,
            longitude: form.longitude !== '' ? parseFloat(form.longitude) : null,
            description: form.description.trim() || null,
        };

        setSubmitting(true);
        try {
            const { data, status } = await ApiProxy.post('/api/training-grounds', payload);
            if (status === 201) {
                setGrounds((prev) => [data, ...prev]);
                setForm(emptyForm);
                setShowForm(false);
            } else {
                setFormError(data?.detail || data?.message || 'Failed to create training ground.');
            }
        } catch {
            setFormError('Unable to save. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-4 pt-0">
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
                        <h2 className="text-2xl font-bold">Training Grounds</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage your school's training venues
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchGrounds} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => setShowForm((v) => !v)}>
                        {showForm ? (
                            <>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Ground
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Add form */}
            {showForm && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">New Training Ground</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1 md:col-span-2">
                                <Label htmlFor="tg-name">Name *</Label>
                                <Input
                                    id="tg-name"
                                    value={form.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="e.g. Main Training Yard"
                                    required
                                />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <Label htmlFor="tg-address">Address</Label>
                                <Input
                                    id="tg-address"
                                    value={form.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder="e.g. 123 Main Street, Cape Town"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="tg-lat">Latitude</Label>
                                <Input
                                    id="tg-lat"
                                    type="number"
                                    step="any"
                                    value={form.latitude}
                                    onChange={(e) => handleChange('latitude', e.target.value)}
                                    placeholder="-33.9249"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="tg-lng">Longitude</Label>
                                <Input
                                    id="tg-lng"
                                    type="number"
                                    step="any"
                                    value={form.longitude}
                                    onChange={(e) => handleChange('longitude', e.target.value)}
                                    placeholder="18.4241"
                                />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <Label htmlFor="tg-desc">Description</Label>
                                <Input
                                    id="tg-desc"
                                    value={form.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Optional notes about this ground"
                                />
                            </div>

                            {formError && (
                                <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    {formError}
                                </div>
                            )}

                            <div className="md:col-span-2 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setShowForm(false); setForm(emptyForm); setFormError(null); }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Save Ground'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Error state */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-5">
                                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
                                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && grounds.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                    <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium mb-1">No training grounds yet</p>
                    <p className="text-sm">Add your first training ground using the button above.</p>
                </div>
            )}

            {/* Grounds grid */}
            {!loading && !error && grounds.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {grounds.map((ground) => (
                        <Card key={ground.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                                            <MapPin className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <h3 className="font-semibold text-sm leading-tight truncate">
                                            {ground.name}
                                        </h3>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={
                                            ground.is_active
                                                ? 'bg-green-100 text-green-800 flex-shrink-0'
                                                : 'bg-gray-100 text-gray-600 flex-shrink-0'
                                        }
                                    >
                                        {ground.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>

                                {ground.address && (
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {ground.address}
                                    </p>
                                )}

                                {(ground.latitude != null || ground.longitude != null) && (
                                    <p className="text-xs text-muted-foreground font-mono">
                                        {ground.latitude?.toFixed(4)}, {ground.longitude?.toFixed(4)}
                                    </p>
                                )}

                                {ground.description && (
                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                        {ground.description}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
