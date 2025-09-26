'use server'
import { NextResponse } from "next/server";
import { getTokenInfo, getToken } from '@/lib/auth'
import ApiProxy from '@/app/api/proxy'

export async function GET(request) {
    const token = await getToken()
    const info = await getTokenInfo(token)

    try {
        const { searchParams } = new URL(request.url);
        const schoolId = info.school_id

        if (!schoolId) {
            return NextResponse.json({
                message: "Missing required parameter: school_id",
                code: "VALIDATION_ERROR"
            }, { status: 400 });
        }

        const includeCanceled = searchParams.get('include_canceled') || 'false';
        if (!['true', 'false'].includes(includeCanceled.toLowerCase())) {
            return NextResponse.json({
                message: "include_canceled must be true or false",
                code: "VALIDATION_ERROR"
            }, { status: 400 });
        }

        const API_STATS_URL = `${process.env.API_BASE_URL}/api/v1/schools/${schoolId}/stats/?include_canceled=${includeCanceled}`;
        console.log('Fetching school stats:', { API_STATS_URL });

        const { data, status } = await ApiProxy.get(API_STATS_URL, true);


        if (status === 200) {
            return NextResponse.json({
                ...data,
                include_canceled: includeCanceled === 'true'
            }, { status: 200 });
        }

        // Handle API errors
        const errorMap = {
            400: "Invalid request. Please check your input.",
            401: "Please log in to continue.",
            403: "You don't have permission to perform this action.",
            404: "The requested resource was not found.",
            422: "Invalid data provided.",
            429: "Too many requests. Please wait a moment and try again.",
            500: "Server error. Please try again later.",
            502: "Service temporarily unavailable. Please try again.",
            503: "Service temporarily unavailable. Please try again."
        };

        return NextResponse.json({
            message: data?.detail || errorMap[status] || "Something went wrong. Please try again.",
            code: "API_ERROR"
        }, { status: Math.min(status, 500) });

    } catch (error) {
        console.error('Get school stats error:', error);
        return NextResponse.json({
            message: "Service temporarily unavailable. Please try again.",
            code: "SERVICE_ERROR"
        }, { status: 503 });
    }
}
