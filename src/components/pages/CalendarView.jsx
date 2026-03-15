'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import ApiProxy from '@/app/api/lib/proxy';
import BookingDetailPanel from '@/components/booking/BookingDetailPanel';
import PaymentPanel from '@/components/booking/PaymentPanel';

// ── Status colour maps ──────────────────────────────────────────────────────────
const STATUS_PILL_COLORS = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-gray-100 text-gray-500',
    no_show: 'bg-red-100 text-red-600',
};

const STATUS_CARD_COLORS = {
    scheduled: 'border-blue-200 bg-blue-50/40',
    completed: 'border-green-200 bg-green-50/40',
    pending: 'border-amber-200 bg-amber-50/40',
    cancelled: 'border-gray-200 bg-gray-50/40',
    no_show: 'border-red-200 bg-red-50/40',
};

const STATUS_BADGE_COLORS = {
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
    no_show: 'bg-red-100 text-red-800 border-red-200',
};

// ── Date utilities ──────────────────────────────────────────────────────────────

/** Returns the Monday of the ISO week containing `date`. */
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

/** Returns the 1st of the month of `date`. */
function getMonthStart(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

function addMonths(date, n) {
    return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

/** YYYY-MM-DD key from a Date. */
function isoDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** Extract the YYYY-MM-DD portion from a booking's scheduled_start string. */
function bookingDateKey(booking) {
    if (!booking.scheduled_start) return null;
    const iso = booking.scheduled_start.endsWith('Z')
        ? booking.scheduled_start
        : booking.scheduled_start + 'Z';
    return iso.slice(0, 10);
}

/** Format a booking start time as HH:MM. */
function formatBookingTime(booking) {
    if (!booking.scheduled_start) return '';
    const iso = booking.scheduled_start.endsWith('Z')
        ? booking.scheduled_start
        : booking.scheduled_start + 'Z';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** Learner display name from a booking. */
function learnerName(booking) {
    return (
        booking.learner_name ||
        `${booking.temp_learner_name || ''} ${booking.temp_learner_surname || ''}`.trim() ||
        `Booking #${booking.id}`
    );
}

const SHORT_DAYS_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SHORT_DAYS_SUN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

// ── BookingPill — tiny coloured chip used in Month and Week views ──────────────
// compact=true → dot only + name, no time (used when many bookings per cell)
function BookingPill({ booking, onSelect, compact = false }) {
    const key = booking.status?.toLowerCase();
    const colors = STATUS_PILL_COLORS[key] || STATUS_PILL_COLORS.pending;
    const time = formatBookingTime(booking);
    const name = learnerName(booking);

    return (
        <button
            onClick={() => onSelect(booking)}
            className={`w-full rounded px-1.5 py-0.5 text-xs cursor-pointer truncate text-left ${colors} hover:opacity-80 transition-opacity`}
            title={`${time ? time + ' — ' : ''}${name}`}
        >
            {!compact && time && <span className="font-medium mr-1 opacity-70">{time}</span>}
            <span className="truncate">{name}</span>
        </button>
    );
}

// ── BookingCard — larger card used in Day view ──────────────────────────────────
function BookingCard({ booking, onSelect }) {
    const key = booking.status?.toLowerCase();
    const cardColors = STATUS_CARD_COLORS[key] || STATUS_CARD_COLORS.pending;
    const badgeColors = STATUS_BADGE_COLORS[key] || STATUS_BADGE_COLORS.pending;
    const time = formatBookingTime(booking);
    const name = learnerName(booking);

    const endTime = booking.scheduled_end
        ? (() => {
              const iso = booking.scheduled_end.endsWith('Z')
                  ? booking.scheduled_end
                  : booking.scheduled_end + 'Z';
              return new Date(iso).toLocaleTimeString('en-ZA', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
              });
          })()
        : null;

    const timeLabel = time && endTime ? `${time} – ${endTime}` : time || null;

    return (
        <div
            onClick={() => onSelect(booking)}
            className={`rounded-md border p-3 cursor-pointer hover:shadow-sm transition-shadow ${cardColors}`}
        >
            <div className="flex items-start justify-between gap-2 mb-1.5">
                <Badge
                    variant="secondary"
                    className={`${badgeColors} border text-xs capitalize shrink-0`}
                >
                    {booking.status?.replace('_', ' ') || 'Unknown'}
                </Badge>
                {timeLabel && (
                    <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {timeLabel}
                    </span>
                )}
            </div>
            <p className="font-semibold text-sm leading-tight">{name}</p>
            <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-muted-foreground">
                {booking.instructor_name && <span>{booking.instructor_name}</span>}
                {booking.duration_minutes && (
                    <span>{booking.duration_minutes} min</span>
                )}
                {booking.licence_code && <span>{booking.licence_code}</span>}
            </div>
            {booking.is_pickup_required && booking.pickup_location && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                    Pickup: {booking.pickup_location}
                </p>
            )}
        </div>
    );
}

// ── MonthView ──────────────────────────────────────────────────────────────────
function MonthView({ monthStart, todayIso, bookingsByDate, onSelect, onDayClick }) {
    const gridStart = getWeekStart(monthStart);

    const cells = useMemo(() => {
        return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
    }, [gridStart]);

    // Find the busiest day to decide pill density
    const maxPerDay = useMemo(() => {
        return Math.max(1, ...cells.map((d) => (bookingsByDate[isoDate(d)] || []).length));
    }, [cells, bookingsByDate]);

    // How many pills to show: fewer when days are busier
    const visibleCount = maxPerDay <= 3 ? 3 : maxPerDay <= 6 ? 2 : 1;
    // Use compact (no time) when very busy
    const compact = maxPerDay > 4;

    return (
        <div className="flex flex-col gap-0 border rounded-lg overflow-hidden">
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 border-b bg-gray-50/60">
                {SHORT_DAYS_MON.map((d) => (
                    <div
                        key={d}
                        className="py-2 text-center text-xs font-medium text-muted-foreground border-r last:border-r-0"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* 6 week rows */}
            <div className="grid grid-cols-7 border-l border-t">
                {cells.map((day) => {
                    const key = isoDate(day);
                    const isThisMonth = day.getMonth() === monthStart.getMonth();
                    const isToday = key === todayIso;
                    const dayBookings = bookingsByDate[key] || [];
                    const visible = dayBookings.slice(0, visibleCount);
                    const overflow = dayBookings.length - visible.length;

                    return (
                        <div
                            key={key}
                            className={[
                                'min-h-[100px] border-r border-b flex flex-col gap-0.5 p-1',
                                isToday ? 'bg-blue-50/60' : '',
                                !isThisMonth ? 'opacity-35' : '',
                            ].join(' ')}
                        >
                            {/* Day number */}
                            <button
                                onClick={() => onDayClick(day)}
                                className={[
                                    'self-start w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold leading-none transition-colors mb-0.5',
                                    isToday
                                        ? 'bg-blue-600 text-white'
                                        : 'text-foreground hover:bg-muted',
                                ].join(' ')}
                            >
                                {day.getDate()}
                            </button>

                            {/* Booking pills */}
                            <div className="flex flex-col gap-0.5 min-w-0">
                                {visible.map((b) => (
                                    <BookingPill key={b.id} booking={b} onSelect={onSelect} compact={compact} />
                                ))}
                                {overflow > 0 && (
                                    <button
                                        onClick={() => onDayClick(day)}
                                        className="text-[10px] text-muted-foreground hover:text-foreground text-left pl-1.5 transition-colors"
                                    >
                                        +{overflow} more
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── WeekView ───────────────────────────────────────────────────────────────────
const WEEK_MAX_VISIBLE = 5; // max pills per column before overflow

function WeekView({ weekStart, todayIso, bookingsByDate, onSelect, onDayClick }) {
    const weekDays = useMemo(
        () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
        [weekStart]
    );

    // Find busiest column to decide whether to use compact pills
    const maxPerCol = useMemo(() => {
        return Math.max(1, ...weekDays.map((d) => (bookingsByDate[isoDate(d)] || []).length));
    }, [weekDays, bookingsByDate]);

    const compact = maxPerCol > 3;

    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Column headers */}
            <div className="grid grid-cols-7 border-b bg-gray-50/60">
                {weekDays.map((day, i) => {
                    const key = isoDate(day);
                    const isToday = key === todayIso;
                    const count = (bookingsByDate[key] || []).length;
                    return (
                        <div
                            key={key}
                            className={[
                                'py-3 text-center border-r last:border-r-0',
                                isToday ? 'bg-blue-50' : '',
                            ].join(' ')}
                        >
                            <p className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-muted-foreground'}`}>
                                {SHORT_DAYS_MON[i]}
                            </p>
                            <p className={`text-base font-bold leading-tight ${isToday ? 'text-blue-700' : ''}`}>
                                {day.getDate()}
                            </p>
                            {count > 0 && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {count} {count === 1 ? 'booking' : 'bookings'}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Day columns */}
            <div className="grid grid-cols-7 min-h-[360px]">
                {weekDays.map((day) => {
                    const key = isoDate(day);
                    const isToday = key === todayIso;
                    const dayBookings = bookingsByDate[key] || [];
                    const visible = dayBookings.slice(0, WEEK_MAX_VISIBLE);
                    const overflow = dayBookings.length - visible.length;

                    return (
                        <div
                            key={key}
                            className={[
                                'border-r last:border-r-0 p-1.5 flex flex-col gap-1',
                                isToday ? 'bg-blue-50/30' : '',
                            ].join(' ')}
                        >
                            {visible.map((b) => (
                                <BookingPill key={b.id} booking={b} onSelect={onSelect} compact={compact} />
                            ))}

                            {overflow > 0 && (
                                <button
                                    onClick={() => onDayClick && onDayClick(day)}
                                    className="text-[10px] text-muted-foreground hover:text-foreground text-left pl-1 transition-colors"
                                >
                                    +{overflow} more
                                </button>
                            )}

                            {dayBookings.length === 0 && (
                                <div className="flex-1 flex items-center justify-center">
                                    <span className="text-xs text-gray-200">—</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── DayView ────────────────────────────────────────────────────────────────────
function DayView({ day, todayIso, bookingsByDate, onSelect }) {
    const key = isoDate(day);
    const dayBookings = bookingsByDate[key] || [];

    // Sort by start time
    const sorted = [...dayBookings].sort((a, b) => {
        if (!a.scheduled_start) return 1;
        if (!b.scheduled_start) return -1;
        return a.scheduled_start < b.scheduled_start ? -1 : 1;
    });

    return (
        <div className="flex flex-col gap-3">
            {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border rounded-lg bg-gray-50/40">
                    <p className="text-sm font-medium">No bookings on this day</p>
                </div>
            ) : (
                sorted.map((b) => (
                    <BookingCard key={b.id} booking={b} onSelect={onSelect} />
                ))
            )}
        </div>
    );
}

// ── CalendarView (main) ────────────────────────────────────────────────────────

/**
 * CalendarView — three-mode calendar (Month / Week / Day) for all bookings.
 *
 * Props:
 *   onNavigate  — (view: string, params?: object) => void
 */
export default function CalendarView({ onNavigate }) {
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const todayIso = isoDate(today);

    // View mode: 'month' | 'week' | 'day'
    const [viewMode, setViewMode] = useState('month');

    // Cursor dates for each view mode
    const [monthStart, setMonthStart] = useState(() => getMonthStart(today));
    const [weekStart, setWeekStart] = useState(() => getWeekStart(today));
    const [dayDate, setDayDate] = useState(() => new Date(today));

    // Bookings data
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Selected booking for detail panel
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [paymentBooking, setPaymentBooking] = useState(null);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, status } = await ApiProxy.get('/api/bookings?include_canceled=true');
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
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Index bookings by YYYY-MM-DD key, sorted by start time within each day
    const bookingsByDate = useMemo(() => {
        const map = {};
        bookings.forEach((b) => {
            const key = bookingDateKey(b);
            if (!key) return;
            if (!map[key]) map[key] = [];
            map[key].push(b);
        });
        // Sort each day's bookings by start time
        Object.values(map).forEach((list) =>
            list.sort((a, b) => {
                if (!a.scheduled_start) return 1;
                if (!b.scheduled_start) return -1;
                return a.scheduled_start < b.scheduled_start ? -1 : 1;
            })
        );
        return map;
    }, [bookings]);

    // ── Navigation handlers ────────────────────────────────────────────────────

    const prev = () => {
        if (viewMode === 'month') setMonthStart((m) => addMonths(m, -1));
        else if (viewMode === 'week') setWeekStart((w) => addDays(w, -7));
        else setDayDate((d) => addDays(d, -1));
    };

    const next = () => {
        if (viewMode === 'month') setMonthStart((m) => addMonths(m, 1));
        else if (viewMode === 'week') setWeekStart((w) => addDays(w, 7));
        else setDayDate((d) => addDays(d, 1));
    };

    const goToday = () => {
        setMonthStart(getMonthStart(today));
        setWeekStart(getWeekStart(today));
        setDayDate(new Date(today));
    };

    /** Called when a month-view day number is clicked — navigate to Day view. */
    const handleDayClick = (day) => {
        setDayDate(day);
        setViewMode('day');
    };

    const handleUpdate = useCallback((updatedBooking) => {
        setBookings((prev) =>
            prev.map((b) => (b.id === updatedBooking.id ? { ...b, ...updatedBooking } : b))
        );
        setSelectedBooking((prev) =>
            prev?.id === updatedBooking.id ? { ...prev, ...updatedBooking } : prev
        );
    }, []);

    // ── Date label in header ───────────────────────────────────────────────────

    const dateLabel = useMemo(() => {
        if (viewMode === 'month') {
            return `${MONTH_NAMES[monthStart.getMonth()]} ${monthStart.getFullYear()}`;
        }
        if (viewMode === 'week') {
            const weekEnd = addDays(weekStart, 6);
            const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
            const startStr = weekStart.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
            const endStr = weekEnd.toLocaleDateString('en-ZA', {
                day: 'numeric',
                month: sameMonth ? undefined : 'short',
                year: 'numeric',
            });
            return `${startStr} – ${endStr}`;
        }
        // day view
        return dayDate.toLocaleDateString('en-ZA', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }, [viewMode, monthStart, weekStart, dayDate]);

    // ── Is "Today" button relevant? ────────────────────────────────────────────

    const isTodayActive =
        viewMode === 'month'
            ? isoDate(monthStart) === isoDate(getMonthStart(today))
            : viewMode === 'week'
            ? isoDate(weekStart) === isoDate(getWeekStart(today))
            : isoDate(dayDate) === todayIso;

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-[1600px] mx-auto w-full">
            {/* ── Page title ── */}
            <div>
                <h2 className="text-2xl font-bold">Bookings Calendar</h2>
                <p className="text-sm text-muted-foreground">
                    {viewMode === 'month' ? 'Monthly' : viewMode === 'week' ? 'Weekly' : 'Daily'} overview of all bookings
                </p>
            </div>

            {/* ── Calendar controls ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Left: prev / date label / next / Today */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 border rounded-md">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={prev}
                            className="h-8 w-8 p-0"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium px-3 whitespace-nowrap min-w-[180px] text-center">
                            {dateLabel}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={next}
                            className="h-8 w-8 p-0"
                            aria-label="Next"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToday}
                        disabled={isTodayActive}
                    >
                        Today
                    </Button>
                </div>

                {/* Right: view mode toggle + refresh */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md overflow-hidden">
                        {(['month', 'week', 'day'] ).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={[
                                    'px-3 py-1.5 text-sm capitalize transition-colors',
                                    viewMode === mode
                                        ? 'bg-primary text-primary-foreground font-medium'
                                        : 'hover:bg-muted text-muted-foreground',
                                ].join(' ')}
                            >
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchBookings}
                        disabled={loading}
                        aria-label="Refresh bookings"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* ── Error banner ── */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* ── Loading state ── */}
            <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground border rounded-lg">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3" />
                            <p className="text-sm">Loading bookings...</p>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'month' && (
                                <MonthView
                                    monthStart={monthStart}
                                    todayIso={todayIso}
                                    bookingsByDate={bookingsByDate}
                                    onSelect={setSelectedBooking}
                                    onDayClick={handleDayClick}
                                />
                            )}
                            {viewMode === 'week' && (
                                <WeekView
                                    weekStart={weekStart}
                                    todayIso={todayIso}
                                    bookingsByDate={bookingsByDate}
                                    onSelect={setSelectedBooking}
                                    onDayClick={handleDayClick}
                                />
                            )}
                            {viewMode === 'day' && (
                                <DayView
                                    day={dayDate}
                                    todayIso={todayIso}
                                    bookingsByDate={bookingsByDate}
                                    onSelect={setSelectedBooking}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Booking detail panel ── */}
            {selectedBooking && (
                <BookingDetailPanel
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onUpdate={handleUpdate}
                    onNavigate={onNavigate}
                    onOpenPayment={(booking) => {
                        setSelectedBooking(null);
                        setPaymentBooking(booking);
                    }}
                />
            )}

            {/* ── Payment panel ── */}
            {paymentBooking && (
                <PaymentPanel
                    booking={paymentBooking}
                    onClose={() => setPaymentBooking(null)}
                    onPaymentRecorded={() => fetchBookings()}
                />
            )}
        </div>
    );
}
