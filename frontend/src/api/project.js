import apiClient from './admin.js'

// ==================== Projects API ====================
export const projectsAPI = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/projects')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getById: async (projectId) => {
    try {
      const response = await apiClient.get(`/projects/${projectId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  create: async (projectData) => {
    try {
      const response = await apiClient.post('/projects', projectData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  update: async (projectId, projectData) => {
    try {
      const response = await apiClient.put(`/projects/${projectId}`, projectData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  delete: async (projectId) => {
    try {
      const response = await apiClient.delete(`/projects/${projectId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

// ==================== Stats API ====================
export const statsAPI = {
  getStats: async () => {
    try {
      const response = await apiClient.get('/stats')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

// ==================== Health Check ====================
export const healthAPI = {
  check: async () => {
    try {
      const response = await apiClient.get('/health')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default apiClient;