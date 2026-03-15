'use server';
import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/lib/serverFetch';

const BASE = `${process.env.API_BASE_URL}/api/v1`;

export async function GET(request, { params }) {
    try {
        const { bookingId } = await params;
        if (!bookingId || isNaN(Number(bookingId))) {
            return NextResponse.json({ message: 'Invalid booking ID', code: 'VALIDATION_ERROR' }, { status: 400 });
        }
        const { data, status } = await serverFetch(`${BASE}/payments/booking/${bookingId}`);
        if (status === 200) return NextResponse.json(data, { status: 200 });
        return NextResponse.json(
            { message: 'Failed to fetch booking payments', code: 'API_ERROR' },
            { status: Math.min(status, 500) }
        );
    } catch (error) {
        console.error('GET /api/payments/booking/[bookingId] error:', error);
        return NextResponse.json({ message: 'Service temporarily unavailable.', code: 'SERVICE_ERROR' }, { status: 503 });
    }
}
