import { useState, useEffect, useMemo } from "react";
import ApiProxy from '@/app/api/lib/proxy'


export function useBookingsData({
    auth,
    router,
    searchTerm,
    statusFilter,
    timeFilter,
    transmissionFilter,
    vehicleClassFilter,
    pickupFilter
}) {
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Convert UTC datetime string to local Date object
    const convertUTCToLocal = (utcDateString) => {
        if (!utcDateString) return null;
        try {
            const utcString = utcDateString.endsWith('Z') ? utcDateString : utcDateString + 'Z';
            return new Date(utcString);
        } catch (error) {
            console.error('Error converting UTC to local:', error);
            return null;
        }
    };

    const fetchBookings = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const { data, status } = await ApiProxy.get("/api/bookings");

            if (status === 200) {
                const bookingsArray = Array.isArray(data) ? data : data?.bookings || [];

                const bookingsWithLocalDates = bookingsArray.map(booking => ({
                    ...booking,
                    scheduled_start_local: convertUTCToLocal(booking.scheduled_start),
                    scheduled_end_local: convertUTCToLocal(booking.scheduled_end),
                    created_at_local: convertUTCToLocal(booking.created_at)
                }));

                const now = new Date();
                const upcoming = bookingsWithLocalDates
                    .filter(b => b.scheduled_start_local && b.scheduled_start_local >= now)
                    .sort((a, b) => a.scheduled_start_local - b.scheduled_start_local);

                const past = bookingsWithLocalDates
                    .filter(b => b.scheduled_start_local && b.scheduled_start_local < now)
                    .sort((a, b) => b.scheduled_start_local - a.scheduled_start_local);

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
        if (!auth || auth.loading) return;
        if (auth.error || !auth.isAuthenticated || !auth.user) {
            router.replace("/auth/login");
            return;
        }

        fetchBookings();
        const interval = setInterval(() => fetchBookings(true), 600000);
        return () => clearInterval(interval);
    }, [auth, router]);

    const filteredBookings = useMemo(() => {
        return (bookings || []).filter((booking) => {
            const matchesSearch = [
                booking.learner_name,
                booking.temp_learner_name,
                booking.temp_learner_surname,
                booking.instructor_name,
                booking.vehicle_class?.replace("_", " "),
                booking.temp_learner_email,
                booking.temp_learner_phone,
                booking.pickup_location,
                booking.learner_phone_number,
                booking.learner_email,
                booking.dropoff_location
            ].some(field =>
                field?.toLowerCase().includes(searchTerm.toLowerCase())
            );

            const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
            const matchesTransmission = transmissionFilter === "all" || booking.vehicle_transmission === transmissionFilter;
            const matchesVehicleClass = vehicleClassFilter === "all" || booking.vehicle_class === vehicleClassFilter;
            const matchesPickup = pickupFilter === "all" ||
                (pickupFilter === "pickup_required" && booking.is_pickup_required) ||
                (pickupFilter === "no_pickup" && !booking.is_pickup_required);

            const now = new Date();
            const bookingDate = booking.scheduled_start_local;
            let matchesTime = true;

            if (timeFilter === "upcoming") {
                matchesTime = bookingDate && bookingDate >= now;
            } else if (timeFilter === "past") {
                matchesTime = bookingDate && bookingDate < now;
            } else if (timeFilter === "today") {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                matchesTime = bookingDate && bookingDate >= today && bookingDate < tomorrow;
            } else if (timeFilter === "this_week") {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 7);
                matchesTime = bookingDate && bookingDate >= startOfWeek && bookingDate < endOfWeek;
            }

            return matchesSearch && matchesStatus && matchesTime && matchesTransmission &&
                matchesVehicleClass && matchesPickup;
        });
    }, [bookings, searchTerm, statusFilter, timeFilter, transmissionFilter, vehicleClassFilter, pickupFilter]);

    return {
        bookings,
        loading,
        refreshing,
        fetchBookings,
        filteredBookings
    };
}
