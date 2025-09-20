'use server'
import { NextResponse } from "next/server";
import { setRefreshToken, setToken } from '@/lib/auth'
import ApiProxy from '@/app/api/proxy'
const API_LOGIN_URL = `${process.env.API_BASE_URL}/api/v1/auth/login`;

export async function POST(request) {
    const requestData = await request.json()

    if (requestData.emailOrPhone.includes('@')) {
        requestData["email"] = requestData.emailOrPhone.toLowerCase().trim()
    } else {
        requestData["phone_number"] = requestData.emailOrPhone.toLowerCase().trim()
    }
    delete requestData.emailOrPhone


    const response = await ApiProxy.post(API_LOGIN_URL, requestData, false)

    const responseData = await response.json();

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