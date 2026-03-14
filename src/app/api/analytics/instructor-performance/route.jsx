'use server';
import { NextResponse } from 'next/server';
import { getToken, getTokenInfo } from '@/lib/auth';
import { serverFetch } from '@/app/api/lib/serverFetch';

const BASE = `${process.env.API_BASE_URL}/api/v1`;

/**
 * GET /api/analytics/instructor-performance
 *
 * Returns the authenticated instructor's own performance metrics.
 * Derives instructor_id from the JWT — no client-supplied ID accepted.
 */
export async function GET() {
    try {
        const token = await getToken();
        const info = await getTokenInfo(token);
        const instructorId = info?.user_id;

        if (!instructorId) {
            return NextResponse.json(
                { message: 'Unable to determine instructor from session.' },
                { status: 400 }
            );
        }

        const { data, status } = await serverFetch(
            `${BASE}/instructors/${instructorId}/performance`
        );

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('GET /api/analytics/instructor-performance error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}
