import { Button } from "@/components/ui/button";
import { Clock, Clock12, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export function TimeInput({ value, onChange, error, className = "" }) {
    const [use12Hour, setUse12Hour] = useState(false);
    const [displayValue, setDisplayValue] = useState("");
    const [timeError, setTimeError] = useState("");

    // Keep display in sync when switching modes
    useEffect(() => {
        if (use12Hour) {
            setDisplayValue(formatTo12Hour(value));
        } else {
            setDisplayValue(value || "");
        }
    }, [use12Hour, value]);

    const formatTo12Hour = (time24) => {
        if (!time24 || !time24.includes(':')) return "";

        const [hours, minutes] = time24.split(":");
        let h = parseInt(hours, 10);

        if (isNaN(h) || h < 0 || h > 23) return "";

        const suffix = h >= 12 ? "PM" : "AM";
        let displayH = h % 12 || 12;

        return `${displayH.toString().padStart(2, "0")}:${minutes} ${suffix}`;
    };

    const formatTo24Hour = (time12) => {
        if (!time12) return "";

        const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!match) return null;

        let [_, h, m, ampm] = match;
        let hours = parseInt(h, 10);
        let minutes = parseInt(m, 10);

        if (isNaN(hours) || isNaN(minutes) || hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
            return null;
        }

        if (ampm.toUpperCase() === "PM" && hours !== 12) hours += 12;
        if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;

        return `${hours.toString().padStart(2, "0")}:${m}`;
    };

    const validateTime = (value, is12Hour = false) => {
        if (!value) return "Time is required";

        if (is12Hour) {
            const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
            if (!timeRegex.test(value)) {
                return "Please use format: HH:MM AM/PM (e.g., 02:00 PM)";
            }

            const match = value.match(timeRegex);
            const hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);

            if (hours < 1 || hours > 12) {
                return "Hours must be between 1 and 12 for 12-hour format";
            }

            if (minutes < 0 || minutes > 59) {
                return "Minutes must be between 00 and 59";
            }
        } else {
            const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
            if (!timeRegex.test(value)) {
                return "Please use format: HH:MM (e.g., 14:00)";
            }
        }

        return "";
    };

    const handleTimeChange = (inputValue) => {
        setDisplayValue(inputValue);
        setTimeError("");

        if (use12Hour) {
            const validation = validateTime(inputValue, true);
            if (validation) {
                setTimeError(validation);
                return;
            }

            const converted = formatTo24Hour(inputValue);
            if (converted) {
                onChange(converted);
            } else {
                setTimeError("Invalid time format");
            }
        } else {
            const validation = validateTime(inputValue, false);
            if (validation) {
                setTimeError(validation);
                return;
            }

            onChange(inputValue);
        }
    };

    const handleModeToggle = () => {
        const newMode = !use12Hour;
        setUse12Hour(newMode);
        setTimeError("");

        if (value) {
            if (newMode) {
                setDisplayValue(formatTo12Hour(value));
            } else {
                setDisplayValue(value);
            }
        } else {
            setDisplayValue("");
        }
    };

    const getTimeInputPlaceholder = () => {
        return use12Hour ? "02:00 PM" : "14:00";
    };

    const getQuickTimeOptions = () => {
        const options = [
            "08:00", "09:00", "10:00", "11:00", "12:00",
            "13:00", "14:00", "15:00", "16:00", "17:00"
        ];

        return options.map(time => ({
            value: time,
            display: use12Hour ? formatTo12Hour(time) : time
        }));
    };

    const handleQuickTime = (time) => {
        if (use12Hour) {
            const display = formatTo12Hour(time);
            setDisplayValue(display);
            onChange(time);
        } else {
            setDisplayValue(time);
            onChange(time);
        }
        setTimeError("");
    };

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                    Start Time <span className="text-red-500">*</span>
                </label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleModeToggle}
                    className="h-8 px-3 text-xs"
                >
                    {use12Hour ? (
                        <>
                            <Clock className="h-3 w-3 mr-1" />
                            24H
                        </>
                    ) : (
                        <>
                            <Clock12 className="h-3 w-3 mr-1" />
                            12H
                        </>
                    )}
                </Button>
            </div>

            <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder={getTimeInputPlaceholder()}
                    value={displayValue}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md bg-background ${(error || timeError) ? "border-destructive" : "border-input"
                        }`}
                />
            </div>

            {/* Quick Time Buttons */}
            <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-1">
                    {getQuickTimeOptions().map((option) => (
                        <Button
                            key={option.value}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickTime(option.value)}
                            className="h-7 px-2 text-xs"
                        >
                            {option.display}
                        </Button>
                    ))}
                </div>
            </div>

            {(error || timeError) && (
                <p className="text-sm text-destructive mt-1 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{timeError || error}</span>
                </p>
            )}

            <p className="text-xs text-muted-foreground mt-1">
                {use12Hour
                    ? "Use 12-hour format with AM/PM (e.g., 02:00 PM)"
                    : "Use 24-hour format (e.g., 14:00)"
                }
            </p>
        </div>
    );
}