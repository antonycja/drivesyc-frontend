'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    X,
    Phone,
    Mail,
    MapPin,
    User,
    Clock,
    Calendar,
    Car,
    CreditCard,
    FileText,
    Pencil,
} from 'lucide-react';
import ApiProxy from '@/app/api/lib/proxy';


const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'NO_SHOW', label: 'No Show' },
];

const STATUS_COLORS = {
    SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    NO_SHOW: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_HEADER_BG = {
    SCHEDULED: 'bg-blue-50 border-b border-blue-100',
    COMPLETED: 'bg-green-50 border-b border-green-100',
    CANCELLED: 'bg-gray-50 border-b border-gray-200',
    PENDING: 'bg-yellow-50 border-b border-yellow-100',
    NO_SHOW: 'bg-red-50 border-b border-red-100',
};

function formatCurrency(val) {
    if (val === null || val === undefined || isNaN(val)) return 'R0';
    return `R${new Intl.NumberFormat('en-ZA').format(Number(val))}`;
}

/**
 * BookingDetailPanel — right-side slide-in panel for viewing and editing a booking.
 *
 * Props:
 *   booking        — the booking object to display
 *   onClose        — () => void
 *   onUpdate       — (updatedBooking) => void  — called after a successful PATCH
 *   onNavigate     — (view: string, params?: object) => void — optional; enables Edit Booking button
 *   onOpenPayment  — (booking) => void — optional; opens PaymentPanel for this booking
 */
export default function BookingDetailPanel({ booking, onClose, onUpdate, onNavigate, onOpenPayment }) {
    const [editStatus, setEditStatus] = useState(booking?.status?.toUpperCase() || '');
    const [editNotes, setEditNotes] = useState(booking?.notes || '');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Slide-in animation — triggers on the next frame after mount
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(t);
    }, []);

    // Sync form state when booking prop changes
    useEffect(() => {
        if (booking) {
            setEditStatus(booking.status?.toUpperCase() || '');
            setEditNotes(booking.notes || '');
            setSaveError(null);
            setSaveSuccess(false);
        }
    }, [booking?.id]);

    // Disable body scroll while panel is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!booking) return null;

    const learnerName =
        booking.learner_name ||
        `${booking.temp_learner_name || ''} ${booking.temp_learner_surname || ''}`.trim() ||
        `Booking #${booking.id}`;

    const headerBg = STATUS_HEADER_BG[booking.status?.toUpperCase()] || STATUS_HEADER_BG.PENDING;
    const statusColorClass = STATUS_COLORS[booking.status?.toUpperCase()] || STATUS_COLORS.PENDING;

    const formatDateTime = (isoStr) => {
        if (!isoStr) return null;
        const d = new Date(isoStr.endsWith('Z') ? isoStr : isoStr + 'Z');
        return d.toLocaleString('en-ZA', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    const formatTime = (isoStr) => {
        if (!isoStr) return null;
        const d = new Date(isoStr.endsWith('Z') ? isoStr : isoStr + 'Z');
        return d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const mapsUrl = (location) =>
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || '')}`;

    const handleSave = async () => {
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        const updatePayload = {};
        if (editStatus && editStatus !== booking.status?.toUpperCase()) {
            updatePayload.status = editStatus;
        }
        // Always send notes — it may have been cleared
        updatePayload.notes = editNotes || null;

        if (Object.keys(updatePayload).length === 0) {
            setSaving(false);
            return;
        }

        try {
            const { data, status } = await ApiProxy.patch(`/api/bookings/${booking.id}`, updatePayload);
            if (status === 200) {
                setSaveSuccess(true);
                if (onUpdate) onUpdate(data);
                setTimeout(() => setSaveSuccess(false), 2500);
            } else {
                setSaveError(data?.message || 'Failed to save changes. Please try again.');
            }
        } catch {
            setSaveError('Unable to reach the service. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const startTime = formatDateTime(booking.scheduled_start);
    const endTime = formatTime(booking.scheduled_end);

    const durationLabel = booking.duration_minutes
        ? booking.duration_minutes >= 60
            ? `${(booking.duration_minutes / 60).toFixed(1).replace('.0', '')}h`
            : `${booking.duration_minutes} min`
        : null;

    const contact_phone = booking.learner_phone_number || booking.temp_learner_phone;
    const contact_email = booking.learner_email || booking.temp_learner_email;

    // Payment summary derived directly from booking fields — no fetch needed in this panel
    const totalAmount = Number(booking.total_amount) || 0;
    const amountPaid = Number(booking.amount_paid) || 0;
    const paymentStatusLabel = totalAmount === 0
        ? 'No amount set'
        : amountPaid >= totalAmount
            ? 'Paid'
            : amountPaid > 0
                ? 'Partial'
                : 'Unpaid';
    const paymentBadgeColor = totalAmount === 0
        ? 'bg-gray-100 text-gray-600 border-gray-200'
        : amountPaid >= totalAmount
            ? 'bg-green-100 text-green-800 border-green-200'
            : amountPaid > 0
                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                : 'bg-red-100 text-red-800 border-red-200';

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                className={`fixed right-0 top-0 h-full w-full sm:w-[480px] z-50 bg-background shadow-2xl flex flex-col overflow-y-auto transition-transform duration-300 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-label={`Booking for ${learnerName}`}
            >
                {/* Colored header */}
                <div className={`px-6 pt-5 pb-4 pr-12 ${headerBg} shrink-0`}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Booking #{booking.id}</p>
                            <h2 className="text-lg font-bold leading-tight truncate">{learnerName}</h2>
                            {booking.driving_school_name && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{booking.driving_school_name}</p>
                            )}
                        </div>
                        <Badge variant="secondary" className={`${statusColorClass} shrink-0 border`}>
                            {booking.status?.charAt(0).toUpperCase() + (booking.status?.slice(1).toLowerCase() || '')}
                        </Badge>
                    </div>
                </div>

                {/* Close button — absolute, avoids header overlap */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:bg-black/10 transition-colors z-10"
                    aria-label="Close panel"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Body */}
                <div className="p-4 space-y-5 flex-1">

                    {/* Payment — prominent card at the top */}
                    <button
                        type="button"
                        onClick={onOpenPayment ? () => { onClose(); onOpenPayment(booking); } : undefined}
                        className={`w-full text-left rounded-lg border-2 p-4 transition-colors ${
                            onOpenPayment ? 'cursor-pointer hover:bg-muted/60 active:bg-muted' : 'cursor-default'
                        } ${
                            totalAmount === 0
                                ? 'border-gray-200 bg-gray-50'
                                : amountPaid >= totalAmount
                                    ? 'border-green-200 bg-green-50'
                                    : amountPaid > 0
                                        ? 'border-amber-200 bg-amber-50'
                                        : 'border-red-200 bg-red-50'
                        }`}
                        aria-label="Open payment panel"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-semibold">Payment</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className={`${paymentBadgeColor} border text-xs`}>
                                    {paymentStatusLabel}
                                </Badge>
                                {onOpenPayment && (
                                    <span className="text-xs text-muted-foreground">Tap to manage →</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-2xl font-bold">{formatCurrency(amountPaid)}</p>
                                <p className="text-xs text-muted-foreground">
                                    {totalAmount > 0 ? `of ${formatCurrency(totalAmount)} total` : 'No amount set'}
                                </p>
                            </div>
                            {totalAmount > 0 && (
                                <div className="text-right">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Outstanding
                                    </p>
                                    <p className={`text-lg font-bold ${totalAmount - amountPaid > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(Math.max(0, totalAmount - amountPaid))}
                                    </p>
                                </div>
                            )}
                        </div>
                    </button>

                    {/* Booking Details */}
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Booking Details</p>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
                            {startTime && (
                                <>
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 shrink-0" /> Date
                                    </span>
                                    <span className="font-medium">{startTime}{endTime ? ` – ${endTime}` : ''}</span>
                                </>
                            )}
                            {durationLabel && (
                                <>
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 shrink-0" /> Duration
                                    </span>
                                    <span className="font-medium">{durationLabel}</span>
                                </>
                            )}
                            {booking.instructor_name && (
                                <>
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 shrink-0" /> Instructor
                                    </span>
                                    <span className="font-medium">{booking.instructor_name}</span>
                                </>
                            )}
                            {(booking.licence_code || booking.vehicle_class || booking.vehicle_transmission) && (
                                <>
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Car className="h-3.5 w-3.5 shrink-0" /> Vehicle
                                    </span>
                                    <span className="font-medium">
                                        {[booking.licence_code || booking.vehicle_class, booking.vehicle_transmission]
                                            .filter(Boolean)
                                            .map(v => v.replace('_', ' '))
                                            .join(' · ')}
                                    </span>
                                </>
                            )}
                            {booking.lesson_type && (
                                <>
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5 shrink-0" /> Lesson
                                    </span>
                                    <span className="font-medium capitalize">{booking.lesson_type}</span>
                                </>
                            )}
                            {booking.created_by_name && (
                                <>
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 shrink-0" /> Created by
                                    </span>
                                    <span className="font-medium">{booking.created_by_name}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Pickup / Dropoff */}
                    {booking.is_pickup_required && (
                        <>
                            <hr className="border-border" />
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pickup / Dropoff</p>
                                {booking.pickup_location && (
                                    <div className="flex items-start gap-2.5">
                                        <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <MapPin className="h-3 w-3 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-0.5">Pickup</p>
                                            <a
                                                href={mapsUrl(booking.pickup_location)}
                                                className="text-sm font-medium text-blue-600 hover:underline break-words"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {booking.pickup_location}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {booking.dropoff_location && (
                                    <div className="flex items-start gap-2.5">
                                        <div className="mt-0.5 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <MapPin className="h-3 w-3 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-0.5">Dropoff</p>
                                            <a
                                                href={mapsUrl(booking.dropoff_location)}
                                                className="text-sm font-medium text-blue-600 hover:underline break-words"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {booking.dropoff_location}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Contact */}
                    {(contact_phone || contact_email) && (
                        <>
                            <hr className="border-border" />
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contact</p>
                                <div className="flex flex-col gap-2">
                                    {contact_phone && (
                                        <a
                                            href={`tel:${contact_phone}`}
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                            aria-label={`Call ${learnerName}`}
                                        >
                                            <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <Phone className="h-3.5 w-3.5 text-blue-600" />
                                            </div>
                                            <span>{contact_phone}</span>
                                        </a>
                                    )}
                                    {contact_email && (
                                        <a
                                            href={`mailto:${contact_email}`}
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline min-w-0"
                                            aria-label={`Email ${learnerName}`}
                                        >
                                            <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <Mail className="h-3.5 w-3.5 text-blue-600" />
                                            </div>
                                            <span className="truncate">{contact_email}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Notes (read-only display if present) */}
                    {booking.notes && (
                        <>
                            <hr className="border-border" />
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Notes</p>
                                <p className="text-sm text-muted-foreground bg-muted/40 rounded-md p-3 leading-relaxed">{booking.notes}</p>
                            </div>
                        </>
                    )}

                    {/* Actions */}
                    <hr className="border-border" />
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Update Status / Notes</p>

                        <div>
                            <Label htmlFor="status-select" className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">
                                Status
                            </Label>
                            <select
                                id="status-select"
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="notes-textarea" className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">
                                Edit Notes
                            </Label>
                            <Textarea
                                id="notes-textarea"
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="Add or update internal notes..."
                                rows={3}
                                className="text-sm resize-none"
                            />
                        </div>

                        {saveError && (
                            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
                                {saveError}
                            </p>
                        )}

                        {saveSuccess && (
                            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2">
                                Changes saved successfully.
                            </p>
                        )}

                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full"
                            size="sm"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>

                        {onNavigate && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                    onClose();
                                    onNavigate('edit-booking', { bookingId: booking.id });
                                }}
                            >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Booking
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
