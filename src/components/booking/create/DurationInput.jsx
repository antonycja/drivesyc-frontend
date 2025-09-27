import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

export function DurationInput({
    durationAmount,
    durationUnit,
    onDurationAmountChange,
    onDurationUnitChange,
    error,
    className = ""
}) {
    return (
        <div className={className}>
            <label className="block text-sm font-medium mb-2">
                Duration <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
                <input
                    type="number"
                    value={durationAmount}
                    onChange={(e) => onDurationAmountChange(e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-md bg-background ${error ? 'border-destructive' : 'border-input'
                        }`}
                    min="1"
                    step="1"
                    placeholder="1"
                />
                <Select
                    value={durationUnit}
                    onValueChange={onDurationUnitChange}
                >
                    <SelectTrigger className="w-28">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="minutes">Minutes</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {error && (
                <p className="text-sm text-destructive mt-1 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
                Minimum 60 minutes (1 hour)
            </p>
        </div>
    );
}