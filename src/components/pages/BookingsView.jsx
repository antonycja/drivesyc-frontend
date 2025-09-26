"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/components/auth/utils/authProvider';

import {
    Card,
    CardHeader,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
    Plus,
    Search,
    Eye,
    Edit,
    MoreHorizontal,
    Filter,
    Calendar,
    Clock,
    User,
    Phone,
    Mail,
    MapPin,
    Car,
    X,
    ArrowUp
} from "lucide-react";

export default function BookingsView({
    onNavigate,
    formatNumber,
    formatCurrency
}) {
    const router = useRouter();
    const auth = useAuth();

    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [timeFilter, setTimeFilter] = useState("all");
    const [transmissionFilter, setTransmissionFilter] = useState("all");
    const [vehicleClassFilter, setVehicleClassFilter] = useState("all");
    const [pickupFilter, setPickupFilter] = useState("all");
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Handle scroll to show/hide scroll-to-top button and compact filter
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 150;
            setShowScrollTop(window.scrollY > 400);
            setIsScrolled(scrolled);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const fetchBookings = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await fetch("/api/bookings", {
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();

            if (response.ok) {
                const bookingsArray = Array.isArray(data)
                    ? data
                    : data?.bookings || [];

                const now = new Date();

                // Separate upcoming and past bookings
                const upcoming = bookingsArray
                    .filter(b => new Date(b.scheduled_start) >= now)
                    .sort((a, b) => new Date(a.scheduled_start) - new Date(b.scheduled_start));

                const past = bookingsArray
                    .filter(b => new Date(b.scheduled_start) < now)
                    .sort((a, b) => new Date(b.scheduled_start) - new Date(a.scheduled_start));

                // Combine upcoming first, then past
                const sorted = [...upcoming, ...past];

                setBookings(sorted);
            }
        } catch (err) {
            console.error("Error fetching bookings:", err);
            setBookings([]);
        } finally {
            if (isRefresh) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!auth) return;
        if (auth.loading) return;

        if (auth.error || !auth.isAuthenticated || !auth.user) {
            router.replace("/auth/login");
            return;
        }

        const user = auth.user
        setUser(user)

        console.log("USER: ", user)

        fetchBookings();

        // Auto-refresh every 10 minutes
        const interval = setInterval(() => fetchBookings(true), 600000);
        return () => clearInterval(interval);
    }, [auth, router]);

    const filteredBookings = (bookings || []).filter((booking) => {
        const matchesSearch =
            booking.learner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.temp_learner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.temp_learner_surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.vehicle_class?.replace("_", " ")?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.temp_learner_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.temp_learner_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.pickup_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.learner_phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.learner_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.dropoff_location?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
        const matchesTransmission = transmissionFilter === "all" || booking.vehicle_transmission === transmissionFilter;
        const matchesVehicleClass = vehicleClassFilter === "all" || booking.vehicle_class === vehicleClassFilter;
        const matchesPickup = pickupFilter === "all" ||
            (pickupFilter === "pickup_required" && booking.is_pickup_required) ||
            (pickupFilter === "no_pickup" && !booking.is_pickup_required);

        // Time filtering
        const now = new Date();
        const bookingDate = new Date(booking.scheduled_start);

        let matchesTime = true;
        if (timeFilter === "upcoming") {
            matchesTime = bookingDate >= now;
        } else if (timeFilter === "past") {
            matchesTime = bookingDate < now;
        } else if (timeFilter === "today") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            matchesTime = bookingDate >= today && bookingDate < tomorrow;
        } else if (timeFilter === "this_week") {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);
            matchesTime = bookingDate >= startOfWeek && bookingDate < endOfWeek;
        }

        return matchesSearch && matchesStatus && matchesTime && matchesTransmission &&
            matchesVehicleClass && matchesPickup;
    });

    const getStatusBadge = (status) => {
        const variants = {
            confirmed: "default",
            completed: "secondary",
            pending: "outline",
            cancelled: "destructive",
        };
        return variants[status] || "outline";
    };

    const getRelativeDate = (iso) => {
        if (!iso) return "-";
        try {
            const date = new Date(iso);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            // Reset times to compare dates only
            const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
            const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

            if (dateOnly.getTime() === todayOnly.getTime()) {
                return "Today";
            } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
                return "Tomorrow";
            } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
                return "Yesterday";
            } else {
                return date.toLocaleDateString("en-ZA", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                });
            }
        } catch (error) {
            return "-";
        }
    };

    const formatTime = (iso) => {
        if (!iso) return "-";
        try {
            const date = new Date(iso);
            return date.toLocaleTimeString("en-ZA", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            });
        } catch (error) {
            return "-";
        }
    };

    const isPast = (dateString) => {
        return new Date(dateString) < new Date();
    };

    const handleRefresh = () => {
        fetchBookings(true);
    };

    const clearAllFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setTimeFilter("all");
        setTransmissionFilter("all");
        setVehicleClassFilter("all");
        setPickupFilter("all");
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (searchTerm) count++;
        if (statusFilter !== "all") count++;
        if (timeFilter !== "all") count++;
        if (transmissionFilter !== "all") count++;
        if (vehicleClassFilter !== "all") count++;
        if (pickupFilter !== "all") count++;
        return count;
    };

    return (
        <div className="flex flex-1 flex-col relative">
            {/* Header section - not sticky */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 p-4 pb-0">
                <div>
                    <h2 className="text-2xl font-bold">All Bookings</h2>
                    <p className="text-muted-foreground">Manage all driving lesson bookings</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Button onClick={() => onNavigate && onNavigate('create-booking')}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Booking
                    </Button>
                </div>
            </div>

            {/* Sticky filter section */}
            <div className={`sticky z-40 border-b transition-all duration-300 ease-in-out ${isScrolled ? 'top-19 bg-transparent' : 'top-0'
                }`}>
                <div className={`transition-all duration-300 ease-in-out ${isScrolled ? 'px-4 py-2' : 'p-4'
                    }`}>
                    <Card className={`transition-all duration-300 ease-in-out ${isScrolled ? 'shadow-md border-2 py-0 ' : 'shadow-sm py-2'
                        }`}>
                        <CardHeader className={`transition-all duration-300 ease-in-out ${isScrolled ? 'p-1 ' : 'p-6'
                            }`}>
                            <div className={`flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 ${isScrolled && "px-2"}`}>
                                <div className={`flex items-center flex-wrap transition-all duration-300 ${isScrolled ? 'gap-1' : 'gap-2'
                                    }`}>
                                    <div className="relative">
                                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder={isScrolled ? "Search..." : "Search bookings..."}
                                            className={`pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm transition-all duration-300 ${isScrolled ? 'w-32' : 'w-48'
                                                }`}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <select
                                        className={`px-2 py-2 border border-input rounded-md bg-background text-sm transition-all duration-300 ${isScrolled ? 'min-w-[80px]' : 'min-w-[120px]'
                                            }`}
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">{isScrolled ? 'Status' : 'All Status'}</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="completed">Completed</option>
                                        <option value="pending">Pending</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>

                                    <select
                                        className={`px-2 py-2 border border-input rounded-md bg-background text-sm transition-all duration-300 ${isScrolled ? 'min-w-[70px]' : 'min-w-[110px]'
                                            }`}
                                        value={timeFilter}
                                        onChange={(e) => setTimeFilter(e.target.value)}
                                    >
                                        <option value="all">{isScrolled ? 'Time' : 'All Time'}</option>
                                        <option value="upcoming">Upcoming</option>
                                        <option value="past">Past</option>
                                        <option value="today">Today</option>
                                        <option value="this_week">This Week</option>
                                    </select>

                                    <select
                                        className={`px-2 py-2 border border-input rounded-md bg-background text-sm transition-all duration-300 ${isScrolled ? 'min-w-[80px]' : 'min-w-[140px]'
                                            }`}
                                        value={transmissionFilter}
                                        onChange={(e) => setTransmissionFilter(e.target.value)}
                                    >
                                        <option value="all">{isScrolled ? 'Trans' : 'All Transmissions'}</option>
                                        <option value="manual">Manual</option>
                                        <option value="automatic">Automatic</option>
                                    </select>

                                    <select
                                        className={`px-2 py-2 border border-input rounded-md bg-background text-sm transition-all duration-300 ${isScrolled ? 'min-w-[70px]' : 'min-w-[140px]'
                                            }`}
                                        value={vehicleClassFilter}
                                        onChange={(e) => setVehicleClassFilter(e.target.value)}
                                    >
                                        <option value="all">{isScrolled ? 'Class' : 'All Classes'}</option>
                                        <option value="code_8">Code 8</option>
                                        <option value="code_10">Code 10</option>
                                        <option value="code_14">Code 14</option>
                                    </select>

                                    <select
                                        className={`px-2 py-2 border border-input rounded-md bg-background text-sm transition-all duration-300 ${isScrolled ? 'min-w-[70px]' : 'min-w-[120px]'
                                            }`}
                                        value={pickupFilter}
                                        onChange={(e) => setPickupFilter(e.target.value)}
                                    >
                                        <option value="all">{isScrolled ? 'Pickup' : 'All Pickup'}</option>
                                        <option value="pickup_required">Pickup Required</option>
                                        <option value="no_pickup">No Pickup</option>
                                    </select>

                                    {getActiveFilterCount() > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={clearAllFilters}
                                            className={`flex items-center transition-all duration-300 ${isScrolled ? 'px-2 py-1 gap-1' : 'px-3 py-2 gap-2'
                                                }`}
                                        >
                                            <X className="h-3 w-3" />
                                            <span className={isScrolled ? 'text-xs' : 'text-sm'}>
                                                {isScrolled ? `${getActiveFilterCount()}` : `Clear (${getActiveFilterCount()})`}
                                            </span>
                                        </Button>
                                    )}
                                </div>

                                {!isScrolled ? (
                                    <p className="text-sm text-muted-foreground whitespace-nowrap">
                                        Showing {filteredBookings.length} of {bookings.length} bookings
                                    </p>
                                ) : (
                                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                                        Showing {filteredBookings.length} of {bookings.length} bookings
                                    </p>
                                )}
                            </div>
                        </CardHeader>
                    </Card>
                </div>
            </div>

            {/* Table section */}
            <div className="flex-1 p-4 pt-2">
                <Card>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2 min-w-[75vw] p-6">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : (
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
                                        {filteredBookings.length > 0 ? (
                                            filteredBookings.map((booking) => (
                                                <tr
                                                    key={booking.id}
                                                    className={`border-b hover:bg-muted/50 transition-colors ${isPast(booking.scheduled_start) ? 'bg-gray-50 text-gray-600' : ''
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
                                                            <div className="font-medium">{getRelativeDate(booking.scheduled_start)}</div>
                                                            <div className="text-muted-foreground">
                                                                {formatTime(booking.scheduled_start)}
                                                                {booking.scheduled_end && (
                                                                    <span> - {formatTime(booking.scheduled_end)}</span>
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
                                                                {new Date(booking.created_at).toLocaleDateString("en-ZA", {
                                                                    day: "2-digit",
                                                                    month: "2-digit",
                                                                    year: "2-digit"
                                                                })}
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
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={10}
                                                    className="text-center p-12 text-muted-foreground"
                                                >
                                                    {getActiveFilterCount() > 0
                                                        ? 'No bookings match your search criteria'
                                                        : 'No bookings found. Create your first booking to get started.'
                                                    }
                                                    {getActiveFilterCount() === 0 && (
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
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Scroll to top button */}
            {showScrollTop && (
                <Button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200"
                    size="sm"
                >
                    <ArrowUp className="h-5 w-5" />
                </Button>
            )}
        </div>
    );
}