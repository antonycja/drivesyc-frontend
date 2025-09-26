export default function BookingHeader() {
    return (
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
                <h2 className="text-2xl font-bold">Create New Booking</h2>
                <p className="text-muted-foreground">Schedule a new driving lesson</p>
            </div>
        </div>
    );
}