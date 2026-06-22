import axios, { AxiosInstance } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

class AuthService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      withCredentials: true, // sends HttpOnly cookies automatically on every request
    })

    // Auto-refresh on 401
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            // refreshToken HttpOnly cookie is sent automatically by browser
            await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
            return this.api(originalRequest)
          } catch {
            if (typeof window !== 'undefined') window.location.href = '/login'
          }
        }

        return Promise.reject(error)
      }
    )
  }

  async login(email: string, password: string) {
    // Backend sets HttpOnly cookies in Set-Cookie header
    const response = await this.api.post('/auth/login', { email, password })
    return response.data // only contains { admin: { id, email, name, role } }
  }

  async logout() {
    // Backend clears HttpOnly cookies
    await this.api.post('/auth/logout').catch(() => {})
  }

  async getProfile() {
    const response = await this.api.get('/auth/profile')
    return response.data
  }

  getApi() {
    return this.api
  }
}

export const authService = new AuthService()
