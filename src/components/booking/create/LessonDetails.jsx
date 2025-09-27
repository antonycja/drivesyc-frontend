import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { DateInput } from "@/components/booking/utils/DateInput";
import { TimeInput } from "@/components/booking/utils/TimeInput";
import { DurationInput } from "@/components/booking/create/DurationInput";
import { InstructorSelect } from "@/components/booking/create/InstructorSelect";
import { LessonTypeInput } from "@/components/booking/create/LessonTypeInput";

export default function LessonDetails({
    formData,
    onInputChange,
    instructors,
    errors,
    onScheduleChange,
    loadingInstructors
}) {
    // Trigger schedule change callback when scheduling details change
    useEffect(() => {
        if (formData.scheduled_date && formData.scheduled_time && formData.duration_amount && formData.duration_unit && onScheduleChange) {
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
                    <DateInput
                        value={formData.scheduled_date}
                        onChange={(value) => onInputChange('scheduled_date', value)}
                        error={errors.scheduled_date}
                    />

                    <TimeInput
                        value={formData.scheduled_time}
                        onChange={(value) => onInputChange('scheduled_time', value)}
                        error={errors.scheduled_time}
                    />
                </div>

                {/* Duration and Instructor Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DurationInput
                        durationAmount={formData.duration_amount}
                        durationUnit={formData.duration_unit}
                        onDurationAmountChange={(value) => onInputChange('duration_amount', value)}
                        onDurationUnitChange={(value) => onInputChange('duration_unit', value)}
                        error={errors.duration_amount}
                    />

                    <InstructorSelect
                        instructors={instructors}
                        selectedInstructorId={formData.instructor_id}
                        onInstructorChange={(value) => onInputChange('instructor_id', value)}
                        loading={loadingInstructors}
                        error={errors.instructor_id}
                    />
                </div>

                {/* Lesson Type */}
                <LessonTypeInput
                    value={formData.lesson_type}
                    onChange={(value) => onInputChange('lesson_type', value)}
                    error={errors.lesson_type}
                />
            </CardContent>
        </Card>
    );
}