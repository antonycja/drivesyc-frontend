import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function LocationDetails({
    formData,
    onInputChange,
    errors
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Location Details</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <input
                        type="checkbox"
                        id="is_pickup_required"
                        checked={formData.is_pickup_required}
                        onChange={(e) => onInputChange('is_pickup_required', e.target.checked)}
                        className="rounded border-input h-4 w-4"
                    />
                    <label htmlFor="is_pickup_required" className="text-sm font-medium cursor-pointer">
                        Pickup and drop-off service required
                    </label>
                </div>

                {formData.is_pickup_required && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Pickup Location *
                            </label>
                            <input
                                type="text"
                                value={formData.pickup_location}
                                onChange={(e) => onInputChange('pickup_location', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md bg-background ${errors.pickup_location ? 'border-destructive' : 'border-input'}`}
                                placeholder="Enter full pickup address"
                            />
                            {errors.pickup_location && (
                                <p className="text-sm text-destructive mt-1">{errors.pickup_location}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Drop-off Location *
                            </label>
                            <input
                                type="text"
                                value={formData.dropoff_location}
                                onChange={(e) => onInputChange('dropoff_location', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md bg-background ${errors.dropoff_location ? 'border-destructive' : 'border-input'}`}
                                placeholder="Enter full drop-off address"
                            />
                            {errors.dropoff_location && (
                                <p className="text-sm text-destructive mt-1">{errors.dropoff_location}</p>
                            )}
                        </div>
                    </div>
                )}

                {!formData.is_pickup_required && (
                    <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                        Student will meet instructor at the designated lesson location
                    </div>
                )}
            </CardContent>
        </Card>
    );
}