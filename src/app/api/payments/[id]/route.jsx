'use server';
import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/lib/serverFetch';

const BASE = `${process.env.API_BASE_URL}/api/v1`;

export async function DELETE(request, { params }) {
    const { id } = await params;
    if (!id || isNaN(Number(id))) {
        return NextResponse.json(
            { message: 'Invalid payment ID', code: 'VALIDATION_ERROR' },
            { status: 400 }
        );
    }
    try {
        const { data, status } = await serverFetch(`${BASE}/payments/${id}`, {
            method: 'DELETE',
        });
        return NextResponse.json(data ?? {}, { status });
    } catch (error) {
        console.error(`DELETE /api/payments/${id} error:`, error);
        return NextResponse.json(
            { message: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}
