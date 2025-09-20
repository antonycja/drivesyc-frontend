import { getToken } from '@/lib/auth'


export default class ApiProxy {

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

        const response = await fetch(endpoint, requestOptions);

        return response;

    }



    static async get(endpoint, requireAuth) {

        const headers = await this.getHeaders(requireAuth)

        let requestOptions = {
            method: 'GET',
            headers: headers,
            credentials: 'include',
        }

        const response = await fetch(endpoint, requestOptions);

        return response;

    }
}