'use server';
import { NextResponse } from 'next/server';
import { getToken, getTokenInfo } from '@/lib/auth';
import { serverFetch } from '@/app/api/lib/serverFetch';

const BASE = `${process.env.API_BASE_URL}/api/v1`;

/**
 * GET /api/school-users
 *
 * Lists users belonging to the authenticated user's school.
 * Proxies to GET /api/v1/schools/{school_id}/users
 *
 * Query params forwarded:
 *   role, is_active, search, page, page_size
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

        const { searchParams } = new URL(request.url);
        const params = new URLSearchParams();

        const role = searchParams.get('role');
        const isActive = searchParams.get('is_active');
        const search = searchParams.get('search');
        const page = searchParams.get('page') || '1';
        const pageSize = searchParams.get('page_size') || '100';

        if (role) params.set('role', role);
        if (isActive !== null && isActive !== undefined && isActive !== '') params.set('is_active', isActive);
        if (search) params.set('search', search);
        params.set('page', page);
        params.set('page_size', pageSize);

        const { data, status } = await serverFetch(
            `${BASE}/schools/${schoolId}/users?${params.toString()}`
        );

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('GET /api/school-users error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}
