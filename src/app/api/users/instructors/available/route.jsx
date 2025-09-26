'use server'

import { NextResponse } from "next/server";
import ApiProxy from '@/app/api/proxy'

// Base URL for your API
const API_BASE = process.env.API_BASE_URL;

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');


    // Build query parameters more cleanly
    const queryParams = new URLSearchParams();
    if (start) queryParams.append('start', start);
    if (end) queryParams.append('end', end);

    const API_URL = `${API_BASE}/api/v1/users/instructors/available?${queryParams.toString()}`;

    try {
        const { data, status } = await ApiProxy.get(API_URL, true);

        if (status !== 200) {
            return NextResponse.json({ error: "Failed to get instructors" }, { status: status });
        }

        return NextResponse.json(data, { status: status });
    } catch (error) {
        console.error('Error getting instructors:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}