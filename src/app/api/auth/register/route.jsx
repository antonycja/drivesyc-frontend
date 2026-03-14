'use server';
import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/lib/serverFetch';

const API_REGISTER_URL = `${process.env.API_BASE_URL}/api/v1/auth/register`;

/**
 * POST /api/auth/register
 *
 * Registers a new user (standard flow — no invite token).
 * Body: { first_name, last_name, email, password, phone_number?, invite_token? }
 *
 * The backend returns 201 with { message, user } on success.
 * No auth cookies are set here — users must log in after registration
 * since accounts start as PENDING approval.
 */
export async function POST(request) {
    try {
        const body = await request.json();

        const { data, status } = await serverFetch(API_REGISTER_URL, {
            requireAuth: false,
            method: 'POST',
            body: JSON.stringify(body),
        });

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('POST /api/auth/register error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}
