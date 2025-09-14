import { NextResponse } from 'next/server'
import { getToken } from '@/lib/auth'
export const runtime = 'nodejs'

export async function middleware(request) {
    const { pathname } = request.nextUrl

    // Only apply middleware to /dashboard route (not sub-routes)
    if (pathname !== '/dashboard') {
        return NextResponse.next()
    }

    try {
        // Get the access token from cookies
        const token = await getToken()

        if (!token) {
            console.log('Redirecting to login - no token')
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        // Decode JWT manually (without verification for middleware)
        const [header, payload, signature] = token.split('.')

        if (!payload) {
            throw new Error('Invalid token format')
        }

        // Decode the payload
        const decodedPayload = JSON.parse(
            Buffer.from(payload, 'base64url').toString('utf8')
        )

        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000)
        if (decodedPayload.exp && decodedPayload.exp < currentTime) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        const userRole = decodedPayload.user?.user_role

        if (!userRole) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        // Define role-based routes (same as in login route)
        const ROLE_ROUTES = new Map([
            ['owner', '/dashboard/owner'],
            ['admin', '/dashboard/admin'],
            ['learner', '/dashboard/learner'],
            ['instructor', '/dashboard/instructor'],
        ])

        // Get the appropriate route for the user's role
        const redirectRoute = ROLE_ROUTES.get(userRole) || '/dashboard/learner'

        // Redirect to the role-specific dashboard
        return NextResponse.redirect(new URL(redirectRoute, request.url))

    } catch (error) {
        // Redirect to login if token is invalid or any other error occurs
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }
}

export const config = {
    matcher: '/dashboard'
}