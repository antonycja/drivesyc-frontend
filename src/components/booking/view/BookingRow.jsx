import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MoreHorizontal, Phone, Mail, MapPin } from "lucide-react";
import { getStatusBadge, getRelativeDate, formatTime, isPast } from '@/components/booking/utils/bookingUtils';

export default function BookingRow({ booking }) {
    return (
        <tr
            className={`border-b hover:bg-muted/50 transition-colors ${isPast(booking.scheduled_start_local) ? 'bg-gray-50 text-gray-600' : ''
                }`}
        >
            <td className="p-4">
                <div className="font-medium">
                    {booking.learner_name ||
                        `${booking.temp_learner_name || ''} ${booking.temp_learner_surname || ''}`.trim() || 'N/A'}
                </div>
                {booking.temp_learner_email && (
                    <div className="text-xs text-muted-foreground">
                        {booking.temp_learner_email}
                    </div>
                )}
            </td>
            <td className="p-4">{booking.instructor_name || 'N/A'}</td>
            <td className="p-4">
                <div className="text-sm">
                    <div className="font-medium">{getRelativeDate(booking.scheduled_start_local)}</div>
                    <div className="text-muted-foreground">
                        {formatTime(booking.scheduled_start_local)}
                        {booking.scheduled_end_local && (
                            <span> - {formatTime(booking.scheduled_end_local)}</span>
                        )}
                    </div>
                </div>
            </td>
            <td className="p-4">
                <div className="text-sm">
                    <div>{booking.duration_minutes ? `${booking.duration_minutes} min` : 'N/A'}</div>
                    {booking.total_hours_booked > 0 && (
                        <div className="text-muted-foreground text-xs">
                            {booking.total_hours_booked}h booked
                        </div>
                    )}
                </div>
            </td>
            <td className="p-4">
                <div className="text-sm">
                    <div className="font-medium">
                        {booking.created_at_local ? booking.created_at_local.toLocaleDateString("en-ZA", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit"
                        }) : 'N/A'}
                    </div>
                    <div className="text-muted-foreground text-xs">
                        {booking.created_by_name || 'System'}
                    </div>
                </div>
            </td>
            <td className="p-4">
                <div className="text-sm">
                    <div className="font-medium">
                        {booking.vehicle_class ? booking.vehicle_class.replace('_', ' ').toUpperCase() : 'N/A'}
                    </div>
                    <div className="text-muted-foreground">
                        {booking.vehicle_transmission || 'N/A'}
                    </div>
                </div>
            </td>
            <td className="p-4">
                <div className="text-xs">
                    {booking.is_pickup_required ? (
                        <>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    booking.pickup_location || "Not specified"
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-green-600 mb-1 hover:underline"
                                title="Open in Google Maps"
                            >
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>Pickup: {booking.pickup_location || "Not specified"}</span>
                            </a>

                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    booking.dropoff_location || "Not specified"
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:underline"
                                title="Open in Google Maps"
                            >
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>Dropoff: {booking.dropoff_location || "Not specified"}</span>
                            </a>
                        </>
                    ) : (
                        <span className="text-muted-foreground">No pickup required</span>
                    )}
                </div>
            </td>
            <td className="p-4">
                <div className="flex flex-col space-y-1">
                    {(booking.learner_phone_number || booking.temp_learner_phone) && (
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 mr-1" />
                            {booking.learner_phone_number || booking.temp_learner_phone}
                        </div>
                    )}

                    {(booking.learner_email || booking.temp_learner_email) && (
                        <a
                            href={`mailto:${booking.learner_email || booking.temp_learner_email}`}
                            className="flex items-center text-xs text-muted-foreground hover:underline"
                            title="Click to email"
                        >
                            <Mail className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-[120px]">
                                {booking.learner_email || booking.temp_learner_email}
                            </span>
                        </a>
                    )}
                </div>
            </td>
            <td className="p-4">
                <Badge variant={getStatusBadge(booking.status)}>
                    {booking.status
                        ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1)
                        : 'Unknown'
                    }
                </Badge>
            </td>
            <td className="p-4">
                <div className="flex items-center space-x-1">
                    <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-3 w-3" />
                    </Button>
                </div>
            </td>
        </tr>
    );
}