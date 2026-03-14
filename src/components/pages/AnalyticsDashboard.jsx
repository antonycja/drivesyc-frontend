'use client';

import { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Users, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import ApiProxy from '@/app/api/lib/proxy';

/**
 * AnalyticsDashboard — school-level analytics overview.
 *
 * Props:
 *   onNavigate    (view: string) => void
 *   formatNumber  (val: number) => string
 *   formatCurrency (val: number) => string
 */
export default function AnalyticsDashboard({ onNavigate, formatNumber, formatCurrency }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, status } = await ApiProxy.get('/api/analytics/overview');
            if (status === 200) {
                setStats(data);
            } else {
                setError(data?.message || 'Failed to load analytics data.');
            }
        } catch {
            setError('Unable to reach the analytics service. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // Build a simple monthly chart from stats if the backend provides booking counts.
    // The stats endpoint returns total_bookings, completed_bookings, active_instructors, etc.
    // We display KPI cards plus a simple bar chart of the booking breakdown.
    const bookingChartData = stats
        ? [
              { name: 'Total', bookings: stats.total_bookings ?? 0 },
              { name: 'Completed', bookings: stats.completed_bookings ?? 0 },
              { name: 'Scheduled', bookings: stats.scheduled_bookings ?? 0 },
              { name: 'Cancelled', bookings: stats.cancelled_bookings ?? 0 },
          ]
        : [];

    const kpis = stats
        ? [
              {
                  title: 'Total Bookings',
                  value: formatNumber(stats.total_bookings ?? 0),
                  icon: Calendar,
                  color: 'text-blue-600',
                  bg: 'bg-blue-50',
              },
              {
                  title: 'Active Instructors',
                  value: formatNumber(stats.active_instructors ?? 0),
                  icon: Users,
                  color: 'text-green-600',
                  bg: 'bg-green-50',
              },
              {
                  title: 'Active Students',
                  value: formatNumber(stats.active_learners ?? 0),
                  icon: TrendingUp,
                  color: 'text-purple-600',
                  bg: 'bg-purple-50',
              },
              {
                  title: 'Total Revenue',
                  value: formatCurrency(stats.total_revenue ?? 0),
                  icon: DollarSign,
                  color: 'text-yellow-600',
                  bg: 'bg-yellow-50',
              },
          ]
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
                        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
                        <p className="text-sm text-muted-foreground">
                            School performance overview
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
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
            {loading && !stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                                <div className="h-8 bg-gray-200 rounded w-3/4" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* KPI Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {kpis.map((kpi) => {
                        const Icon = kpi.icon;
                        return (
                            <Card key={kpi.title}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm text-muted-foreground font-medium">
                                            {kpi.title}
                                        </p>
                                        <div className={`p-2 rounded-lg ${kpi.bg}`}>
                                            <Icon className={`h-4 w-4 ${kpi.color}`} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold">{kpi.value}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Booking Breakdown Chart */}
            {stats && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Booking Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart
                                data={bookingChartData}
                                margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
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
                                />
                                <Bar
                                    dataKey="bookings"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={64}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Completion rate badge */}
            {stats && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    Completion rate
                                </p>
                                <p className="text-3xl font-bold">
                                    {stats.total_bookings
                                        ? Math.round(
                                              ((stats.completed_bookings ?? 0) /
                                                  stats.total_bookings) *
                                                  100
                                          )
                                        : 0}
                                    %
                                </p>
                            </div>
                            <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 self-end mb-1"
                            >
                                {formatNumber(stats.completed_bookings ?? 0)} completed
                            </Badge>
                            <Badge
                                variant="secondary"
                                className="bg-red-100 text-red-800 self-end mb-1"
                            >
                                {formatNumber(stats.cancelled_bookings ?? 0)} cancelled
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty state */}
            {!loading && !error && !stats && (
                <div className="text-center py-16 text-muted-foreground">
                    <BarChart className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>No analytics data available yet.</p>
                </div>
            )}
        </div>
    );
}
