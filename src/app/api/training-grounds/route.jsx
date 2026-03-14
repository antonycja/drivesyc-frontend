'use server';
import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/lib/serverFetch';

const BASE = `${process.env.API_BASE_URL}/api/v1`;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const skip = searchParams.get('skip') || '0';
        const limit = searchParams.get('limit') || '100';

        const { data, status } = await serverFetch(
            `${BASE}/training-grounds/?skip=${skip}&limit=${limit}`
        );

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('GET /api/training-grounds error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        const { data, status } = await serverFetch(`${BASE}/training-grounds/`, {
            method: 'POST',
            body: JSON.stringify(body),
        });

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('POST /api/training-grounds error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}
