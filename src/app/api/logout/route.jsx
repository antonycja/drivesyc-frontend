'use server'
import { NextResponse } from "next/server";
import { deleteTokens } from '@/lib/auth'
import ApiProxy from '@/app/api/proxy'

const API_LOGOUT_URL = `${process.env.API_BASE_URL}/api/v1/auth/logout`;

export async function POST(request) {
    try {
        // IMPORTANT: Call API logout FIRST while we still have the token
        const response = await ApiProxy.post(API_LOGOUT_URL, request, true) // Pass empty object and requireAuth=true

        let responseData = null;

        if (response.ok) {
            responseData = await response.json()
        } else {
            // Log the error but continue with local cleanup
            console.log('API logout failed with status:', response.status)
        }

        // Delete local tokens AFTER the API call (whether it succeeded or failed)
        await deleteTokens()

        return NextResponse.json({
            message: "Logged out successfully",
            loggedOut: true
        }, { status: 200 })

    } catch (error) {
        console.error('Logout error:', error);

        // If there's an error, still delete tokens locally as fallback
        try {
            await deleteTokens()
        } catch (deleteError) {
            console.error('Error deleting tokens:', deleteError)
        }

        return NextResponse.json({
            message: "Logged out (local cleanup completed)",
            loggedOut: true
        }, { status: 200 })
    }
}