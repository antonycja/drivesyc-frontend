'use server';
import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/lib/serverFetch';

const API_FORGOT_URL = `${process.env.API_BASE_URL}/api/v1/auth/forgot-password`;

/**
 * POST /api/auth/forgot-password
 *
 * Requests a password-reset token for the given email.
 * Always returns 200 regardless of whether the email exists (security best practice).
 * Body: { email }
 */
export async function POST(request) {
    try {
        const body = await request.json();

        const { data, status } = await serverFetch(API_FORGOT_URL, {
            requireAuth: false,
            method: 'POST',
            body: JSON.stringify(body),
        });

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('POST /api/auth/forgot-password error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}
