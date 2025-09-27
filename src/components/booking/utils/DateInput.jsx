import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle } from "lucide-react";

export function DateInput({ value, onChange, error, className = "" }) {
    const getTodayForMinDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getQuickDateOptions = () => {
        const today = new Date();
        const options = [];

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const getDateLabel = (date) => {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayName = dayNames[date.getDay()];
            const month = date.toLocaleDateString('en-US', { month: 'short' });
            const day = date.getDate();
            return `${dayName} ${month} ${day}`;
        };

        // Today
        options.push({
            label: "Today",
            value: formatDate(today),
            disabled: false
        });

        // Tomorrow
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        options.push({
            label: "Tomorrow",
            value: formatDate(tomorrow),
            disabled: false
        });

        // Next 5 days
        let currentDate = new Date(tomorrow);
        currentDate.setDate(currentDate.getDate() + 1);

        for (let i = 0; i < 5; i++) {
            options.push({
                label: getDateLabel(currentDate),
                value: formatDate(currentDate),
                disabled: false
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // This weekend
        const nextSaturday = new Date(today);
        const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
        if (daysUntilSaturday > 0) {
            nextSaturday.setDate(today.getDate() + daysUntilSaturday);

            const saturdayFormatted = formatDate(nextSaturday);
            if (!options.some(opt => opt.value === saturdayFormatted)) {
                options.push({
                    label: "This Sat",
                    value: saturdayFormatted,
                    disabled: false
                });
            }

            const nextSunday = new Date(nextSaturday);
            nextSunday.setDate(nextSaturday.getDate() + 1);
            const sundayFormatted = formatDate(nextSunday);
            if (!options.some(opt => opt.value === sundayFormatted)) {
                options.push({
                    label: "This Sun",
                    value: sundayFormatted,
                    disabled: false
                });
            }
        }

        return options.slice(0, 8);
    };

    const handleQuickDate = (date) => {
        onChange(date);
    };

    return (
        <div className={className}>
            <label className="block h-[2rem] content-center text-sm font-medium mb-2">
                Lesson Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md bg-background ${
                        error ? 'border-destructive' : 'border-input'
                    }`}
                    min={getTodayForMinDate()}
                />
            </div>

            {/* Quick Date Buttons */}
            <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-1">
                    {getQuickDateOptions().map((option) => (
                        <Button
                            key={option.value}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickDate(option.value)}
                            className="h-7 px-2 text-xs"
                            disabled={option.disabled}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>

            {error && (
                <p className="text-sm text-destructive mt-1 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </p>
            )}
        </div>
    );
}