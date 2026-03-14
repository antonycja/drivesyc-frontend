'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, Calendar } from 'lucide-react';
import ApiProxy from '@/app/api/lib/proxy';

const STATUS_STYLES = {
    SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function startOfMonth(year, month) {
    return new Date(year, month, 1);
}

function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

/**
 * Builds a 6-week grid of dates for the given month view.
 */
function buildCalendarGrid(year, month) {
    const first = startOfMonth(year, month);
    const startDow = first.getDay(); // 0 = Sun
    const total = daysInMonth(year, month);
    const cells = [];

    // Leading empty cells
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d));

    // Trailing empty cells to complete last row
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
}

function isoDate(date) {
    return date.toISOString().slice(0, 10);
}

/**
 * CalendarView — monthly calendar showing all bookings.
 *
 * Props:
 *   onNavigate (view: string) => void
 */
export default function CalendarView({ onNavigate }) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, status } = await ApiProxy.get(
                '/api/bookings?include_canceled=true'
            );
            if (status === 200) {
                setBookings(Array.isArray(data?.bookings) ? data.bookings : []);
            } else {
                setError(data?.message || 'Failed to load bookings.');
            }
        } catch {
            setError('Unable to reach the bookings service. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const prevMonth = () => {
        if (month === 0) { setYear((y) => y - 1); setMonth(11); }
        else setMonth((m) => m - 1);
        setSelectedDay(null);
    };

    const nextMonth = () => {
        if (month === 11) { setYear((y) => y + 1); setMonth(0); }
        else setMonth((m) => m + 1);
        setSelectedDay(null);
    };

    const goToday = () => {
        setYear(today.getFullYear());
        setMonth(today.getMonth());
        setSelectedDay(isoDate(today));
    };

    // Index bookings by date string (YYYY-MM-DD)
    const bookingsByDate = useMemo(() => {
        const map = {};
        bookings.forEach((b) => {
            if (!b.scheduled_start) return;
            const dateKey = b.scheduled_start.slice(0, 10);
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(b);
        });
        return map;
    }, [bookings]);

    const grid = useMemo(() => buildCalendarGrid(year, month), [year, month]);

    const todayIso = isoDate(today);

    const selectedBookings = selectedDay ? (bookingsByDate[selectedDay] || []) : [];

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
                        <h2 className="text-2xl font-bold">Bookings Calendar</h2>
                        <p className="text-sm text-muted-foreground">
                            Monthly overview of all bookings
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={goToday}>
                        Today
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchBookings}
                        disabled={loading}
                    >
                        <RefreshCw
                            className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                        />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Month navigator */}
            <Card>
                <CardContent className="p-4">
                    {/* Month / year title + prev/next */}
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="ghost" size="sm" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h3 className="font-semibold text-base">
                            {MONTH_NAMES[month]} {year}
                        </h3>
                        <Button variant="ghost" size="sm" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Day-of-week header */}
                    <div className="grid grid-cols-7 mb-1">
                        {DAY_NAMES.map((d) => (
                            <div
                                key={d}
                                className="text-center text-xs font-medium text-muted-foreground py-1"
                            >
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    {loading ? (
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-14 bg-gray-100 rounded animate-pulse"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-1">
                            {grid.map((date, idx) => {
                                if (!date) {
                                    return <div key={`empty-${idx}`} className="h-14" />;
                                }
                                const dateKey = isoDate(date);
                                const dayBookings = bookingsByDate[dateKey] || [];
                                const isToday = dateKey === todayIso;
                                const isSelected = dateKey === selectedDay;

                                return (
                                    <button
                                        key={dateKey}
                                        onClick={() =>
                                            setSelectedDay(
                                                selectedDay === dateKey ? null : dateKey
                                            )
                                        }
                                        className={[
                                            'h-14 rounded-lg p-1 text-left flex flex-col transition-colors',
                                            isSelected
                                                ? 'bg-blue-100 ring-2 ring-blue-400'
                                                : isToday
                                                ? 'bg-blue-50 ring-1 ring-blue-300'
                                                : 'hover:bg-gray-50',
                                        ].join(' ')}
                                    >
                                        <span
                                            className={[
                                                'text-xs font-semibold leading-none',
                                                isToday ? 'text-blue-700' : 'text-gray-700',
                                            ].join(' ')}
                                        >
                                            {date.getDate()}
                                        </span>
                                        {dayBookings.length > 0 && (
                                            <div className="flex flex-wrap gap-0.5 mt-1">
                                                {dayBookings.slice(0, 3).map((b) => (
                                                    <span
                                                        key={b.id}
                                                        className={[
                                                            'w-full text-[10px] leading-tight truncate rounded px-0.5',
                                                            STATUS_STYLES[b.status] ||
                                                                'bg-gray-100 text-gray-600',
                                                        ].join(' ')}
                                                    >
                                                        {b.learner_name ||
                                                            b.temp_learner_name ||
                                                            `#${b.id}`}
                                                    </span>
                                                ))}
                                                {dayBookings.length > 3 && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        +{dayBookings.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Selected day detail panel */}
            {selectedDay && (
                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-semibold mb-3">
                            {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-ZA', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </h3>
                        {selectedBookings.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No bookings on this day.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {selectedBookings.map((b) => {
                                    const timeStr = b.scheduled_start
                                        ? new Date(b.scheduled_start).toLocaleTimeString(
                                              'en-ZA',
                                              { hour: '2-digit', minute: '2-digit', hour12: false }
                                          )
                                        : '';
                                    const endStr = b.scheduled_end
                                        ? new Date(b.scheduled_end).toLocaleTimeString(
                                              'en-ZA',
                                              { hour: '2-digit', minute: '2-digit', hour12: false }
                                          )
                                        : '';

                                    return (
                                        <div
                                            key={b.id}
                                            className="flex items-start gap-3 rounded-lg border p-3"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-sm">
                                                        {b.learner_name ||
                                                            b.temp_learner_name ||
                                                            `Booking #${b.id}`}
                                                    </span>
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            STATUS_STYLES[b.status] ||
                                                            'bg-gray-100 text-gray-600'
                                                        }
                                                    >
                                                        {b.status}
                                                    </Badge>
                                                </div>
                                                {timeStr && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {timeStr}
                                                        {endStr && ` – ${endStr}`}
                                                        {b.instructor_name
                                                            ? ` · ${b.instructor_name}`
                                                            : ''}
                                                    </p>
                                                )}
                                                {b.licence_code && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Licence: {b.licence_code}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
