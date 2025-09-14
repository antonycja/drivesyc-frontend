'use server'
import { NextResponse } from "next/server";
import { deleteTokens } from '@/lib/auth'

const API_LOGIN_URL = `${process.env.API_BASE_URL}/api/v1/auth/login`;

export async function POST(request) {
    await deleteTokens()
    return NextResponse.json({ message: "Logged out" }, {status: 200})
}