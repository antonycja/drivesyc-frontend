import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MapPin, Phone, Mail, CreditCard, XCircle, CheckCircle2 } from 'lucide-react';
import { getRelativeDate, formatTime, isPast } from '@/components/booking/utils/bookingUtils';

const LICENCE_CODE_LABELS = {
    A1: 'A1', A: 'A', B: 'B', EB: 'EB',
    C1: 'C1', EC1: 'EC1', C: 'C', EC: 'EC',
};

const STATUS_BADGE_COLORS = {
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    no_show: 'bg-red-100 text-red-800 border-red-200',
};

export default function BookingRow({ booking, onSelect, onPayment, onCancel, onComplete }) {
    const [actionLoading, setActionLoading] = useState(null); // 'cancel' | 'complete' | null
    const statusKey = booking.status?.toLowerCase();
    const statusColor = STATUS_BADGE_COLORS[statusKey] || STATUS_BADGE_COLORS.pending;
    const past = isPast(booking.scheduled_start_local);
    const isTerminal = statusKey === 'completed' || statusKey === 'cancelled' || statusKey === 'deleted';

    const learnerName =
        booking.learner_name ||
        `${booking.temp_learner_name || ''} ${booking.temp_learner_surname || ''}`.trim() ||
        'N/A';

    const contact_phone = booking.learner_phone_number || booking.temp_learner_phone;
    const contact_email = booking.learner_email || booking.temp_learner_email;

    const mapsUrl = (location) =>
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || '')}`;

    const handleRowClick = () => {
        if (onSelect) onSelect(booking);
    };

    const handleActionClick = (e) => {
        // Prevent the row click from firing on interactive cells
        e.stopPropagation();
    };

    const handleViewClick = (e) => {
        e.stopPropagation();
        if (onSelect) onSelect(booking);
    };

    const handlePaymentClick = (e) => {
        e.stopPropagation();
        if (onPayment) onPayment(booking);
        else if (onSelect) onSelect(booking);
    };

    const handleCancelClick = async (e) => {
        e.stopPropagation();
        if (!onCancel || actionLoading) return;
        setActionLoading('cancel');
        try {
            await onCancel(booking);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCompleteClick = async (e) => {
        e.stopPropagation();
        if (!onComplete || actionLoading) return;
        setActionLoading('complete');
        try {
            await onComplete(booking);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <tr
            onClick={handleRowClick}
            className={[
                'border-b cursor-pointer transition-colors',
                past ? 'bg-gray-50/60 text-gray-600 hover:bg-gray-100/70' : 'hover:bg-muted/50',
            ].join(' ')}
        >
            {/* Learner */}
            <td className="p-3 md:p-4">
                <div className="font-medium text-sm truncate max-w-[140px]">{learnerName}</div>
                {contact_email && (
                    <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                        {contact_email}
                    </div>
                )}
            </td>

            {/* Instructor */}
            <td className="p-3 md:p-4 hidden sm:table-cell">
                <span className="text-sm">{booking.instructor_name || 'Unassigned'}</span>
            </td>

            {/* Date & Time */}
            <td className="p-3 md:p-4">
                <div className="text-sm font-medium">{getRelativeDate(booking.scheduled_start_local)}</div>
                <div className="text-xs text-muted-foreground">
                    {formatTime(booking.scheduled_start_local)}
                    {booking.scheduled_end_local && (
                        <span> – {formatTime(booking.scheduled_end_local)}</span>
                    )}
                </div>
            </td>

            {/* Duration */}
            <td className="p-3 md:p-4 hidden md:table-cell">
                <span className="text-sm">
                    {booking.duration_minutes ? `${booking.duration_minutes} min` : '—'}
                </span>
            </td>

            {/* Lesson / Vehicle */}
            <td className="p-3 md:p-4 hidden md:table-cell">
                <div className="flex flex-col gap-1">
                    {booking.licence_code && (
                        <Badge variant="outline" className="text-xs w-fit font-normal">
                            {LICENCE_CODE_LABELS[booking.licence_code] || booking.licence_code}
                        </Badge>
                    )}
                    {booking.vehicle_transmission && (
                        <span className="text-xs text-muted-foreground capitalize">
                            {booking.vehicle_transmission}
                        </span>
                    )}
                    {!booking.licence_code && !booking.vehicle_transmission && (
                        <span className="text-xs text-muted-foreground">—</span>
                    )}
                </div>
            </td>

            {/* Status */}
            <td className="p-3 md:p-4">
                <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className={`${statusColor} border text-xs capitalize w-fit`}>
                        {booking.status ? booking.status.replace('_', ' ') : 'Unknown'}
                    </Badge>
                    {(() => {
                        const total = Number(booking.total_amount) || 0;
                        const paid = Number(booking.amount_paid) || 0;
                        if (total === 0 && paid === 0) return null;
                        const label = paid >= total && total > 0 ? 'Paid' : paid > 0 && paid < total ? 'Partial' : paid > 0 ? 'Paid' : 'Unpaid';
                        const color = label === 'Paid'
                            ? 'text-green-600'
                            : label === 'Partial'
                            ? 'text-amber-600'
                            : 'text-red-500';
                        return (
                            <span className={`text-xs font-medium ${color}`}>{label}</span>
                        );
                    })()}
                </div>
            </td>

            {/* Contact — phone + email, visible on lg+ */}
            <td className="p-3 md:p-4 hidden lg:table-cell" onClick={handleActionClick}>
                <div className="flex flex-col gap-1">
                    {contact_phone && (
                        <a
                            href={`tel:${contact_phone}`}
                            className="flex items-center gap-1 text-sm hover:underline"
                            aria-label={`Call ${learnerName}`}
                        >
                            <Phone className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[140px]">{contact_phone}</span>
                        </a>
                    )}
                    {contact_email && (
                        <a
                            href={`mailto:${contact_email}`}
                            className="flex items-center gap-1 text-sm hover:underline"
                            aria-label={`Email ${learnerName}`}
                        >
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[140px]">{contact_email}</span>
                        </a>
                    )}
                    {!contact_phone && !contact_email && (
                        <span className="text-xs text-muted-foreground">—</span>
                    )}
                </div>
            </td>

            {/* Location — pickup + dropoff, visible on lg+ */}
            <td className="p-3 md:p-4 hidden lg:table-cell" onClick={handleActionClick}>
                <div className="flex flex-col gap-1">
                    {booking.is_pickup_required === false ? (
                        <span className="text-xs text-muted-foreground">No pickup</span>
                    ) : (
                        <>
                            {booking.pickup_location && (
                                <a
                                    href={mapsUrl(booking.pickup_location)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                    aria-label="Open pickup location in Google Maps"
                                >
                                    <MapPin className="h-3 w-3 shrink-0" />
                                    <span className="truncate max-w-[140px]">Pickup: {booking.pickup_location}</span>
                                </a>
                            )}
                            {booking.dropoff_location && (
                                <a
                                    href={mapsUrl(booking.dropoff_location)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                    aria-label="Open dropoff location in Google Maps"
                                >
                                    <MapPin className="h-3 w-3 shrink-0" />
                                    <span className="truncate max-w-[140px]">Dropoff: {booking.dropoff_location}</span>
                                </a>
                            )}
                            {!booking.pickup_location && !booking.dropoff_location && (
                                <span className="text-xs text-muted-foreground">—</span>
                            )}
                        </>
                    )}
                </div>
            </td>

            {/* Actions */}
            <td className="p-3 md:p-4" onClick={handleActionClick}>
                <div className="flex items-center gap-1 flex-wrap">
                    {!isTerminal && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCompleteClick}
                            disabled={!!actionLoading}
                            className="h-8 w-8 p-0 border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-50"
                            aria-label="Mark booking as completed"
                            title="Complete"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                    {!isTerminal && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelClick}
                            disabled={!!actionLoading}
                            className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            aria-label="Cancel booking"
                            title="Cancel"
                        >
                            <XCircle className="h-3.5 w-3.5" />
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePaymentClick}
                        className="h-8 w-8 p-0 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        aria-label="View payment details"
                        title="Payment"
                    >
                        <CreditCard className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleViewClick}
                        className="h-8 w-8 p-0"
                        aria-label="View booking details"
                        title="View Booking"
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </td>
        </tr>
    );
}
