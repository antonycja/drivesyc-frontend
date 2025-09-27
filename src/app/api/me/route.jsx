'use server'
import { NextResponse } from "next/server";
import { getToken } from '@/lib/auth'; // Add this import
import { serverFetch } from '@/app/api/lib/serverFetch'

export async function GET() {
    try {
        const token = await getToken();

        if (!token) {
            return NextResponse.json({ error: 'No token found' }, { status: 401 });
        }

        // Use serverFetch correctly - it returns {data, status}
        const { data, status } = await serverFetch(`${process.env.API_BASE_URL}/api/v1/auth/me`);

        if (status === 200) {
            return NextResponse.json(data, { status: 200 });
        }

        // Return 401 so client-side can handle token refresh
        return NextResponse.json({ error: 'Token expired or invalid' }, { status: 401 });

    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}