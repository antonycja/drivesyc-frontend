'use server';
import { NextResponse } from 'next/server';
import { getToken, getTokenInfo } from '@/lib/auth';
import { serverFetch } from '@/app/api/lib/serverFetch';

const BASE = `${process.env.API_BASE_URL}/api/v1`;

/**
 * GET /api/analytics/learner-progress
 *
 * Returns the authenticated learner's own progress summary.
 * Derives learner_id from the JWT — no client-supplied ID accepted.
 */
export async function GET() {
    try {
        const token = await getToken();
        const info = await getTokenInfo(token);
        const learnerId = info?.user_id;

        if (!learnerId) {
            return NextResponse.json(
                { message: 'Unable to determine learner from session.' },
                { status: 400 }
            );
        }

        const { data, status } = await serverFetch(
            `${BASE}/learners/${learnerId}/progress`
        );

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('GET /api/analytics/learner-progress error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}
