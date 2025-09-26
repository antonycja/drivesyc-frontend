'use server'
import { NextResponse } from "next/server";
import { deleteTokens } from '@/lib/auth'
import ApiProxy from '@/app/api/proxy'
import { getToken } from '@/lib/auth'

const API_LOGOUT_URL = `${process.env.API_BASE_URL}/api/v1/auth/logout`;

export async function POST(request) {
    try {
        const token = await getToken()

        if (token) {
            const { data, status } = await ApiProxy.post(API_LOGOUT_URL, {}, true)

            if (status !== 200) {
                // Log the error but continue with local cleanup
                console.log('API logout failed with status:', status, data)
            }
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