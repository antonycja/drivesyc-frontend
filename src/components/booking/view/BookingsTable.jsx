import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MoreHorizontal, Plus } from "lucide-react";
import BookingRow from '@/components/booking/view/BookingRow';

export default function BookingsTable({ bookings, activeFilterCount, onNavigate }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-left p-4 font-medium">Student</th>
                        <th className="text-left p-4 font-medium">Instructor</th>
                        <th className="text-left p-4 font-medium">Date & Time</th>
                        <th className="text-left p-4 font-medium">Duration</th>
                        <th className="text-left p-4 font-medium">Created</th>
                        <th className="text-left p-4 font-medium">Vehicle</th>
                        <th className="text-left p-4 font-medium">Pickup/Dropoff</th>
                        <th className="text-left p-4 font-medium">Contact</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <BookingRow
                                key={booking.id}
                                booking={booking}
                            />
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={10}
                                className="text-center p-12 text-muted-foreground"
                            >
                                {activeFilterCount > 0
                                    ? 'No bookings match your search criteria'
                                    : 'No bookings found. Create your first booking to get started.'
                                }
                                {activeFilterCount === 0 && (
                                    <div className="mt-4">
                                        <Button onClick={() => onNavigate && onNavigate('create-booking')}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create First Booking
                                        </Button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
