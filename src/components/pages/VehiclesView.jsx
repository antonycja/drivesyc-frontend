'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Car, RefreshCw, X, CheckCircle, XCircle } from 'lucide-react';
import ApiProxy from '@/app/api/lib/proxy';

const LICENCE_CODES = ['A1', 'A', 'B', 'EB', 'C1', 'EC1', 'C', 'EC'];
const LICENCE_LABELS = {
    A1: 'A1 (Motorcycle ≤125cc)',
    A: 'A (Motorcycle)',
    B: 'B (Code 8 — Light Motor)',
    EB: 'EB (Code 8 + Trailer)',
    C1: 'C1 (Heavy Motor ≤16t)',
    EC1: 'EC1 (C1 + Trailer)',
    C: 'C (Heavy Motor >16t)',
    EC: 'EC (C + Trailer)',
};

function licenceBadgeClass(code) {
    const eCodes = ['EB', 'EC1', 'EC'];
    return eCodes.includes(code)
        ? 'bg-orange-100 text-orange-800'
        : 'bg-blue-100 text-blue-800';
}

const emptyForm = {
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    color: '',
    license_plate: '',
    licence_code: 'B',
    transmission: 'manual',
    is_available: true,
};

/**
 * VehiclesView — list and manage the school's vehicle fleet.
 *
 * Props:
 *   onNavigate (view: string) => void
 */
export default function VehiclesView({ onNavigate }) {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const fetchVehicles = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, status } = await ApiProxy.get('/api/vehicles');
            if (status === 200) {
                setVehicles(Array.isArray(data) ? data : []);
            } else {
                setError(data?.message || 'Failed to load vehicles.');
            }
        } catch {
            setError('Unable to reach the service. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (!form.make.trim() || !form.model.trim() || !form.license_plate.trim()) {
            setFormError('Make, model and license plate are required.');
            return;
        }

        const year = parseInt(form.year, 10);
        if (isNaN(year) || year < 1960 || year > new Date().getFullYear() + 1) {
            setFormError('Please enter a valid year.');
            return;
        }

        const payload = {
            make: form.make.trim(),
            model: form.model.trim(),
            year,
            color: form.color.trim() || null,
            license_plate: form.license_plate.trim().toUpperCase(),
            licence_code: form.licence_code,
            transmission: form.transmission || null,
            is_available: form.is_available,
        };

        setSubmitting(true);
        try {
            const { data, status } = await ApiProxy.post('/api/vehicles', payload);
            if (status === 201) {
                setVehicles((prev) => [data, ...prev]);
                setForm(emptyForm);
                setShowForm(false);
            } else {
                const detail = data?.detail;
                const msg = Array.isArray(detail)
                    ? detail.map((d) => d.msg).join(', ')
                    : detail || data?.message || 'Failed to add vehicle.';
                setFormError(msg);
            }
        } catch {
            setFormError('Unable to save. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const cancelForm = () => {
        setShowForm(false);
        setForm(emptyForm);
        setFormError(null);
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-[1600px] mx-auto w-full">
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
                        <h2 className="text-2xl font-bold">Fleet Management</h2>
                        <p className="text-sm text-muted-foreground">
                            Vehicles registered to your school
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchVehicles}
                        disabled={loading}
                    >
                        <RefreshCw
                            className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                        />
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
                                Add Vehicle
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Add vehicle form */}
            {showForm && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Add New Vehicle</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <div className="space-y-1">
                                <Label htmlFor="v-make">Make *</Label>
                                <Input
                                    id="v-make"
                                    value={form.make}
                                    onChange={(e) => handleChange('make', e.target.value)}
                                    placeholder="e.g. Toyota"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="v-model">Model *</Label>
                                <Input
                                    id="v-model"
                                    value={form.model}
                                    onChange={(e) => handleChange('model', e.target.value)}
                                    placeholder="e.g. Corolla"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="v-plate">License Plate *</Label>
                                <Input
                                    id="v-plate"
                                    value={form.license_plate}
                                    onChange={(e) =>
                                        handleChange('license_plate', e.target.value)
                                    }
                                    placeholder="e.g. CA 123-456"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="v-year">Year *</Label>
                                <Input
                                    id="v-year"
                                    type="number"
                                    value={form.year}
                                    onChange={(e) => handleChange('year', e.target.value)}
                                    min="1960"
                                    max={new Date().getFullYear() + 1}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="v-colour">Colour</Label>
                                <Input
                                    id="v-colour"
                                    value={form.color}
                                    onChange={(e) => handleChange('color', e.target.value)}
                                    placeholder="e.g. White"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Licence Code *</Label>
                                <Select
                                    value={form.licence_code}
                                    onValueChange={(v) => handleChange('licence_code', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select code" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LICENCE_CODES.map((code) => (
                                            <SelectItem key={code} value={code}>
                                                {LICENCE_LABELS[code]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>Transmission</Label>
                                <Select
                                    value={form.transmission}
                                    onValueChange={(v) => handleChange('transmission', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select transmission" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="manual">Manual</SelectItem>
                                        <SelectItem value="automatic">Automatic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>Availability</Label>
                                <Select
                                    value={form.is_available ? 'true' : 'false'}
                                    onValueChange={(v) =>
                                        handleChange('is_available', v === 'true')
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Available</SelectItem>
                                        <SelectItem value="false">Not available</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                    onClick={cancelForm}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Add Vehicle'}
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
                <Card>
                    <CardContent className="p-6 space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="h-12 bg-gray-100 rounded animate-pulse"
                            />
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Empty state */}
            {!loading && !error && vehicles.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                    <Car className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium mb-1">No vehicles registered</p>
                    <p className="text-sm">
                        Add your first vehicle using the button above.
                    </p>
                </div>
            )}

            {/* Vehicles table */}
            {!loading && !error && vehicles.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-left">
                                        <th className="px-4 py-3 font-medium text-muted-foreground">
                                            Plate
                                        </th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                                            Make / Model
                                        </th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                                            Year
                                        </th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground">
                                            Licence
                                        </th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                                            Transmission
                                        </th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehicles.map((v) => (
                                        <tr
                                            key={v.id}
                                            className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-mono font-medium">
                                                {v.license_plate}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                                                {v.make} {v.model}
                                                {v.color ? (
                                                    <span className="text-xs ml-1 opacity-70">
                                                        · {v.color}
                                                    </span>
                                                ) : null}
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                {v.year}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="secondary"
                                                    className={licenceBadgeClass(v.licence_code)}
                                                >
                                                    {v.licence_code}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 capitalize text-muted-foreground hidden sm:table-cell">
                                                {v.transmission || '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {v.is_available ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-green-100 text-green-800 gap-1"
                                                    >
                                                        <CheckCircle className="h-3 w-3" />
                                                        Available
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-gray-100 text-gray-600 gap-1"
                                                    >
                                                        <XCircle className="h-3 w-3" />
                                                        In use
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
