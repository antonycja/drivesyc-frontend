'use server';
import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/lib/serverFetch';

const API_RESET_URL = `${process.env.API_BASE_URL}/api/v1/auth/reset-password`;

/**
 * POST /api/auth/reset-password
 *
 * Resets the user's password using a previously issued reset token.
 * Body: { token, new_password }
 */
export async function POST(request) {
    try {
        const body = await request.json();

        const { data, status } = await serverFetch(API_RESET_URL, {
            requireAuth: false,
            method: 'POST',
            body: JSON.stringify(body),
        });

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('POST /api/auth/reset-password error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}
