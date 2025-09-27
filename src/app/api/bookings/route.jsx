'use server'
import { NextResponse } from "next/server";
import { serverFetch } from '@/app/api/lib/serverFetch'

const API_BOOKINGS_URL = `${process.env.API_BASE_URL}/api/v1/bookings`;

// Utility function for consistent error handling
function handleApiError(status, data, defaultMessage) {
    const errorMap = {
        400: { message: data?.detail || "Invalid request. Please check your input.", code: "VALIDATION_ERROR" },
        401: { message: "Please log in to continue.", code: "UNAUTHORIZED" },
        403: { message: "You don't have permission to perform this action.", code: "FORBIDDEN" },
        404: { message: "The requested resource was not found.", code: "NOT_FOUND" },
        409: { message: data?.detail || "Conflict: This request conflicts with existing data. Please check your selections.", code: "CONFLICT" },
        422: { message: data?.detail || "Invalid data provided.", code: "VALIDATION_ERROR" },
        429: { message: "Too many requests. Please wait a moment and try again.", code: "RATE_LIMITED" },
        500: { message: "Server error. Please try again later.", code: "SERVER_ERROR" },
        502: { message: "Service temporarily unavailable. Please try again.", code: "SERVICE_UNAVAILABLE" },
        503: { message: "Service temporarily unavailable. Please try again.", code: "SERVICE_UNAVAILABLE" }
    };

    const error = errorMap[status] || {
        message: defaultMessage || "Something went wrong. Please try again.",
        code: "UNKNOWN_ERROR"
    };

    return NextResponse.json(error, { status: Math.min(status, 500) });
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeCanceled = searchParams.get('include_canceled') || 'true';

        // Validate boolean parameter
        if (!['true', 'false'].includes(includeCanceled.toLowerCase())) {
            return NextResponse.json({
                message: "include_canceled must be true or false",
                code: "VALIDATION_ERROR"
            }, { status: 400 });
        }

        const url = `${API_BOOKINGS_URL}/?include_canceled=${includeCanceled}`;
        // console.log('Fetching bookings:', { url, includeCanceled });

        const { data, status } = await serverFetch(url);

        if (status === 200) {
            // Transform data if needed
            const bookings = Array.isArray(data) ? data : data.bookings || [];
            return NextResponse.json({
                bookings,
                total: bookings.length,
                include_canceled: includeCanceled === 'true'
            }, { status: 200 });
        }

        return handleApiError(status, data, "Failed to fetch bookings");

    } catch (error) {
        console.error('Get bookings error:', error);
        return NextResponse.json({
            message: "Service temporarily unavailable. Please try again.",
            code: "SERVICE_ERROR"
        }, { status: 503 });
    }
}

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const requestData = await request.json();
        const confirmExistingUser = searchParams.get('confirm_existing_user') || 'false';

        // Validate required fields according to BookingCreate schema
        const requiredFields = ['scheduled_start', 'instructor_id'];
        const missingFields = requiredFields.filter(field => !requestData[field]);

        // Either learner_id or temp learner data must be provided
        if (!requestData.learner_id &&
            (!requestData.temp_learner_name || !requestData.temp_learner_email)) {
            missingFields.push('learner_id or temp_learner_data');
        }

        if (missingFields.length > 0) {
            return NextResponse.json({
                message: `Missing required fields: ${missingFields.join(', ')}`,
                code: "VALIDATION_ERROR",
                missing_fields: missingFields
            }, { status: 400 });
        }

        // Validate date format for scheduled_start
        if (requestData.scheduled_start && isNaN(Date.parse(requestData.scheduled_start))) {
            return NextResponse.json({
                message: "Invalid date format for scheduled_start. Use ISO format (YYYY-MM-DDTHH:mm:ss)",
                code: "VALIDATION_ERROR"
            }, { status: 400 });
        }

        // Validate duration_minutes if provided
        if (requestData.duration_minutes &&
            (typeof requestData.duration_minutes !== 'number' || requestData.duration_minutes <= 0)) {
            return NextResponse.json({
                message: "duration_minutes must be a positive number",
                code: "VALIDATION_ERROR"
            }, { status: 400 });
        }

        // Validate instructor_id and learner_id are integers
        if (requestData.instructor_id && !Number.isInteger(Number(requestData.instructor_id))) {
            return NextResponse.json({
                message: "instructor_id must be an integer",
                code: "VALIDATION_ERROR"
            }, { status: 400 });
        }

        if (requestData.learner_id && !Number.isInteger(Number(requestData.learner_id))) {
            return NextResponse.json({
                message: "learner_id must be an integer",
                code: "VALIDATION_ERROR"
            }, { status: 400 });
        }

        const url = `${API_BOOKINGS_URL}/?confirm_existing_user=${confirmExistingUser}`;
        // console.log('Creating booking:', { url, requestData: { ...requestData, confirm_existing_user: confirmExistingUser } });

        const { data, status } = await serverFetch(url, {
            method: 'POST',
            body: JSON.stringify(requestData)
        });

        // Log detailed response for debugging
        // console.log('Backend API Response:', { status, data, requestData });

        if (status === 200 || status === 201) {
            return NextResponse.json({
                success: true,
                message: "Booking created successfully",
                booking: data
            }, { status: 201 });
        }

        return handleApiError(status, data, "Failed to create booking");

    } catch (error) {
        console.error('Create booking error:', error);

        // Handle JSON parsing errors
        if (error instanceof SyntaxError) {
            return NextResponse.json({
                message: "Invalid JSON in request body",
                code: "VALIDATION_ERROR"
            }, { status: 400 });
        }

        return NextResponse.json({
            message: "Service temporarily unavailable. Please try again.",
            code: "SERVICE_ERROR"
        }, { status: 503 });
    }
}