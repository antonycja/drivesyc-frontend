import { cookies } from "next/headers";

export async function getToken() {
    // API requests    
    
    const cookieStore = await cookies()
    const myAuthToken = cookieStore.get('auth-token')
    return myAuthToken?.value
}

export async function getRefreshToken() {
    // API requests
    const cookieStore = await cookies()
    const myAuthToken = cookieStore.get('auth-refresh-token')
    return myAuthToken?.value
}

export async function setToken(authToken, rememberMe = false) {
    // Login
    const cookieStore = await cookies()
    return cookieStore.set({
        name: 'auth-token',
        value: authToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 : process.env.COOKIES_EXP, // 30 days or 1 day
    });
}

export async function deleteTokens() {
    // Logout

    const cookieStore = await cookies()

    cookieStore.delete('auth-refresh-token')
    cookieStore.delete('auth-token')

    return

}



export async function setRefreshToken(authRefreshToken, rememberMe) {
    // Login
    const cookieStore = await cookies()
    return cookieStore.set({
        name: 'auth-refresh-token',
        value: authRefreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 : process.env.COOKIES_EXP, // 30 days or 1 day
    });
}