import { Button } from '@/components/ui/button';
import { Plus, CalendarOff } from 'lucide-react';
import BookingRow from '@/components/booking/view/BookingRow';

/** Number of skeleton columns — must match the real table header count */
const SKELETON_COLS = 9;

/**
 * BookingsTable — renders the bookings list.
 *
 * Props:
 *   bookings         — filtered array of booking objects
 *   loading          — boolean; shows skeleton rows when true
 *   activeFilterCount — number of active filters (affects empty state message)
 *   onNavigate       — (view: string) => void
 *   onSelectBooking  — (booking) => void — opens BookingDetailPanel
 *   onPayment        — (booking) => void — opens PaymentPanel
 */
export default function BookingsTable({
    bookings,
    loading,
    activeFilterCount,
    onNavigate,
    onSelectBooking,
    onPayment,
    onCancel,
    onComplete,
}) {
    return (
        <div className="w-full overflow-x-auto min-w-[900px]">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="border-b bg-gray-50/50">
                        <th className="text-left p-3 md:p-4 font-medium text-muted-foreground">Student</th>
                        <th className="text-left p-3 md:p-4 font-medium text-muted-foreground hidden sm:table-cell">Instructor</th>
                        <th className="text-left p-3 md:p-4 font-medium text-muted-foreground">Date & Time</th>
                        <th className="text-left p-3 md:p-4 font-medium text-muted-foreground hidden md:table-cell">Duration</th>
                        <th className="text-left p-3 md:p-4 font-medium text-muted-foreground hidden md:table-cell">Lesson / Vehicle</th>
                        <th className="text-left p-3 md:p-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 md:p-4 font-medium text-muted-foreground hidden lg:table-cell">Contact</th>
                        <th className="text-left p-3 md:p-4 font-medium text-muted-foreground hidden lg:table-cell">Location</th>
                        <th className="text-left p-3 md:p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <tr key={i} className="border-b">
                                <td className="p-3 md:p-4">
                                    <div className="h-4 bg-gray-100 rounded animate-pulse w-28" />
                                    <div className="h-3 bg-gray-100 rounded animate-pulse w-20 mt-1" />
                                </td>
                                <td className="p-3 md:p-4 hidden sm:table-cell">
                                    <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
                                </td>
                                <td className="p-3 md:p-4">
                                    <div className="h-4 bg-gray-100 rounded animate-pulse w-20" />
                                    <div className="h-3 bg-gray-100 rounded animate-pulse w-16 mt-1" />
                                </td>
                                <td className="p-3 md:p-4 hidden md:table-cell">
                                    <div className="h-4 bg-gray-100 rounded animate-pulse w-14" />
                                </td>
                                <td className="p-3 md:p-4 hidden md:table-cell">
                                    <div className="h-4 bg-gray-100 rounded animate-pulse w-16" />
                                    <div className="h-3 bg-gray-100 rounded animate-pulse w-12 mt-1" />
                                </td>
                                <td className="p-3 md:p-4">
                                    <div className="h-5 bg-gray-100 rounded-full animate-pulse w-20" />
                                </td>
                                <td className="p-3 md:p-4 hidden lg:table-cell">
                                    <div className="h-4 bg-gray-100 rounded animate-pulse w-28" />
                                </td>
                                <td className="p-3 md:p-4 hidden lg:table-cell">
                                    <div className="h-4 bg-gray-100 rounded animate-pulse w-28" />
                                </td>
                                <td className="p-3 md:p-4">
                                    <div className="flex gap-1">
                                        <div className="h-8 w-8 bg-gray-100 rounded animate-pulse" />
                                        <div className="h-8 w-8 bg-gray-100 rounded animate-pulse" />
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <BookingRow
                                key={booking.id}
                                booking={booking}
                                onSelect={onSelectBooking}
                                onPayment={onPayment}
                                onCancel={onCancel}
                                onComplete={onComplete}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={SKELETON_COLS} className="text-center p-12 text-muted-foreground">
                                <CalendarOff className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p className="font-medium mb-1">
                                    {activeFilterCount > 0
                                        ? 'No bookings match your filters'
                                        : 'No bookings found'}
                                </p>
                                <p className="text-sm mb-4">
                                    {activeFilterCount > 0
                                        ? 'Try adjusting or clearing your search criteria.'
                                        : 'Create your first booking to get started.'}
                                </p>
                                {activeFilterCount === 0 && (
                                    <Button
                                        size="sm"
                                        onClick={() => onNavigate && onNavigate('create-booking')}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create First Booking
                                    </Button>
                                )}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
