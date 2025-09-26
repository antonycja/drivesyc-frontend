import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car } from "lucide-react";

export default function VehicleDetails({
    formData,
    onInputChange
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Car className="h-5 w-5" />
                    <span>Vehicle Preferences</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            License Class
                        </label>
                        <Select value={formData.vehicle_class} onValueChange={(value) => onInputChange('vehicle_class', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="code_8">Code 8 (Light Motor Vehicle)</SelectItem>
                                <SelectItem value="code_10">Code 10 (Heavy Motor Vehicle)</SelectItem>
                                <SelectItem value="code_14">Code 14 (Heavy Motor Vehicle + Trailer)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                            Select the appropriate license code
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Transmission Type
                        </label>
                        <Select value={formData.vehicle_transmission} onValueChange={(value) => onInputChange('vehicle_transmission', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="manual">Manual Transmission</SelectItem>
                                <SelectItem value="automatic">Automatic Transmission</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                            Choose transmission preference
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}