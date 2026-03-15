'use server';
import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/lib/serverFetch';

const API_BASE = `${process.env.API_BASE_URL}/api/v1`;

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        if (!id || isNaN(Number(id))) {
            return NextResponse.json({ message: 'Invalid user ID', code: 'VALIDATION_ERROR' }, { status: 400 });
        }

        const body = await request.json();
        const weight = body?.priority_weight;

        if (weight === undefined || weight === null) {
            return NextResponse.json({ message: 'priority_weight is required', code: 'VALIDATION_ERROR' }, { status: 400 });
        }

        const numWeight = parseFloat(weight);
        if (isNaN(numWeight) || numWeight < 1.0 || numWeight > 10.0) {
            return NextResponse.json({ message: 'priority_weight must be between 1 and 10', code: 'VALIDATION_ERROR' }, { status: 400 });
        }

        const { data, status } = await serverFetch(`${API_BASE}/users/${id}/priority`, {
            method: 'PATCH',
            body: JSON.stringify({ priority_weight: numWeight }),
        });

        if (status === 200) return NextResponse.json(data, { status: 200 });

        return NextResponse.json(
            { message: data?.detail || 'Failed to update priority weight', code: 'API_ERROR' },
            { status: Math.min(status, 500) }
        );
    } catch (error) {
        console.error('Update priority weight error:', error);
        return NextResponse.json({ message: 'Service temporarily unavailable.', code: 'SERVICE_ERROR' }, { status: 503 });
    }
}
