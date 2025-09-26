'use server'
import { NextResponse } from "next/server";
import ApiProxy from '@/app/api/proxy'


const API_ME_URL = `${process.env.API_BASE_URL}/api/v1/auth/me`;

export async function GET(request) {

    const {data, status} = await ApiProxy.get(API_ME_URL, true)


    if (status !== 200) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ ...data }, { status: status })


}