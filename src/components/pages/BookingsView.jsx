"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/components/auth/utils/authProvider';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import BookingsHeader from '@/components/booking/view/ViewBookingsHeader';
import BookingsFilters from '@/components/booking/view/BookingsFilters';
import BookingsTable from '@/components/booking/view/BookingsTable';
import BookingDetailPanel from '@/components/booking/BookingDetailPanel';
import PaymentPanel from '@/components/booking/PaymentPanel';
import { useBookingsData } from '@/hooks/useBookingsData';
import { useScrollHandling } from '@/hooks/useScrollHandling';
import { sortBookings } from '@/components/booking/utils/bookingUtils';
import ApiProxy from '@/app/api/lib/proxy';

const PAGE_SIZE = 15;

export default function BookingsView({
    onNavigate,
    formatNumber,
    formatCurrency
}) {
    const router = useRouter();
    const auth = useAuth();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [timeFilter, setTimeFilter] = useState("all");
    const [transmissionFilter, setTransmissionFilter] = useState("all");
    const [vehicleClassFilter, setVehicleClassFilter] = useState("all");
    const [pickupFilter, setPickupFilter] = useState("all");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [paymentBooking, setPaymentBooking] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [actionError, setActionError] = useState(null);

    const { showScrollTop, isScrolled, scrollToTop } = useScrollHandling();

    const {
        bookings,
        loading,
        refreshing,
        fetchBookings,
        filteredBookings
    } = useBookingsData({
        auth,
        router,
        searchTerm,
        statusFilter,
        timeFilter,
        transmissionFilter,
        vehicleClassFilter,
        pickupFilter
    });

    // Apply smart ordering after filtering
    const sortedBookings = useMemo(() => sortBookings(filteredBookings), [filteredBookings]);

    // Derive pagination values from the sorted+filtered list
    const totalCount = bookings.length;
    const filteredCount = sortedBookings.length;
    const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
    // Clamp current page so it never exceeds available pages after a filter change
    const safePage = Math.min(currentPage, totalPages);
    const pageStart = (safePage - 1) * PAGE_SIZE; // 0-based index
    const pageEnd = pageStart + PAGE_SIZE;
    const pagedBookings = sortedBookings.slice(pageStart, pageEnd);

    /** Reset to page 1 whenever a filter setter is called. */
    const makeFilterSetter = (setter) => (value) => {
        setter(value);
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setTimeFilter("all");
        setTransmissionFilter("all");
        setVehicleClassFilter("all");
        setPickupFilter("all");
        setCurrentPage(1);
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

    const handleRefresh = () => {
        fetchBookings(true);
    };

    /**
     * Called by BookingDetailPanel after a successful PATCH.
     * Re-fetches to keep local date transforms consistent.
     */
    const handleBookingUpdate = useCallback((updatedBooking) => {
        fetchBookings(true);
        setSelectedBooking((prev) =>
            prev?.id === updatedBooking.id ? { ...prev, ...updatedBooking } : prev
        );
    }, [fetchBookings]);


    /** Opens the payment panel; closes the detail panel if it's open for the same booking. */
    const handleOpenPayment = useCallback((booking) => {
        setSelectedBooking(null);
        setPaymentBooking(booking);
    }, []);

    const handleCancelBooking = useCallback(async (booking) => {
        setActionError(null);
        try {
            const { data, status } = await ApiProxy.patch(`/api/bookings/${booking.id}/cancel`, {});
            if (status === 200) {
                fetchBookings(true);
            } else {
                setActionError(data?.message || data?.detail || 'Failed to cancel booking.');
                setTimeout(() => setActionError(null), 4000);
            }
        } catch (err) {
            setActionError('Unable to reach the service.');
            setTimeout(() => setActionError(null), 4000);
        }
    }, [fetchBookings]);

    const handleCompleteBooking = useCallback(async (booking) => {
        setActionError(null);
        try {
            const { data, status } = await ApiProxy.patch(`/api/bookings/${booking.id}/complete`, {});
            if (status === 200) {
                fetchBookings(true);
            } else {
                setActionError(data?.message || data?.detail || 'Failed to complete booking.');
                setTimeout(() => setActionError(null), 4000);
            }
        } catch (err) {
            setActionError('Unable to reach the service.');
            setTimeout(() => setActionError(null), 4000);
        }
    }, [fetchBookings]);

    /**
     * Re-fetch a specific booking by ID and update paymentBooking so the
     * payment panel reflects up-to-date totals after recording a payment.
     */
    const handlePaymentRecorded = useCallback(async () => {
        fetchBookings(true);
        setPaymentBooking((current) => {
            if (!current?.id) return current;
            // Async re-fetch; update paymentBooking when it arrives
            ApiProxy.get(`/api/bookings/${current.id}`).then(({ data, status }) => {
                if (status === 200) setPaymentBooking(data);
            });
            return current; // keep showing stale until fetch completes
        });
    }, [fetchBookings]);

    return (
        <div className="flex flex-1 flex-col relative max-w-[1600px] mx-auto w-full">
            {actionError && (
                <div className="mx-4 mt-3 px-4 py-2.5 rounded-md bg-red-50 border border-red-200 text-sm text-red-700 flex items-center justify-between gap-3">
                    <span>{actionError}</span>
                    <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-600 shrink-0 text-lg leading-none">×</button>
                </div>
            )}
            <BookingsHeader
                refreshing={refreshing}
                onRefresh={handleRefresh}
                onNavigate={onNavigate}
            />

            {/* Filters are always rendered — even while loading — to prevent height shift */}
            <BookingsFilters
                isScrolled={isScrolled}
                searchTerm={searchTerm}
                setSearchTerm={makeFilterSetter(setSearchTerm)}
                statusFilter={statusFilter}
                setStatusFilter={makeFilterSetter(setStatusFilter)}
                timeFilter={timeFilter}
                setTimeFilter={makeFilterSetter(setTimeFilter)}
                transmissionFilter={transmissionFilter}
                setTransmissionFilter={makeFilterSetter(setTransmissionFilter)}
                vehicleClassFilter={vehicleClassFilter}
                setVehicleClassFilter={makeFilterSetter(setVehicleClassFilter)}
                pickupFilter={pickupFilter}
                setPickupFilter={makeFilterSetter(setPickupFilter)}
                activeFilterCount={getActiveFilterCount()}
                onClearFilters={clearAllFilters}
                filteredCount={filteredCount}
                totalCount={totalCount}
                currentPage={safePage}
                totalPages={totalPages}
                pageStart={pageStart}
                pageEnd={Math.min(pageEnd, filteredCount)}
                onPageChange={setCurrentPage}
            />

            {/* Table container always occupies space to prevent layout shift */}
            <div className="flex-1 p-4 pt-2 overflow-x-auto">
                <Card className="min-w-[900px]">
                    <CardContent className="p-0 min-h-[560px]">
                        <BookingsTable
                            bookings={pagedBookings}
                            loading={loading}
                            activeFilterCount={getActiveFilterCount()}
                            onNavigate={onNavigate}
                            onSelectBooking={setSelectedBooking}
                            onPayment={handleOpenPayment}
                            onCancel={handleCancelBooking}
                            onComplete={handleCompleteBooking}
                        />
                    </CardContent>
                </Card>
            </div>

            {showScrollTop && (
                <Button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-30 rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200"
                    size="sm"
                >
                    <ArrowUp className="h-5 w-5" />
                </Button>
            )}

            {/* Booking detail panel — renders above everything */}
            {selectedBooking && (
                <BookingDetailPanel
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onUpdate={handleBookingUpdate}
                    onNavigate={onNavigate}
                    onOpenPayment={handleOpenPayment}
                />
            )}

            {/* Payment panel */}
            {paymentBooking && (
                <PaymentPanel
                    booking={paymentBooking}
                    onClose={() => setPaymentBooking(null)}
                    onPaymentRecorded={handlePaymentRecorded}
                />
            )}
        </div>
    );
}
