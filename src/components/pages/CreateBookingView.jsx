// CreateBookingView.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/components/auth/utils/authProvider';

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Save, Loader2 } from "lucide-react";

// Custom Components
import StudentSelection from "@/components/booking/StudentSelection";
import LessonDetails from "@/components/booking/LessonDetails";
import VehicleDetails from "@/components/booking/VehicleDetails";
import LocationDetails from "@/components/booking/LocationDetails";
import AdditionalNotes from "@/components/booking/AdditionalNotes";

// Custom Hook
import { useDebounce } from "@/hooks/useDebounce";
import useCheckUserExists from "@/hooks/useCheckUserExists";

// Mock Data - Only instructors now
import { mockInstructors } from "@/data/mockData";

export default function CreateBookingView({ onNavigate, onBack }) {
    const router = useRouter();
    const auth = useAuth();

    // State
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [instructors, setInstructors] = useState([]);
    const [loadingInstructors, setLoadingInstructors] = useState(false);
    const [user, setUser] = useState(null);
    const [errors, setErrors] = useState({});

    // Form state
    const [formData, setFormData] = useState({
        scheduled_date: '',
        scheduled_time: '',
        duration_amount: 1,
        duration_unit: 'hours',
        pickup_location: '',
        dropoff_location: '',
        is_pickup_required: false,
        lesson_type: '',
        vehicle_transmission: 'manual',
        vehicle_class: 'code_8',
        notes: '',
        temp_learner_name: '',
        temp_learner_surname: '',
        temp_learner_phone: '',
        temp_learner_email: '',
        learner_id: null,
        instructor_id: null,
        status: 'pending'
    });

    const [isUnregisteredLearner, setIsUnregisteredLearner] = useState(false);

    // Debounced values for user checking
    const debouncedEmail = useDebounce(formData.temp_learner_email, 500);
    const debouncedPhone = useDebounce(formData.temp_learner_phone, 500);

    // Helper Functions - Use auth.user directly instead of the state
    const isAdminOrOwner = useCallback((userObj = null) => {
        const currentUser = userObj || auth?.user || user;
        return currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner' || currentUser.role === 'super_admin');
    }, [auth?.user, user]);

    // API Functions
    const fetchAvailableInstructors = async (scheduleData) => {
        try {
            setLoadingInstructors(true);
            console.log('Fetching available instructors for:', scheduleData);

            // Create datetime strings without timezone conversion
            // Use the local date/time as-is to avoid timezone shifts
            const startDateTimeString = `${scheduleData.date}T${scheduleData.startTime}:00`;
            const startDateTime = new Date(startDateTimeString);
            const endDateTime = new Date(startDateTime.getTime() + (scheduleData.durationMinutes * 60000));

            // Format as ISO string but keep local timezone
            const formatLocalDateTime = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');

                // Get timezone offset in minutes and convert to hours:minutes format
                const offsetMinutes = date.getTimezoneOffset();
                const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
                const offsetMins = Math.abs(offsetMinutes) % 60;
                const offsetSign = offsetMinutes <= 0 ? '+' : '-';
                const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;

                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetString}`;
            };

            const params = new URLSearchParams({
                start: formatLocalDateTime(startDateTime),
                end: formatLocalDateTime(endDateTime)
            });

            console.log('API call params:', {
                start: formatLocalDateTime(startDateTime),
                end: formatLocalDateTime(endDateTime),
                originalTime: scheduleData.startTime
            });

            const response = await fetch(`/api/users/instructors/available?${params}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error fetching available instructors:', errorText);
                return;
            }

            const data = await response.json();

            // API returns array directly, not wrapped in object
            const instructors = Array.isArray(data) ? data : [];
            console.log('Available instructors:', instructors);

            // Transform the API response to match expected format
            const formattedInstructors = instructors.map(instructor => ({
                id: instructor.id,
                name: `${instructor.first_name} ${instructor.last_name}`,
                first_name: instructor.first_name,
                last_name: instructor.last_name,
                email: instructor.email,
                role: instructor.role,
                is_active: instructor.is_active,
                profile_image_url: instructor.profile_image_url,
                is_available: true // All returned instructors are available
            }));

            setInstructors(formattedInstructors);

            // Clear instructor selection if current instructor is not available
            if (formData.instructor_id) {
                const isCurrentInstructorAvailable = formattedInstructors.some(
                    instructor => instructor.id.toString() === formData.instructor_id.toString()
                );

                if (!isCurrentInstructorAvailable) {
                    setFormData(prev => ({
                        ...prev,
                        instructor_id: null
                    }));
                }
            }

        } catch (err) {
            console.error("Error fetching available instructors:", err);
        } finally {
            setLoadingInstructors(false);
        }
    };

    const fetchInstructors = async () => {
        try {
            setLoading(true);
            // Initialize with mock data for development
            await new Promise(resolve => setTimeout(resolve, 300));

        } catch (err) {
            console.error("Error fetching instructors:", err);
        } finally {
            setLoading(false);
        }
    };

    // Handle schedule changes from LessonDetails
    const handleScheduleChange = useCallback((scheduleData) => {
        console.log('Schedule changed:', scheduleData);
        fetchAvailableInstructors(scheduleData);
    }, [formData.instructor_id]); // Include instructor_id in dependencies

    // Effects
    useEffect(() => {
        if (!auth) return;
        if (auth.loading) return;

        if (auth.error || !auth.isAuthenticated || !auth.user) {
            router.replace("/auth/login");
            return;
        }

        const currentUser = auth.user;
        console.log('Current user from auth:', currentUser);

        setUser(currentUser);

        // Use currentUser directly instead of waiting for state to update
        if (currentUser.role === 'learner' && !isAdminOrOwner(currentUser)) {
            setFormData(prev => ({
                ...prev,
                learner_id: currentUser.id
            }));
        }

        // Load initial instructors (all available)
        fetchInstructors();
    }, [auth, router, isAdminOrOwner]);

    // Add a separate useEffect to log user state changes
    useEffect(() => {
        console.log('User state updated:', user);
    }, [user]);

    // Email validation helper
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Phone validation helper  
    const isValidPhone = (phone) => {
        const cleanPhone = phone.replace(/[\s\+\-\(\)]/g, '');
        return cleanPhone.length >= 10;
    };

    const { existingUser, checkingUser, checkField, checkUserExists, clearExistingUser } = useCheckUserExists();

    // Simple useEffects - only trigger API calls, no clearing logic
    useEffect(() => {
        if (isUnregisteredLearner && debouncedEmail && isValidEmail(debouncedEmail)) {
            checkUserExists('email', debouncedEmail);
        }
    }, [debouncedEmail, isUnregisteredLearner]);

    useEffect(() => {
        if (isUnregisteredLearner && debouncedPhone && isValidPhone(debouncedPhone)) {
            checkUserExists('phone', debouncedPhone);
        }
    }, [debouncedPhone, isUnregisteredLearner]);

    // Event Handlers
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }

        // Clear existing user immediately when inputs are cleared or become invalid
        if (field === 'temp_learner_email') {
            if (!value || value.trim().length < 3 || !isValidEmail(value)) {
                clearExistingUser();
            }
        }

        if (field === 'temp_learner_phone') {
            if (!value || value.trim().length < 3 || !isValidPhone(value)) {
                clearExistingUser();
            }
        }
    };

    const handleLearnerTypeChange = (isUnregistered) => {
        setIsUnregisteredLearner(isUnregistered);
        // Clear existing user when switching modes
        clearExistingUser();

        if (isUnregistered) {
            setFormData(prev => ({
                ...prev,
                learner_id: null
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                temp_learner_name: '',
                temp_learner_surname: '',
                temp_learner_phone: '',
                temp_learner_email: ''
            }));
        }
    };

    const handleSelectExistingUser = () => {
        if (!existingUser) return;

        // Switch to registered student mode first
        setIsUnregisteredLearner(false);

        // Set the learner ID and clear temp fields
        setFormData(prev => ({
            ...prev,
            learner_id: existingUser.id,
            temp_learner_name: '',
            temp_learner_surname: '',
            temp_learner_phone: '',
            temp_learner_email: ''
        }));

        // Don't clear existing user immediately - we'll pass it to RegisteredStudentSelector
        // so it can pre-populate the search field, then clear it after
    };

    // Validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.scheduled_date || !formData.scheduled_time) {
            newErrors.scheduled_date = "Scheduled date and time is required";
        }

        if (!formData.instructor_id) {
            newErrors.instructor_id = "Please select an instructor";
        }

        if (!formData.duration_amount || formData.duration_amount < 0.25) {
            newErrors.duration_amount = "Duration must be at least 15 minutes (0.25 hours)";
        }

        if (!formData.lesson_type.trim()) {
            newErrors.lesson_type = "Lesson type is required";
        }

        // Use auth.user directly for validation as well
        const currentUser = auth?.user || user;
        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner' || currentUser.role === 'super_admin')) {
            if (isUnregisteredLearner) {
                if (!formData.temp_learner_name.trim()) {
                    newErrors.temp_learner_name = "First name is required";
                }
                if (!formData.temp_learner_surname.trim()) {
                    newErrors.temp_learner_surname = "Surname is required";
                }
                if (!formData.temp_learner_phone.trim()) {
                    newErrors.temp_learner_phone = "Phone number is required";
                }
                if (!formData.temp_learner_email.trim()) {
                    newErrors.temp_learner_email = "Email is required";
                } else if (!/\S+@\S+\.\S+/.test(formData.temp_learner_email)) {
                    newErrors.temp_learner_email = "Please enter a valid email";
                }

                if (existingUser) {
                    if (checkField === 'email') {
                        newErrors.temp_learner_email = "This email is already registered. Please select the existing user or use a different email.";
                    }
                    if (checkField === 'phone') {
                        newErrors.temp_learner_phone = "This phone number is already registered. Please select the existing user or use a different number.";
                    }
                }
            } else {
                if (!formData.learner_id) {
                    newErrors.learner_id = "Please select a registered learner";
                }
            }
        }

        if (formData.is_pickup_required) {
            if (!formData.pickup_location.trim()) {
                newErrors.pickup_location = "Pickup location is required when pickup is enabled";
            }
            if (!formData.dropoff_location.trim()) {
                newErrors.dropoff_location = "Drop-off location is required when pickup is enabled";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Form Submission
    // Form Submission - Updated to use POST API
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            // Calculate scheduled_start in ISO format
            const scheduledStart = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);

            // Calculate duration in minutes
            const durationMinutes = formData.duration_unit === 'hours'
                ? Math.round(parseFloat(formData.duration_amount) * 60)
                : parseInt(formData.duration_amount);

            // Prepare the submission data according to API schema
            const submissionData = {
                scheduled_start: scheduledStart.toISOString(),
                duration_minutes: durationMinutes,
                total_hours_booked: parseInt(durationMinutes / 60), // You might want to calculate this based on your business logic
                total_amount: parseInt(durationMinutes / 60) * 300, // You might want to calculate this based on your business logic
                amount_paid: parseInt(durationMinutes / 60) * 300, // Default to 0 for new bookings
                pickup_location: formData.is_pickup_required ? formData.pickup_location : "",
                dropoff_location: formData.is_pickup_required ? formData.dropoff_location : "",
                is_pickup_required: formData.is_pickup_required,
                lesson_type: formData.lesson_type,
                vehicle_transmission: formData.vehicle_transmission,
                vehicle_class: formData.vehicle_class,
                notes: formData.notes,
                learner_id: formData.learner_id ? parseInt(formData.learner_id) : null,
                instructor_id: parseInt(formData.instructor_id),
                status: formData.status
            };

            // Add temporary learner data only if creating booking for unregistered learner
            if (isUnregisteredLearner) {
                submissionData.temp_learner_name = formData.temp_learner_name;
                submissionData.temp_learner_surname = formData.temp_learner_surname;
                submissionData.temp_learner_phone = formData.temp_learner_phone;
                submissionData.temp_learner_email = formData.temp_learner_email;
            }

            console.log('Submitting booking data:', submissionData);

            // Determine if we need to confirm existing user (for unregistered learners with existing user found)
            const confirmExistingUser = isUnregisteredLearner && existingUser ? 'true' : 'false';
            const queryParams = new URLSearchParams({ confirm_existing_user: confirmExistingUser });

            // Make the API call to create booking
            const response = await fetch(`/api/bookings?${queryParams}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            })

            console.log("RESPONSE: ", response)
            const result = await response.json();

            if (!response.ok) {
                // Handle different types of API errors
                throw new Error(result.message || 'Failed to create booking');
            }

            console.log('Booking created successfully:', result);

            // Show success message or navigate
            // You could add a success toast here if you have a toast system

            // Navigate back on success
            if (onBack) {
                onBack();
            } else if (onNavigate) {
                onNavigate('bookings');
            } else {
                router.push('/bookings');
            }

        } catch (err) {
            console.error("Error creating booking:", err);

            // Handle specific API errors
            if (err.message.includes('Missing required fields')) {
                setErrors({ general: "Please fill in all required fields." });
            } else if (err.message.includes('Invalid date format')) {
                setErrors({ general: "Please check your date and time selections." });
            } else if (err.message.includes('Start time must be before end time')) {
                setErrors({ general: "Invalid time selection. Please check your schedule." });
            } else if (err.message.includes('already registered')) {
                setErrors({ general: "This user is already registered. Please select them from the existing users or use different contact details." });
            } else {
                setErrors({ general: err.message || "An unexpected error occurred. Please try again." });
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Loading State
    if (loading && instructors.length === 0) {
        return (
            <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
                <div className="space-y-2">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    // Use auth.user directly for the render condition
    const currentUser = auth?.user || user;
    const showStudentSelection = currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner' || currentUser.role === 'super_admin');

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div>
                    <h2 className="text-2xl font-bold">Create New Booking</h2>
                    <p className="text-muted-foreground">Schedule a new driving lesson</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Error */}
                {errors.general && (
                    <Card className="border-destructive">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2 text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <span>{errors.general}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Student Selection (Admin/Owner only) */}
                {showStudentSelection && (
                    <StudentSelection
                        isUnregisteredLearner={isUnregisteredLearner}
                        onLearnerTypeChange={handleLearnerTypeChange}
                        formData={formData}
                        onInputChange={handleInputChange}
                        existingUser={existingUser}
                        checkingUser={checkingUser}
                        checkField={checkField}
                        onSelectExistingUser={handleSelectExistingUser}
                        clearExistingUser={clearExistingUser}
                        errors={errors}
                    />
                )}

                {/* Lesson Details */}
                <LessonDetails
                    formData={formData}
                    onInputChange={handleInputChange}
                    instructors={instructors}
                    errors={errors}
                    onScheduleChange={handleScheduleChange}
                    loadingInstructors={loadingInstructors}
                />

                {/* Vehicle Details */}
                <VehicleDetails
                    formData={formData}
                    onInputChange={handleInputChange}
                />

                {/* Location Details */}
                <LocationDetails
                    formData={formData}
                    onInputChange={handleInputChange}
                    errors={errors}
                />

                {/* Additional Notes */}
                <AdditionalNotes
                    formData={formData}
                    onInputChange={handleInputChange}
                />

                {/* Submit Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack || (() => onNavigate && onNavigate('create-booking'))}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center space-x-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Creating Booking...</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                <span>Create Booking</span>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}