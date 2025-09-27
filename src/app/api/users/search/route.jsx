'use server'

import { NextResponse } from "next/server";
import { serverFetch } from '@/app/api/lib/serverFetch'

// Base URL for your API
const API_BASE = process.env.API_BASE_URL;


/**
 * GET /api/users/search?q=...&limit=...
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const limit = searchParams.get('limit') || 20;

    if (!q) {
        return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    const API_URL = `${API_BASE}/api/v1/users/search?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}`;
    const { data, status } = await serverFetch(API_URL);

    if (status !== 200) {
        return NextResponse.json({ error: "Failed to search users" }, { status: status });
    }

    return NextResponse.json({ ...data }, { status: status });
}
