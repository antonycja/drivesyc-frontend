'use server'
import { NextResponse } from "next/server";
import { getRefreshToken, setToken, setRefreshToken, deleteTokens } from '@/lib/auth'

const API_REFRESH_URL = `${process.env.API_BASE_URL}/api/v1/auth/refresh_token`;

export async function POST(request) {
    console.log('🔄 Token refresh requested');

    try {
        const refreshToken = await getRefreshToken();
        console.log('🔍 Refresh token found:', refreshToken ? 'Yes' : 'No');

        if (!refreshToken) {
            console.log('❌ No refresh token found');
            return NextResponse.json({ error: 'No refresh token found' }, { status: 401 });
        }

        console.log('🌐 Making refresh request to:', API_REFRESH_URL);

        // Send refresh token as a cookie, not in the body
        const response = await fetch(API_REFRESH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `refresh_token=${refreshToken}` // Send as cookie
            }
        });

        console.log('📥 Refresh response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('📥 Refresh response data:', data);

            const newAccessToken = data.access_token;

            if (!newAccessToken) {
                console.log('❌ No access token in response:', data);
                throw new Error('No access token in refresh response');
            }

            console.log('✅ New tokens received, setting cookies...');

            const rememberMe = true; // Maintain the remember me state
            await setToken(newAccessToken, rememberMe);

            console.log('✅ Token refresh successful');
            return NextResponse.json({
                success: true,
                access_token: newAccessToken
            }, { status: 200 });
        }

        const errorData = await response.text();
        console.log('❌ Refresh failed with status:', response.status, 'data:', errorData);

        // Clear tokens on any failure
        await deleteTokens();
        return NextResponse.json({
            error: response.status === 403 ? 'Refresh token expired or invalid' : 'Token refresh failed',
            details: errorData
        }, { status: 401 });

    } catch (error) {
        console.error('💥 Token refresh error:', error);
        await deleteTokens();
        return NextResponse.json({
            error: 'Token refresh failed',
            details: error.message
        }, { status: 401 });
    }
}