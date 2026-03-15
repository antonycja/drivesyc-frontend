'use server';
import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/lib/serverFetch';

const API_BASE = `${process.env.API_BASE_URL}/api/v1`;

function handleApiError(status, data, defaultMessage) {
    const errorMap = {
        400: { message: data?.detail || 'Invalid request.', code: 'VALIDATION_ERROR' },
        401: { message: 'Please log in to continue.', code: 'UNAUTHORIZED' },
        403: { message: "You don't have permission to perform this action.", code: 'FORBIDDEN' },
        404: { message: 'Booking not found.', code: 'NOT_FOUND' },
        422: { message: data?.detail || 'Invalid data provided.', code: 'VALIDATION_ERROR' },
        500: { message: 'Server error. Please try again later.', code: 'SERVER_ERROR' },
    };
    const error = errorMap[status] || {
        message: defaultMessage || 'Something went wrong.',
        code: 'UNKNOWN_ERROR',
    };
    return NextResponse.json(error, { status: Math.min(status, 500) });
}

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        if (!id || isNaN(Number(id))) {
            return NextResponse.json({ message: 'Invalid booking ID', code: 'VALIDATION_ERROR' }, { status: 400 });
        }
        const { data, status } = await serverFetch(`${API_BASE}/bookings/${id}`);
        if (status === 200) return NextResponse.json(data, { status: 200 });
        return handleApiError(status, data, 'Failed to fetch booking');
    } catch (error) {
        console.error('Get booking by id error:', error);
        return NextResponse.json({ message: 'Service temporarily unavailable.', code: 'SERVICE_ERROR' }, { status: 503 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        if (!id || isNaN(Number(id))) {
            return NextResponse.json({ message: 'Invalid booking ID', code: 'VALIDATION_ERROR' }, { status: 400 });
        }
        const body = await request.json();
        const { data, status } = await serverFetch(`${API_BASE}/bookings/update/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
        if (status === 200) return NextResponse.json(data, { status: 200 });
        return handleApiError(status, data, 'Failed to update booking');
    } catch (error) {
        console.error('Update booking error:', error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid JSON in request body', code: 'VALIDATION_ERROR' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Service temporarily unavailable.', code: 'SERVICE_ERROR' }, { status: 503 });
    }
}
