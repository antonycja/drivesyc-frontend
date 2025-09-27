'use server'

import { NextResponse } from "next/server";
import { serverFetch } from '@/app/api/lib/serverFetch'

// Base URL for your API
const API_BASE = process.env.API_BASE_URL;

/**
 * GET /api/users/check-exists?email=...&phone=...
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    // Validate that at least one parameter is provided
    if (!email && !phone) {
        return NextResponse.json(
            { error: "Email or phone must be provided" },
            { status: 422 }
        );
    }

    // Validate email format if provided
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 422 }
            );
        }
    }

    // Log for debugging
    // console.log('Checking user with:', { email, phone });

    // Build query parameters more cleanly
    const queryParams = new URLSearchParams();
    if (email) queryParams.append('email', email);
    if (phone) queryParams.append('phone', phone);

    const API_URL = `${API_BASE}/api/v1/users/check-exists?${queryParams.toString()}`;

    try {
        const { data, status } = await serverFetch(API_URL);

        if (status !== 200) {
            return NextResponse.json({ error: "Failed to check user" }, { status: status });
        }

        return NextResponse.json({ ...data }, { status: status });
    } catch (error) {
        console.error('Error checking user:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}