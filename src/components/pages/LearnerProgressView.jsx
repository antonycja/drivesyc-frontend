'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, BookOpen, Clock, CheckCircle, DollarSign } from 'lucide-react';
import ApiProxy from '@/app/api/lib/proxy';

/**
 * SVGGauge — circular progress gauge.
 *
 * @param {{ pct: number, size?: number, stroke?: number, color?: string }} props
 */
function SVGGauge({ pct = 0, size = 120, stroke = 10, color = '#3b82f6' }) {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(pct, 100) / 100) * circumference;

    return (
        <svg width={size} height={size} className="rotate-[-90deg]">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={stroke}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
        </svg>
    );
}

/**
 * LearnerProgressView — authenticated learner's own progress summary.
 *
 * Props:
 *   onNavigate (view: string) => void
 *   auth       — useAuth() result (used to display learner name)
 */
export default function LearnerProgressView({ onNavigate, auth }) {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProgress = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, status } = await ApiProxy.get('/api/analytics/learner-progress');
            if (status === 200) {
                setProgress(data);
            } else {
                setError(data?.message || 'Failed to load progress data.');
            }
        } catch {
            setError('Unable to reach the service. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgress();
    }, []);

    // Completion percentage: completed hours vs booked hours
    const completionPct =
        progress && progress.total_hours_booked > 0
            ? Math.round((progress.total_hours_completed / progress.total_hours_booked) * 100)
            : 0;

    const licenceCodes = progress
        ? Object.entries(progress.hours_by_licence_code || {})
        : [];

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
                        <h2 className="text-2xl font-bold">My Progress</h2>
                        <p className="text-sm text-muted-foreground">
                            {auth?.user?.name || 'Learner'} — lesson summary
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={fetchProgress} disabled={loading}>
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
            {loading && !progress && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                                <div className="h-8 bg-gray-200 rounded w-3/4" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Main content */}
            {!loading && !error && progress && (
                <>
                    {/* Gauge + KPI row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Gauge card */}
                        <Card className="md:row-span-1">
                            <CardContent className="p-6 flex flex-col items-center gap-3">
                                <div className="relative">
                                    <SVGGauge pct={completionPct} size={128} stroke={12} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold">{completionPct}%</span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">
                                    Completion rate
                                </p>
                            </CardContent>
                        </Card>

                        {/* Stats cards */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground">Hours booked</p>
                                </div>
                                <p className="text-3xl font-bold">{progress.total_hours_booked}h</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {progress.total_hours_completed}h completed
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground">Lessons done</p>
                                </div>
                                <p className="text-3xl font-bold">{progress.lessons_completed}</p>
                                {progress.last_lesson_date && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Last:{' '}
                                        {new Date(progress.last_lesson_date).toLocaleDateString(
                                            'en-ZA'
                                        )}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment summary */}
                    {progress.payment_summary && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Payment Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                            Total owed
                                        </p>
                                        <p className="text-xl font-bold">
                                            R{progress.payment_summary.total_owed.toLocaleString('en-ZA')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                            Total paid
                                        </p>
                                        <p className="text-xl font-bold text-green-700">
                                            R{progress.payment_summary.total_paid.toLocaleString('en-ZA')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                            Outstanding
                                        </p>
                                        <p
                                            className={`text-xl font-bold ${
                                                progress.payment_summary.outstanding > 0
                                                    ? 'text-red-600'
                                                    : 'text-green-600'
                                            }`}
                                        >
                                            R{progress.payment_summary.outstanding.toLocaleString('en-ZA')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Hours by licence code */}
                    {licenceCodes.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Hours by Licence Code
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-3">
                                    {licenceCodes.map(([code, hours]) => (
                                        <div
                                            key={code}
                                            className="flex items-center gap-2 rounded-lg border bg-gray-50 px-4 py-3"
                                        >
                                            <Badge variant="secondary">{code}</Badge>
                                            <span className="text-sm font-medium">{hours}h</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty message when no lessons yet */}
                    {progress.lessons_completed === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p>No completed lessons yet. Keep booking!</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
