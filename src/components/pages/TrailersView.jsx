'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Truck, AlertCircle } from 'lucide-react';
import ApiProxy from '@/app/api/lib/proxy';

/**
 * Friendly label for TrailerBrakeType enum values.
 */
const BRAKE_LABELS = {
    NONE: 'No brakes',
    OVERRUN: 'Overrun brakes',
    FULL: 'Full brakes',
};

/**
 * TrailersView — view all trailers registered to the school.
 *
 * Props:
 *   onNavigate (view: string) => void
 */
export default function TrailersView({ onNavigate }) {
    const [trailers, setTrailers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTrailers = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, status } = await ApiProxy.get('/api/trailers');
            if (status === 200) {
                setTrailers(Array.isArray(data) ? data : []);
            } else {
                setError(data?.message || 'Failed to load trailers.');
            }
        } catch {
            setError('Unable to reach the service. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrailers();
    }, []);

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
                        <h2 className="text-2xl font-bold">Trailers</h2>
                        <p className="text-sm text-muted-foreground">
                            E-code training equipment
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={fetchTrailers} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

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
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Empty state */}
            {!loading && !error && trailers.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                    <Truck className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium mb-1">No trailers registered</p>
                    <p className="text-sm">
                        Trailers are required for E-code (EB / EC1 / EC) licence training.
                    </p>
                </div>
            )}

            {/* Trailers table */}
            {!loading && !error && trailers.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            {trailers.length} trailer{trailers.length !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-left">
                                        <th className="px-4 py-3 font-medium text-muted-foreground">
                                            Registration
                                        </th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                                            Make / Type
                                        </th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground">
                                            GVM (kg)
                                        </th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                                            Brakes
                                        </th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground">
                                            E-code req.
                                        </th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trailers.map((trailer) => (
                                        <tr
                                            key={trailer.id}
                                            className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-mono font-medium">
                                                {trailer.registration_number}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                                                {[trailer.make, trailer.trailer_type]
                                                    .filter(Boolean)
                                                    .join(' · ') || '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {trailer.gvm_kg.toLocaleString('en-ZA')}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                                                {BRAKE_LABELS[trailer.brake_type] || trailer.brake_type}
                                            </td>
                                            <td className="px-4 py-3">
                                                {trailer.requires_e_code ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-orange-100 text-orange-800 gap-1"
                                                    >
                                                        <AlertCircle className="h-3 w-3" />
                                                        Yes
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-gray-100 text-gray-600"
                                                    >
                                                        No
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="secondary"
                                                    className={
                                                        trailer.is_available
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }
                                                >
                                                    {trailer.is_available ? 'Available' : 'In use'}
                                                </Badge>
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
