'use server';
import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/lib/serverFetch';

const BASE = `${process.env.API_BASE_URL}/api/v1`;

/**
 * GET /api/vehicles
 *
 * Lists all active vehicles for the authenticated school.
 * Accepts optional query params: skip, limit.
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const skip = searchParams.get('skip') || '0';
        const limit = searchParams.get('limit') || '100';

        const { data, status } = await serverFetch(
            `${BASE}/vehicles/?skip=${skip}&limit=${limit}`
        );

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('GET /api/vehicles error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}

/**
 * POST /api/vehicles
 *
 * Creates a new vehicle for the authenticated school. Admin/Owner only.
 * Body: VehicleCreate schema fields.
 */
export async function POST(request) {
    try {
        const body = await request.json();

        const { data, status } = await serverFetch(`${BASE}/vehicles/`, {
            method: 'POST',
            body: JSON.stringify(body),
        });

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('POST /api/vehicles error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}
