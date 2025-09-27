'use server'
import { NextResponse } from "next/server";
import { setRefreshToken, setToken } from '@/lib/auth'
import { serverFetch } from '@/app/api/lib/serverFetch'
const API_LOGIN_URL = `${process.env.API_BASE_URL}/api/v1/auth/login`;

export async function POST(request) {
    let requestData = await request.json()

    requestData = requestData.body

    console.log("requestData: ", requestData.body)

    if (requestData.emailOrPhone.includes('@')) {
        requestData["email"] = requestData.emailOrPhone.toLowerCase().trim()
    } else {
        requestData["phone_number"] = requestData.emailOrPhone.toLowerCase().trim()
    }
    delete requestData.emailOrPhone

    const rememberMe = requestData.rememberMe || false;
    delete requestData.rememberMe; // Remove from API request

    const { data, status } = await serverFetch(API_LOGIN_URL, {
        requireAuth: false,
        method: 'POST',
        body: JSON.stringify(requestData)
    });

    if (status === 200) {
        const access = data.access_token
        const refresh = data.refresh_token

        // Pass rememberMe to token setting functions
        await setToken(access, rememberMe)
        await setRefreshToken(refresh, rememberMe)

        let route = '/dashboard'
        return NextResponse.json({ loggedIn: true, route }, { status: 200 })
    }

    return NextResponse.json({ loggedIn: false, ...data }, { status: 400 })
}