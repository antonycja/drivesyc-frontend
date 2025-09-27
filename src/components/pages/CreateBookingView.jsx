"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/components/auth/utils/authProvider';

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

// Custom Components
import BookingHeader from "@/components/booking/create/BookingHeader";
import BookingForm from "@/components/booking/create/BookingForm";
import LoadingSkeleton from "@/components/booking/LoadingSkeleton";

// Custom Hooks
import { useBookingData } from "@/hooks/useBookingData";
import { useInstructors } from "@/hooks/useInstructors";

export default function CreateBookingView({ onNavigate, onBack }) {
    const router = useRouter();
    const auth = useAuth();

    // Custom hooks for data management
    const {
        formData,
        errors,
        isUnregisteredLearner,
        existingUser,
        checkingUser,
        checkField,
        submitting,
        handleInputChange,
        handleLearnerTypeChange,
        handleSelectExistingUser,
        clearExistingUser,
        handleSubmit: onSubmit,
        setErrors
    } = useBookingData({ onBack, onNavigate, router, auth });

    const {
        instructors,
        loadingInstructors,
        fetchAvailableInstructors
    } = useInstructors();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // Helper Functions
    const isAdminOrOwner = useCallback((userObj = null) => {
        const currentUser = userObj || auth?.user || user;
        return currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner' || currentUser.role === 'super_admin');
    }, [auth?.user, user]);

    // Handle schedule changes from LessonDetails
    const handleScheduleChange = useCallback((scheduleData) => {
        // console.log('Schedule changed:', scheduleData);
        fetchAvailableInstructors(scheduleData, formData.instructor_id);
    }, [fetchAvailableInstructors, formData.instructor_id]);

    // Handle form submission
    const handleSubmit = async (e) => {
        await onSubmit(e, {
            isUnregisteredLearner,
            existingUser,
            setErrors
        });
    };

    // Effects
    useEffect(() => {
        if (!auth) return;
        if (auth.loading) return;

        if (auth.error || !auth.isAuthenticated || !auth.user) {
            router.replace("/auth/login");
            return;
        }

        const currentUser = auth.user;
        // console.log('Current user from auth:', currentUser);
        setUser(currentUser);

        // Auto-select learner for learner users
        if (currentUser.role === 'learner' && !isAdminOrOwner(currentUser)) {
            handleInputChange('learner_id', currentUser.id);
        }

        setLoading(false);
    }, [auth, router, isAdminOrOwner, handleInputChange]);

    // Loading State
    if (loading && instructors.length === 0) {
        return <LoadingSkeleton />;
    }

    // Determine if student selection should be shown
    const currentUser = auth?.user || user;
    const showStudentSelection = currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner' || currentUser.role === 'super_admin');

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-6xl mx-auto">
            <BookingHeader />

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

                <BookingForm
                    showStudentSelection={showStudentSelection}
                    isUnregisteredLearner={isUnregisteredLearner}
                    formData={formData}
                    errors={errors}
                    instructors={instructors}
                    loadingInstructors={loadingInstructors}
                    existingUser={existingUser}
                    checkingUser={checkingUser}
                    checkField={checkField}
                    submitting={submitting}
                    onInputChange={handleInputChange}
                    onLearnerTypeChange={handleLearnerTypeChange}
                    onSelectExistingUser={handleSelectExistingUser}
                    onScheduleChange={handleScheduleChange}
                    clearExistingUser={clearExistingUser}
                    onBack={onBack}
                    onNavigate={onNavigate}
                />
            </form>
        </div>
    );
}