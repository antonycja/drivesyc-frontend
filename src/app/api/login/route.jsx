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


    const { data, status } = await ApiProxy.post(API_LOGIN_URL, requestData, false)
    if (status === 200) {
        const access = data.access_token
        const refresh = data.refresh_token
        await setToken(access, requestData.rememberMe)
        await setRefreshToken(refresh)
        let route = '/dashboard'
        return NextResponse.json({ loggedIn: true, route }, { status: 200 })

    }


    return NextResponse.json({ loggedIn: false, ...data }, { status: 400 })
}