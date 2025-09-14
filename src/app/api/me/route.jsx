'use server'
import { NextResponse } from "next/server";
import { getToken, setToken } from '@/lib/auth'

const API_ME_URL = `${process.env.API_BASE_URL}/api/v1/auth/me`;

export async function GET(request) {
    const authToken = await getToken()

    if (!authToken) {
        return NextResponse.json({}, { status: 401 })
    }

    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
    }
    const response = await fetch(API_ME_URL, options);

    const result = await response.json()

    let status = response.status

    if (!response.ok) {
        status = 401
    }
    return NextResponse.json({ ...result }, { status: status })


}