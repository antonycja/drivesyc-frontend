import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export default function BookingsFilters({
    isScrolled,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    timeFilter,
    setTimeFilter,
    transmissionFilter,
    setTransmissionFilter,
    vehicleClassFilter,
    setVehicleClassFilter,
    pickupFilter,
    setPickupFilter,
    activeFilterCount,
    onClearFilters,
    filteredCount,
    totalCount
}) {
    return (
        <div className={`sticky z-40 border-b transition-all duration-300 ease-in-out ${isScrolled ? 'top-19 bg-transparent' : 'top-0'
            }`}>
            <div className={`transition-all duration-300 ease-in-out ${isScrolled ? 'px-4 py-2' : 'p-4'
                }`}>
                <Card className={`transition-all duration-300 ease-in-out ${isScrolled ? 'shadow-md border-2 py-0 ' : 'shadow-sm py-2'
                    }`}>
                    <CardHeader className={`transition-all duration-300 ease-in-out ${isScrolled ? 'p-1 ' : 'p-6'
                        }`}>
                        <div className={`flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 ${isScrolled && "px-2"
                            }`}>
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

                                {activeFilterCount > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onClearFilters}
                                        className={`flex items-center transition-all duration-300 ${isScrolled ? 'px-2 py-1 gap-1' : 'px-3 py-2 gap-2'
                                            }`}
                                    >
                                        <X className="h-3 w-3" />
                                        <span className={isScrolled ? 'text-xs' : 'text-sm'}>
                                            {isScrolled ? `${activeFilterCount}` : `Clear (${activeFilterCount})`}
                                        </span>
                                    </Button>
                                )}
                            </div>

                            {!isScrolled ? (
                                <p className="text-sm text-muted-foreground whitespace-nowrap">
                                    Showing {filteredCount} of {totalCount} bookings
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground whitespace-nowrap">
                                    Showing {filteredCount} of {totalCount} bookings
                                </p>
                            )}
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}