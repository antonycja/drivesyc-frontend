'use server';
import { NextResponse } from 'next/server';
import { getToken, getTokenInfo } from '@/lib/auth';
import { serverFetch } from '@/app/api/lib/serverFetch';

const BASE = `${process.env.API_BASE_URL}/api/v1`;

/**
 * GET /api/analytics/overview
 *
 * Proxies to the school stats endpoint since analytics/school overview
 * is covered by the existing /api/v1/schools/{school_id}/stats/ route.
 * The school_id is derived from the authenticated user's JWT.
 */
export async function GET(request) {
    try {
        const token = await getToken();
        const info = await getTokenInfo(token);
        const schoolId = info?.school_id;

        if (!schoolId) {
            return NextResponse.json(
                { message: 'Unable to determine school from session.' },
                { status: 400 }
            );
        }

        const { data, status } = await serverFetch(
            `${BASE}/schools/${schoolId}/stats/?include_canceled=false`
        );

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('GET /api/analytics/overview error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}
