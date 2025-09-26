import StudentSelection from "@/components/booking/create/StudentSelection";
import LessonDetails from "@/components/booking/create/LessonDetails";
import VehicleDetails from "@/components/booking/create/VehicleDetails";
import LocationDetails from "@/components/booking/create/LocationDetails";
import AdditionalNotes from "@/components/booking/create/AdditionalNotes";
import BookingFormActions from "@/components/booking/create/BookingFormActions";

export default function BookingForm({
    showStudentSelection,
    isUnregisteredLearner,
    formData,
    errors,
    instructors,
    loadingInstructors,
    existingUser,
    checkingUser,
    checkField,
    submitting,
    onInputChange,
    onLearnerTypeChange,
    onSelectExistingUser,
    onScheduleChange,
    clearExistingUser,
    onBack,
    onNavigate
}) {
    return (
        <>
            {/* Student Selection (Admin/Owner only) */}
            {showStudentSelection && (
                <StudentSelection
                    isUnregisteredLearner={isUnregisteredLearner}
                    onLearnerTypeChange={onLearnerTypeChange}
                    formData={formData}
                    onInputChange={onInputChange}
                    existingUser={existingUser}
                    checkingUser={checkingUser}
                    checkField={checkField}
                    onSelectExistingUser={onSelectExistingUser}
                    clearExistingUser={clearExistingUser}
                    errors={errors}
                />
            )}

            {/* Lesson Details */}
            <LessonDetails
                formData={formData}
                onInputChange={onInputChange}
                instructors={instructors}
                errors={errors}
                onScheduleChange={onScheduleChange}
                loadingInstructors={loadingInstructors}
            />

            {/* Vehicle Details */}
            <VehicleDetails
                formData={formData}
                onInputChange={onInputChange}
            />

            {/* Location Details */}
            <LocationDetails
                formData={formData}
                onInputChange={onInputChange}
                errors={errors}
            />

            {/* Additional Notes */}
            <AdditionalNotes
                formData={formData}
                onInputChange={onInputChange}
            />

            {/* Submit Actions */}
            <BookingFormActions
                submitting={submitting}
                onBack={onBack}
                onNavigate={onNavigate}
            />
        </>
    );
}