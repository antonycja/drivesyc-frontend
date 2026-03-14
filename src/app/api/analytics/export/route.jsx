'use server';
import { NextResponse } from 'next/server';
import { getToken, getTokenInfo } from '@/lib/auth';
import { serverFetch } from '@/app/api/lib/serverFetch';

const BASE = `${process.env.API_BASE_URL}/api/v1`;

/**
 * GET /api/analytics/export?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 *
 * Exports booking data for the authenticated school within a date range.
 * Max range is 90 days (enforced by backend).
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');

        if (!startDate || !endDate) {
            return NextResponse.json(
                { message: 'start_date and end_date are required query parameters.' },
                { status: 400 }
            );
        }

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
            `${BASE}/schools/${schoolId}/reports/export?start_date=${startDate}&end_date=${endDate}`
        );

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('GET /api/analytics/export error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}
