'use server';
import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/lib/serverFetch';

const BASE = `${process.env.API_BASE_URL}/api/v1`;

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const { data, status } = await serverFetch(`${BASE}/training-grounds/${id}`);
        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('GET /api/training-grounds/[id] error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const { data, status } = await serverFetch(`${BASE}/training-grounds/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('PUT /api/training-grounds/[id] error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const { data, status } = await serverFetch(`${BASE}/training-grounds/${id}`, {
            method: 'DELETE',
        });
        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('DELETE /api/training-grounds/[id] error:', error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}
