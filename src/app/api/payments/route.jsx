'use server';
import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/lib/serverFetch';

const BASE = `${process.env.API_BASE_URL}/api/v1`;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') || '50';
        const offset = searchParams.get('offset') || '0';

        const { data, status } = await serverFetch(
            `${BASE}/payments/?limit=${limit}&offset=${offset}`
        );

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('GET /api/payments error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        const { data, status } = await serverFetch(`${BASE}/payments/`, {
            method: 'POST',
            body: JSON.stringify(body),
        });

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('POST /api/payments error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}
