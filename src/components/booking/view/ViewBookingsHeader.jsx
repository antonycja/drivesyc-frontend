import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function BookingsHeader({ refreshing, onRefresh, onNavigate }) {
    return (
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 p-4 pb-0">
            <div>
                <h2 className="text-2xl font-bold">All Bookings</h2>
                <p className="text-muted-foreground">Manage all driving lesson bookings</p>
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    onClick={onRefresh}
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
    );
}