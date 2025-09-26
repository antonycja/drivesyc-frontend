import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Clock12, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function LessonDetails({
    formData,
    onInputChange,
    instructors,
    errors,
    onScheduleChange, // Add this new prop
    loadingInstructors // Add this new prop
}) {
    const [use12Hour, setUse12Hour] = useState(false);
    const [displayValue, setDisplayValue] = useState("");
    const [timeError, setTimeError] = useState("");

    // Trigger schedule change callback when scheduling details change
    useEffect(() => {
        if (formData.scheduled_date && formData.scheduled_time && formData.duration_amount && formData.duration_unit && onScheduleChange) {
            // Calculate end time
            const durationMinutes = formData.duration_unit === 'hours'
                ? Math.round(parseFloat(formData.duration_amount) * 60)
                : parseInt(formData.duration_amount);

            const startDateTime = `${formData.scheduled_date}T${formData.scheduled_time}`;

            onScheduleChange({
                date: formData.scheduled_date,
                startTime: formData.scheduled_time,
                durationMinutes,
                startDateTime
            });
        }
    }, [formData.scheduled_date, formData.scheduled_time, formData.duration_amount, formData.duration_unit, onScheduleChange]);

    // Keep display in sync when switching modes
    useEffect(() => {
        if (use12Hour) {
            setDisplayValue(formatTo12Hour(formData.scheduled_time));
        } else {
            setDisplayValue(formData.scheduled_time || "");
        }
    }, [use12Hour, formData.scheduled_time]);

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

        // More flexible regex to handle various formats
        const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!match) return null;

        let [_, h, m, ampm] = match;
        let hours = parseInt(h, 10);
        let minutes = parseInt(m, 10);

        // Validation
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

    const handleTimeChange = (value) => {
        setDisplayValue(value);
        setTimeError("");

        if (use12Hour) {
            const validation = validateTime(value, true);
            if (validation) {
                setTimeError(validation);
                return;
            }

            const converted = formatTo24Hour(value);
            if (converted) {
                onInputChange("scheduled_time", converted);
            } else {
                setTimeError("Invalid time format");
            }
        } else {
            const validation = validateTime(value, false);
            if (validation) {
                setTimeError(validation);
                return;
            }

            onInputChange("scheduled_time", value);
        }
    };

    const handleModeToggle = () => {
        const newMode = !use12Hour;
        setUse12Hour(newMode);
        setTimeError("");

        // Convert current value to new format if there's a valid time
        if (formData.scheduled_time) {
            if (newMode) {
                setDisplayValue(formatTo12Hour(formData.scheduled_time));
            } else {
                setDisplayValue(formData.scheduled_time);
            }
        } else {
            setDisplayValue("");
        }
    };

    const getTimeInputPlaceholder = () => {
        return use12Hour ? "02:00 PM" : "14:00";
    };

    const getQuickDateOptions = () => {
        const today = new Date();
        const options = [];

        // Helper function to format date as YYYY-MM-DD
        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };

        // Helper function to get day name and formatted date
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

        // Next 5 days (including weekends)
        let currentDate = new Date(tomorrow);
        currentDate.setDate(currentDate.getDate() + 1); // Start from day after tomorrow

        for (let i = 0; i < 5; i++) {
            options.push({
                label: getDateLabel(currentDate),
                value: formatDate(currentDate),
                disabled: false
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // This weekend (Saturday and Sunday if not already included)
        const nextSaturday = new Date(today);
        const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
        if (daysUntilSaturday > 0) { // Only if Saturday hasn't passed this week
            nextSaturday.setDate(today.getDate() + daysUntilSaturday);

            // Only add if it's not already in our next 5 days
            const saturdayFormatted = formatDate(nextSaturday);
            if (!options.some(opt => opt.value === saturdayFormatted)) {
                options.push({
                    label: "This Sat",
                    value: saturdayFormatted,
                    disabled: false
                });
            }

            // Add Sunday too
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

        return options.slice(0, 8); // Limit to 8 options to avoid UI clutter
    };

    const handleQuickDate = (date) => {
        onInputChange('scheduled_date', date);
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
            onInputChange("scheduled_time", time);
        } else {
            setDisplayValue(time);
            onInputChange("scheduled_time", time);
        }
        setTimeError("");
    };

    // Reset instructor_id if no instructors are available
    useEffect(() => {
        if (instructors.length === 0 && formData.instructor_id) {
            onInputChange('instructor_id', '');
        }
    }, [instructors.length]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Lesson Details</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Date and Time Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block h-[2rem] content-center text-sm font-medium mb-2">
                            Lesson Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="date"
                                value={formData.scheduled_date}
                                onChange={(e) => onInputChange('scheduled_date', e.target.value)}
                                className={`w-full pl-10 pr-3 py-2 border rounded-md bg-background ${errors.scheduled_date ? 'border-destructive' : 'border-input'
                                    }`}
                                min={new Date().toISOString().split('T')[0]}
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

                        {errors.scheduled_date && (
                            <p className="text-sm text-destructive mt-1 flex items-center space-x-1">
                                <AlertCircle className="h-4 w-4" />
                                <span>{errors.scheduled_date}</span>
                            </p>
                        )}
                    </div>

                    {/* Enhanced Time Input */}
                    <div>
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
                                className={`w-full pl-10 pr-3 py-2 border rounded-md bg-background ${(errors.scheduled_time || timeError) ? "border-destructive" : "border-input"
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

                        {(errors.scheduled_time || timeError) && (
                            <p className="text-sm text-destructive mt-1 flex items-center space-x-1">
                                <AlertCircle className="h-4 w-4" />
                                <span>{timeError || errors.scheduled_time}</span>
                            </p>
                        )}

                        <p className="text-xs text-muted-foreground mt-1">
                            {use12Hour
                                ? "Use 12-hour format with AM/PM (e.g., 02:00 PM)"
                                : "Use 24-hour format (e.g., 14:00)"
                            }
                        </p>
                    </div>
                </div>

                {/* Duration and Instructor Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Duration <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-2">
                            <input
                                type="number"
                                value={formData.duration_amount}
                                onChange={(e) => onInputChange('duration_amount', e.target.value)}
                                className={`flex-1 px-3 py-2 border rounded-md bg-background ${errors.duration_amount ? 'border-destructive' : 'border-input'
                                    }`}
                                min="1"
                                step="1"
                                placeholder="1"
                            />
                            <Select
                                value={formData.duration_unit}
                                onValueChange={(value) => onInputChange('duration_unit', value)}
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
                        {errors.duration_amount && (
                            <p className="text-sm text-destructive mt-1 flex items-center space-x-1">
                                <AlertCircle className="h-4 w-4" />
                                <span>{errors.duration_amount}</span>
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            Minimum 60 minutes (1 hour)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Instructor <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={instructors.length === 0 ? "no-instructors" : formData.instructor_id?.toString() || ''}
                            onValueChange={(value) => onInputChange('instructor_id', value !== "no-instructors" ? value : '')}
                            disabled={loadingInstructors}
                        >
                            <SelectTrigger
                                className={`
                                    ${errors.instructor_id ? 'border-destructive' : ''} 
                                    ${loadingInstructors ? 'opacity-50' : ''}
                                    ${instructors.length === 0 ? 'text-muted-foreground' : ''}
                                `}
                            >
                                <SelectValue
                                    placeholder={
                                        loadingInstructors
                                            ? "Loading available instructors..."
                                            : instructors.length === 0
                                                ? "No instructors available for this time"
                                                : "Select instructor"
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {instructors.map((instructor) => (
                                    <SelectItem key={instructor.id} value={instructor.id.toString()}>
                                        {instructor.name}
                                        {instructor.is_available === false && (
                                            <span className="text-xs text-muted-foreground ml-2">(Unavailable)</span>
                                        )}
                                    </SelectItem>
                                ))}
                                {instructors.length === 0 && !loadingInstructors && (
                                    <SelectItem value="no-instructors" disabled className="text-muted-foreground">
                                        No instructors available for this time slot
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {loadingInstructors && (
                            <div className="flex items-center space-x-2 mt-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-xs text-muted-foreground">
                                    Checking instructor availability...
                                </span>
                            </div>
                        )}
                        {errors.instructor_id && (
                            <p className="text-sm text-destructive mt-1 flex items-center space-x-1">
                                <AlertCircle className="h-4 w-4" />
                                <span>{errors.instructor_id}</span>
                            </p>
                        )}
                        {!loadingInstructors && instructors.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Showing {instructors.length} available instructor{instructors.length !== 1 ? 's' : ''} for selected time
                            </p>
                        )}
                    </div>
                </div>

                {/* Lesson Type */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Lesson Type <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.lesson_type}
                        onChange={(e) => onInputChange('lesson_type', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md bg-background ${errors.lesson_type ? 'border-destructive' : 'border-input'
                            }`}
                        placeholder="e.g., Regular lesson, Highway practice, Parking, Test preparation"
                    />
                    {errors.lesson_type && (
                        <p className="text-sm text-destructive mt-1 flex items-center space-x-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>{errors.lesson_type}</span>
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                        Describe the type or focus of this lesson
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}