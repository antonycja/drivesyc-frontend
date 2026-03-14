'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, RefreshCw, Users, Search, Star } from 'lucide-react';
import ApiProxy from '@/app/api/lib/proxy';

function statusBadge(isActive, approvalStatus) {
    if (!isActive) {
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Inactive</Badge>;
    }
    switch (approvalStatus?.toUpperCase()) {
        case 'APPROVED':
            return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>;
        case 'PENDING':
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
        case 'REJECTED':
            return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>;
        default:
            return <Badge variant="secondary" className="bg-gray-100 text-gray-600">{approvalStatus || 'Unknown'}</Badge>;
    }
}

/**
 * InstructorsView — list instructors belonging to the school.
 *
 * Props:
 *   onNavigate (view: string) => void
 */
export default function InstructorsView({ onNavigate }) {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    const fetchInstructors = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ role: 'instructor', page_size: '100' });
            if (search.trim()) params.set('search', search.trim());

            const { data, status } = await ApiProxy.get(
                `/api/school-users?${params.toString()}`
            );
            if (status === 200) {
                setInstructors(Array.isArray(data?.users) ? data.users : []);
            } else {
                setError(data?.message || 'Failed to load instructors.');
            }
        } catch {
            setError('Unable to reach the service. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchInstructors();
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
                        <h2 className="text-2xl font-bold">Instructors</h2>
                        <p className="text-sm text-muted-foreground">
                            All instructors at your school
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchInstructors}
                    disabled={loading}
                >
                    <RefreshCw
                        className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                    />
                    Refresh
                </Button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
                <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button type="submit" size="sm" variant="outline" disabled={loading}>
                    <Search className="h-4 w-4" />
                </Button>
            </form>

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
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-12 bg-gray-100 rounded animate-pulse"
                            />
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Empty state */}
            {!loading && !error && instructors.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium mb-1">No instructors found</p>
                    <p className="text-sm">
                        {search
                            ? 'Try a different search term.'
                            : 'Invite instructors to join your school.'}
                    </p>
                </div>
            )}

            {/* Instructors table */}
            {!loading && !error && instructors.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            {instructors.length} instructor
                            {instructors.length !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-left">
                                        <th className="px-4 py-3 font-medium text-muted-foreground">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                                            Phone
                                        </th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                                            Priority
                                        </th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {instructors.map((inst) => (
                                        <tr
                                            key={inst.id}
                                            className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {inst.first_name} {inst.last_name}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                                                {inst.email || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                                                {inst.phone_number || '—'}
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                {inst.priority_weight != null ? (
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-3 w-3 text-yellow-500" />
                                                        <span className="text-sm font-medium">
                                                            {Number(inst.priority_weight).toFixed(1)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {statusBadge(inst.is_active, inst.approval_status)}
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
