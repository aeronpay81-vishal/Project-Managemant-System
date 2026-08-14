import axios from 'axios'

// API Base URL - use Vite env or proxy to /api
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// ==================== Authentication API ====================

export const authAPI = {
  register: async (username, email, password, full_name) => {
    try {
      const response = await apiClient.post('/auth/signup', {
        username,
        email,
        password,
        full_name,
      })
      const data = response.data.data || response.data

      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      return response.data
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Signup failed'
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      })
      const data = response.data.data || response.data

      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      return response.data
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Login failed'
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

export default apiClient;
