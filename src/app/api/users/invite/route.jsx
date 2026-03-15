'use server';
import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/lib/serverFetch';

const API_BASE = `${process.env.API_BASE_URL}/api/v1`;

export async function POST(request) {
    try {
        const body = await request.json();

        const { email, role, first_name, last_name } = body;

        if (!email || !email.includes('@')) {
            return NextResponse.json({ message: 'A valid email address is required', code: 'VALIDATION_ERROR' }, { status: 400 });
        }

        const allowedRoles = ['instructor', 'learner', 'admin'];
        if (!role || !allowedRoles.includes(role)) {
            return NextResponse.json(
                { message: `Role must be one of: ${allowedRoles.join(', ')}`, code: 'VALIDATION_ERROR' },
                { status: 400 }
            );
        }

        const payload = { email, role };
        if (first_name) payload.first_name = first_name;
        if (last_name) payload.last_name = last_name;

        const { data, status } = await serverFetch(`${API_BASE}/users/invite`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        if (status === 200 || status === 201) return NextResponse.json(data, { status: 201 });

        const errorMap = {
            409: { message: data?.detail || 'User already registered with this email', code: 'CONFLICT' },
            403: { message: "You don't have permission to send invitations.", code: 'FORBIDDEN' },
            401: { message: 'Please log in to continue.', code: 'UNAUTHORIZED' },
        };

        const error = errorMap[status] || {
            message: data?.detail || 'Failed to send invitation',
            code: 'API_ERROR',
        };

        return NextResponse.json(error, { status: Math.min(status, 500) });
    } catch (error) {
        console.error('Send invitation error:', error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid JSON in request body', code: 'VALIDATION_ERROR' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Service temporarily unavailable.', code: 'SERVICE_ERROR' }, { status: 503 });
    }
}
