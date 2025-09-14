'use server'
import { NextResponse } from "next/server";
import { setRefreshToken, setToken } from '@/lib/auth'
const API_LOGIN_URL = `${process.env.API_BASE_URL}/api/v1/auth/login`;

export async function POST(request) {
    const requestData = await request.json()

    let body = {}

    if (requestData.emailOrPhone.includes('@')) {
        body = {
            email: requestData.emailOrPhone.toLowerCase().trim(),
            password: requestData.password
        }
    } else {
        body = {
            phone_number: requestData.emailOrPhone.toLowerCase().trim(),
            password: requestData.password
        }
    }

    const response = await fetch(API_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
    });

    const responseData = await response.json()

    if (response.ok) {
        const access = responseData.access_token
        const refresh = responseData.refresh_token
        await setToken(access, requestData.rememberMe)
        await setRefreshToken(refresh)
        let route = '/dashboard'
        return NextResponse.json({ loggedIn: true, route }, { status: 200 })

    }


    return NextResponse.json({ loggedIn: false, ...responseData }, { status: 400 })
}