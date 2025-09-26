"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/components/auth/utils/authProvider';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ArrowUp } from "lucide-react";
import BookingsHeader from '@/components/booking/view/ViewBookingsHeader';
import BookingsFilters from '@/components/booking/view/BookingsFilters';
import BookingsTable from '@/components/booking/view/BookingsTable';
import { useBookingsData } from '@/hooks/useBookingsData';
import { useScrollHandling } from '@/hooks/useScrollHandling';

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

    const handleRefresh = () => {
        fetchBookings(true);
    };

    return (
        <div className="flex flex-1 flex-col relative">
            <BookingsHeader
                refreshing={refreshing}
                onRefresh={handleRefresh}
                onNavigate={onNavigate}
            />

            <BookingsFilters
                isScrolled={isScrolled}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                timeFilter={timeFilter}
                setTimeFilter={setTimeFilter}
                transmissionFilter={transmissionFilter}
                setTransmissionFilter={setTransmissionFilter}
                vehicleClassFilter={vehicleClassFilter}
                setVehicleClassFilter={setVehicleClassFilter}
                pickupFilter={pickupFilter}
                setPickupFilter={setPickupFilter}
                activeFilterCount={getActiveFilterCount()}
                onClearFilters={clearAllFilters}
                filteredCount={filteredBookings.length}
                totalCount={bookings.length}
            />

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
                            <BookingsTable
                                bookings={filteredBookings}
                                activeFilterCount={getActiveFilterCount()}
                                onNavigate={onNavigate}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

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