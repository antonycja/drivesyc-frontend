import { getToken, isTokenExpired } from '@/lib/auth'
import { serverFetch } from '@/app/api/lib/serverFetch'

export default class ApiProxy {

    static async handleFetch(endpoint, requestOptions, retryOnAuth = true) {
        let data = {}
        let status = 500
        try {
            const response = await fetch(endpoint, requestOptions);

            // Handle 401 with token refresh attempt
            if (response.status === 401 && retryOnAuth && requestOptions.headers?.Authorization) {
                console.log('Got 401, attempting token refresh...');

                try {
                    const refreshSuccess = await this.refreshToken();
                    if (refreshSuccess) {
                        // Update authorization header with new token
                        const newToken = await getToken();
                        if (newToken) {
                            requestOptions.headers.Authorization = `Bearer ${newToken}`;

                            // Retry the original request
                            console.log('Retrying request with new token...');
                            return await this.handleFetch(endpoint, requestOptions, false);
                        }
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                }

                // If refresh failed, handle auth failure
                this.handleAuthFailure();
            }

            data = await response.json()
            status = response.status
        } catch (error) {
            if (error.name === 'SyntaxError') {
                try {
                    const response = await fetch(endpoint, requestOptions);
                    data = { message: await response.text() };
                    status = response.status;
                } catch (textError) {
                    data = { message: "Unable to parse response", error: error.message };
                    status = 500;
                }
            } else {
                data = { message: "Unable to reach API server", error: error.message };
                status = 500;
            }
        }
        return { data, status }
    }

    static async refreshToken() {
        try {

            const response = await fetch('/api/refresh', {
                method: 'POST',
                credentials: 'include' // This ensures cookies are sent
            });

            if (response.ok) {
                console.log('Token refresh successful');
                return true;
            } else {
                console.log('Token refresh failed with status:', response.status);
                return false;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            return false;
        }
    }

    static handleAuthFailure() {
        // Only redirect on client side
        if (typeof window !== 'undefined') {
            // For client-side navigation, we need to capture the current view state
            const currentPath = window.location.pathname + window.location.search;

            // Check if we have SPA state in localStorage or hash
            let fullPath = currentPath;

            // Try to get current view from various sources
            const currentHash = window.location.hash;
            const storedView = localStorage.getItem('currentView');
            const urlParams = new URLSearchParams(window.location.search);
            const viewParam = urlParams.get('view');

            // Build the full path including SPA state
            if (currentHash) {
                fullPath = currentPath + currentHash;
            } else if (viewParam) {
                fullPath = currentPath; // Already includes view in search params
            } else if (storedView && storedView !== 'dashboard') {
                // Add view as hash for SPA navigation
                fullPath = currentPath + '#' + storedView;
            }

            // Don't redirect if already on login page
            if (!window.location.pathname.includes('/auth/login')) {
                console.log('Auth failed, redirecting to login with return URL:', fullPath);
                const returnUrl = encodeURIComponent(fullPath);
                window.location.href = `/auth/login?returnUrl=${returnUrl}`;
            }
        }
    }

    static async getHeaders(requireAuth) {
        let headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }

        if (requireAuth) {
            let authToken = await getToken();

            // Keep 'await' here since isTokenExpired is now async
            if (authToken && await isTokenExpired(authToken)) {
                console.log('Token expired, attempting refresh before request...');
                const refreshSuccess = await this.refreshToken();
                if (refreshSuccess) {
                    authToken = await getToken();
                    console.log('Got new token after proactive refresh');
                } else {
                    console.log('Token refresh failed, request will likely fail');
                    this.handleAuthFailure();
                    return headers;
                }
            }

            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }
        }

        return headers;
    }

    static async post(endpoint, object, requireAuth = true) {
        const headers = await this.getHeaders(requireAuth);

        let requestOptions = {
            method: 'POST',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify(object),
        };

        return await this.handleFetch(endpoint, requestOptions);
    }

    static async get(endpoint, requireAuth = true) {
        const headers = await this.getHeaders(requireAuth);

        let requestOptions = {
            method: 'GET',
            headers: headers,
            credentials: 'include',
        };

        return await this.handleFetch(endpoint, requestOptions);
    }

    static async put(endpoint, object, requireAuth = true) {
        const headers = await this.getHeaders(requireAuth);

        let requestOptions = {
            method: 'PUT',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify(object),
        };

        return await this.handleFetch(endpoint, requestOptions);
    }

    static async delete(endpoint, requireAuth = true) {
        const headers = await this.getHeaders(requireAuth);

        let requestOptions = {
            method: 'DELETE',
            headers: headers,
            credentials: 'include',
        };

        return await this.handleFetch(endpoint, requestOptions);
    }

    static async patch(endpoint, object, requireAuth = true) {
        const headers = await this.getHeaders(requireAuth);

        let requestOptions = {
            method: 'PATCH',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify(object),
        };

        return await this.handleFetch(endpoint, requestOptions);
    }
}