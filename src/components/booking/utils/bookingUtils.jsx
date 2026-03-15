export const getStatusBadge = (status) => {
    const variants = {
        confirmed: "default",
        completed: "secondary",
        pending: "outline",
        cancelled: "destructive",
    };
    return variants[status] || "outline";
};

export const getRelativeDate = (dateObj) => {
    if (!dateObj || !(dateObj instanceof Date)) return "-";
    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
        const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

        if (dateOnly.getTime() === todayOnly.getTime()) return "Today";
        if (dateOnly.getTime() === tomorrowOnly.getTime()) return "Tomorrow";
        if (dateOnly.getTime() === yesterdayOnly.getTime()) return "Yesterday";
        
        return dateObj.toLocaleDateString("en-ZA", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    } catch (error) {
        return "-";
    }
};

export const formatTime = (dateObj) => {
    if (!dateObj || !(dateObj instanceof Date)) return "-";
    try {
        return dateObj.toLocaleTimeString("en-ZA", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    } catch (error) {
        return "-";
    }
};

export const isPast = (dateObj) => {
    if (!dateObj || !(dateObj instanceof Date)) return false;
    return dateObj < new Date();
};

/**
 * Sort order:
 *   1. Upcoming active (scheduled/pending, date ≥ now)  — soonest first
 *   2. Everything else (past, completed, cancelled …)   — most recent first
 *
 * Status is a tiebreaker within the same timestamp.
 * Status order: scheduled → pending → completed → no_show → cancelled → deleted
 */
const STATUS_ORDER = { scheduled: 0, pending: 1, completed: 2, no_show: 3, cancelled: 4, deleted: 5 };

const ACTIVE_STATUSES = new Set(["scheduled", "pending"]);

export const sortBookings = (bookings) => {
    if (!Array.isArray(bookings) || bookings.length === 0) return bookings;

    const now = new Date();

    const isUpcomingActive = (booking) => {
        const d = booking.scheduled_start_local;
        return d && d >= now && ACTIVE_STATUSES.has((booking.status || "").toLowerCase());
    };

    return [...bookings].sort((a, b) => {
        const ua = isUpcomingActive(a);
        const ub = isUpcomingActive(b);

        if (ua !== ub) return ua ? -1 : 1;

        const da = a.scheduled_start_local;
        const db = b.scheduled_start_local;

        if (da && db) {
            const diff = ua ? da - db : db - da;
            if (diff !== 0) return diff;
        } else if (da) return -1;
        else if (db) return 1;

        const sa = STATUS_ORDER[(a.status || "").toLowerCase()] ?? 99;
        const sb = STATUS_ORDER[(b.status || "").toLowerCase()] ?? 99;
        return sa - sb;
    });
};