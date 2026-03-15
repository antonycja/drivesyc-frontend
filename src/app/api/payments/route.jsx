'use server';
import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/lib/serverFetch';

const BASE = `${process.env.API_BASE_URL}/api/v1`;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get('booking_id');

        // If booking_id is provided, delegate to the booking-scoped payments endpoint
        if (bookingId) {
            if (isNaN(Number(bookingId))) {
                return NextResponse.json(
                    { message: 'Invalid booking_id parameter', code: 'VALIDATION_ERROR' },
                    { status: 400 }
                );
            }
            const { data, status } = await serverFetch(`${BASE}/payments/booking/${bookingId}`);
            return NextResponse.json(data, { status });
        }

        // Otherwise return school-wide payments list
        const limit = searchParams.get('limit') || '50';
        const offset = searchParams.get('offset') || '0';

        const { data, status } = await serverFetch(
            `${BASE}/payments/?limit=${limit}&offset=${offset}`
        );

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('GET /api/payments error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.booking_id || !body.amount) {
            return NextResponse.json(
                { message: 'booking_id and amount are required', code: 'VALIDATION_ERROR' },
                { status: 400 }
            );
        }

        if (isNaN(Number(body.amount)) || Number(body.amount) <= 0) {
            return NextResponse.json(
                { message: 'amount must be a positive number', code: 'VALIDATION_ERROR' },
                { status: 400 }
            );
        }

        const { data, status } = await serverFetch(`${BASE}/payments/`, {
            method: 'POST',
            body: JSON.stringify(body),
        });

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('POST /api/payments error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}
