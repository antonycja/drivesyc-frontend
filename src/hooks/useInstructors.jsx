// hooks/useInstructors.js
import { useState, useCallback } from "react";

export function useInstructors() {
    const [instructors, setInstructors] = useState([]);
    const [loadingInstructors, setLoadingInstructors] = useState(false);

    const fetchAvailableInstructors = useCallback(async (scheduleData, currentInstructorId) => {
        try {
            setLoadingInstructors(true);
            console.log('Fetching available instructors for:', scheduleData);

            // Create datetime strings without timezone conversion
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
            const instructorsArray = Array.isArray(data) ? data : [];
            console.log('Available instructors:', instructorsArray);

            // Transform the API response to match expected format
            const formattedInstructors = instructorsArray.map(instructor => ({
                id: instructor.id,
                name: `${instructor.first_name} ${instructor.last_name}`,
                first_name: instructor.first_name,
                last_name: instructor.last_name,
                email: instructor.email,
                role: instructor.role,
                is_active: instructor.is_active,
                profile_image_url: instructor.profile_image_url,
                is_available: true
            }));

            setInstructors(formattedInstructors);

            // Return information about instructor availability for form updates
            if (currentInstructorId) {
                const isCurrentInstructorAvailable = formattedInstructors.some(
                    instructor => instructor.id.toString() === currentInstructorId.toString()
                );
                return { instructors: formattedInstructors, currentInstructorAvailable: isCurrentInstructorAvailable };
            }

            return { instructors: formattedInstructors, currentInstructorAvailable: true };

        } catch (err) {
            console.error("Error fetching available instructors:", err);
            return { instructors: [], currentInstructorAvailable: false };
        } finally {
            setLoadingInstructors(false);
        }
    }, []);

    return {
        instructors,
        setInstructors,
        loadingInstructors,
        fetchAvailableInstructors
    };
}