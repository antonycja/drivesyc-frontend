import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import useCheckUserExists from "@/hooks/useCheckUserExists";

export function useBookingData({ onBack, onNavigate, router, auth }) {
    const [submitting, setSubmitting] = useState(false);
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

    // Email and phone validation helpers
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidPhone = (phone) => {
        const cleanPhone = phone.replace(/[\s\+\-\(\)]/g, '');
        return cleanPhone.length >= 10;
    };

    const { existingUser, checkingUser, checkField, checkUserExists, clearExistingUser } = useCheckUserExists();

    // User checking effects
    useEffect(() => {
        if (isUnregisteredLearner && debouncedEmail && isValidEmail(debouncedEmail)) {
            checkUserExists('email', debouncedEmail);
        }
    }, [debouncedEmail, isUnregisteredLearner, checkUserExists]);

    useEffect(() => {
        if (isUnregisteredLearner && debouncedPhone && isValidPhone(debouncedPhone)) {
            checkUserExists('phone', debouncedPhone);
        }
    }, [debouncedPhone, isUnregisteredLearner, checkUserExists]);

    // Event Handlers
    const handleInputChange = useCallback((field, value) => {
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
    }, [errors, clearExistingUser]);

    const handleLearnerTypeChange = useCallback((isUnregistered) => {
        setIsUnregisteredLearner(isUnregistered);
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
    }, [clearExistingUser]);

    const handleSelectExistingUser = useCallback(() => {
        if (!existingUser) return;

        setIsUnregisteredLearner(false);
        setFormData(prev => ({
            ...prev,
            learner_id: existingUser.id,
            temp_learner_name: '',
            temp_learner_surname: '',
            temp_learner_phone: '',
            temp_learner_email: ''
        }));
    }, [existingUser]);

    // Validation
    const validateForm = useCallback(() => {
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

        const currentUser = auth?.user;
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
    }, [formData, auth, isUnregisteredLearner, existingUser, checkField]);

    // Form Submission
    const handleSubmit = useCallback(async (e, { isUnregisteredLearner, existingUser, setErrors }) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            const scheduledStart = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);
            const durationMinutes = formData.duration_unit === 'hours'
                ? Math.round(parseFloat(formData.duration_amount) * 60)
                : parseInt(formData.duration_amount);

            const submissionData = {
                scheduled_start: scheduledStart.toISOString(),
                duration_minutes: durationMinutes,
                total_hours_booked: parseInt(durationMinutes / 60),
                total_amount: parseInt(durationMinutes / 60) * 300,
                amount_paid: parseInt(durationMinutes / 60) * 300,
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

            if (isUnregisteredLearner) {
                submissionData.temp_learner_name = formData.temp_learner_name;
                submissionData.temp_learner_surname = formData.temp_learner_surname;
                submissionData.temp_learner_phone = formData.temp_learner_phone;
                submissionData.temp_learner_email = formData.temp_learner_email;
            }

            const confirmExistingUser = isUnregisteredLearner && existingUser ? 'true' : 'false';
            const queryParams = new URLSearchParams({ confirm_existing_user: confirmExistingUser });

            const response = await fetch(`/api/bookings?${queryParams}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create booking');
            }

            console.log('Booking created successfully:', result);

            if (onBack) {
                onBack();
            } else if (onNavigate) {
                onNavigate('bookings');
            } else {
                router.push('/bookings');
            }

        } catch (err) {
            console.error("Error creating booking:", err);

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
    }, [formData, validateForm, onBack, onNavigate, router]);

    return {
        formData,
        errors,
        setErrors,
        isUnregisteredLearner,
        existingUser,
        checkingUser,
        checkField,
        submitting,
        handleInputChange,
        handleLearnerTypeChange,
        handleSelectExistingUser,
        clearExistingUser,
        handleSubmit
    };
}