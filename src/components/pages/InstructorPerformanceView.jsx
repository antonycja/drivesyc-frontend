'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Star, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import ApiProxy from '@/app/api/lib/proxy';

/**
 * SVG ring showing a percentage.
 *
 * @param {{ pct: number, size?: number, stroke?: number, color?: string }} props
 */
function CompletionRing({ pct = 0, size = 112, stroke = 10, color = '#22c55e' }) {
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
 * InstructorPerformanceView — authenticated instructor's own performance metrics.
 *
 * Props:
 *   onNavigate (view: string) => void
 *   auth       — useAuth() result (used to display instructor name)
 */
export default function InstructorPerformanceView({ onNavigate, auth }) {
    const [perf, setPerf] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPerf = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, status } = await ApiProxy.get(
                '/api/analytics/instructor-performance'
            );
            if (status === 200) {
                setPerf(data);
            } else {
                setError(data?.message || 'Failed to load performance data.');
            }
        } catch {
            setError('Unable to reach the service. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPerf();
    }, []);

    // Build sparkline data from hours_last_4_weeks (oldest → newest)
    const sparkData = perf
        ? (perf.hours_last_4_weeks || []).map((h, i) => ({
              week: `W-${3 - i}`,
              hours: h,
          }))
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
                        <h2 className="text-2xl font-bold">My Performance</h2>
                        <p className="text-sm text-muted-foreground">
                            {auth?.user?.name || 'Instructor'} — metrics overview
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={fetchPerf} disabled={loading}>
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
            {loading && !perf && (
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
            {!loading && !error && perf && (
                <>
                    {/* Ring + stats row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Completion ring */}
                        <Card>
                            <CardContent className="p-6 flex flex-col items-center gap-3">
                                <div className="relative">
                                    <CompletionRing pct={perf.completion_rate} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xl font-bold">
                                            {perf.completion_rate}%
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Completion rate
                                </p>
                            </CardContent>
                        </Card>

                        {/* Completed / cancelled */}
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                            Completed
                                        </p>
                                        <p className="text-2xl font-bold">{perf.total_completed}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                            Cancelled
                                        </p>
                                        <p className="text-2xl font-bold">{perf.total_cancelled}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rating + revenue */}
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-50 rounded-lg">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                            Avg rating
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {perf.avg_rating != null ? perf.avg_rating : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                            Revenue
                                        </p>
                                        <p className="text-2xl font-bold">
                                            R{perf.revenue_generated.toLocaleString('en-ZA')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sparkline — hours last 4 weeks */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Hours taught — last 4 weeks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {sparkData.every((d) => d.hours === 0) ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    No hours recorded in the last 4 weeks.
                                </p>
                            ) : (
                                <ResponsiveContainer width="100%" height={180}>
                                    <LineChart
                                        data={sparkData}
                                        margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="week"
                                            tick={{ fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: '1px solid #e5e7eb',
                                                fontSize: '13px',
                                            }}
                                            formatter={(v) => [`${v}h`, 'Hours']}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="hours"
                                            stroke="#22c55e"
                                            strokeWidth={2}
                                            dot={{ r: 4, fill: '#22c55e' }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
