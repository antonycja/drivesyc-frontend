"use server"
import { cookies } from "next/headers";

export async function getToken() {
    const cookieStore = await cookies()
    const myAuthToken = cookieStore.get('auth-token')
    return myAuthToken?.value
}

export async function getRefreshToken() {
    const cookieStore = await cookies()
    const myAuthToken = cookieStore.get('auth-refresh-token')
    return myAuthToken?.value
}

export async function setToken(authToken, rememberMe = false) {
    const cookieStore = await cookies()
    return cookieStore.set({
        name: 'auth-token',
        value: authToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 : process.env.COOKIES_EXP,
    });
}

export async function setRefreshToken(authRefreshToken, rememberMe = false) {
    const cookieStore = await cookies()
    return cookieStore.set({
        name: 'auth-refresh-token',
        value: authRefreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 : (30 * 24 * 60 * 60), // 30 days or 7 days
    });
}

export async function deleteTokens() {
    const cookieStore = await cookies()
    cookieStore.delete('auth-refresh-token')
    cookieStore.delete('auth-token')
    return
}

export async function getTokenInfo(authToken) {
    try {
        if (!authToken) throw new Error("No token provided");

        const tokenParts = authToken.split(".");
        if (tokenParts.length !== 3) throw new Error("Invalid token format");

        const payloadBase64 = tokenParts[1];
        const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(payloadJson);

        return payload.user;
    } catch (error) {
        console.error("Failed to decode token:", error);
        return {
            valid: false,
            error: error.message
        };
    }
}

// New function to check if token is expired or about to expire
export async function isTokenExpired(token) {
    try {
        if (!token) return true;
        
        const tokenParts = token.split(".");
        if (tokenParts.length !== 3) return true;

        const payloadBase64 = tokenParts[1];
        const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(payloadJson);

        const currentTime = Math.floor(Date.now() / 1000);
        const bufferTime = 60; // Refresh 1 minute before expiry
        
        return payload.exp <= (currentTime + bufferTime);
    } catch (error) {
        console.error("Failed to check token expiry:", error);
        return true;
    }
}