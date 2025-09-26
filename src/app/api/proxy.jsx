import { getToken } from '@/lib/auth'


export default class ApiProxy {

    static async handleFetch(endpoint, requestOptions) {
        let data = {}
        let status = 500
        try {
            const response = await fetch(endpoint, requestOptions);
            data = await response.json()
            status = response.status
        } catch (error) {
            data = { message: "Unable to reach API server", error: error }
            status = 500
        }
        return { data, status }
    }

    static async getHeaders(requireAuth) {
        let headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }


        const authToken = await getToken()
        if (authToken && requireAuth) {
            headers['Authorization'] = `Bearer ${authToken}`
        }
        return headers
    }

    static async post(endpoint, object, requireAuth) {

        const headers = await this.getHeaders(requireAuth)

        let requestOptions = {
            method: 'POST',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify(object),
        }

        return await this.handleFetch(endpoint, requestOptions);


    }



    static async get(endpoint, requireAuth) {

        const headers = await this.getHeaders(requireAuth)

        let requestOptions = {
            method: 'GET',
            headers: headers,
            credentials: 'include',
        }

        return await this.handleFetch(endpoint, requestOptions);

    }
}