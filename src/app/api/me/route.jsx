'use server'
import { NextResponse } from "next/server";
import { getToken } from '@/lib/auth'
import ApiProxy from '@/app/api/proxy'


const API_ME_URL = `${process.env.API_BASE_URL}/api/v1/auth/me`;

export async function GET(request) {

    const response = await ApiProxy.get(API_ME_URL, true)

    const result = await response.json()

    let status = response.status

    if (!response.ok) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ ...result }, { status: status })


}