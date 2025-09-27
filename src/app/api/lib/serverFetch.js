// lib/serverApi.js
import { getToken } from '@/lib/auth';

export async function serverFetch(url, options = {}) {
    const token = await getToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token && options.requireAuth !== false) {
        headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    const data = response.ok ? await response.json() : await response.text();
    return { data, status: response.status };
}