import axios, { AxiosInstance, AxiosError } from 'axios'

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/auth/login'
          }
          break
        case 403:
          // Forbidden
          console.error('Acesso negado')
          break
        case 404:
          // Not found
          console.error('Recurso não encontrado')
          break
        case 500:
          // Server error
          console.error('Erro no servidor')
          break
        default:
          console.error('Erro desconhecido')
      }
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post<{ token: string; user: any }>('/auth/login', credentials),
  
  loginWithGoogle: () =>
    api.get('/auth/google'),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
  
  logout: () =>
    api.post('/auth/logout'),
  
  register: (data: any) =>
    api.post('/auth/register', data),
  
  getUsers: () =>
    api.get('/auth/users'),
  
  getUserById: (id: string) =>
    api.get(`/auth/users/${id}`),
  
  updateUser: (id: string, data: any) =>
    api.put(`/auth/users/${id}`, data),
  
  deleteUser: (id: string) =>
    api.delete(`/auth/users/${id}`),
  
  refreshToken: () =>
    api.post('/auth/refresh-token'),
}

// Viatura API
export const viaturaApi = {
  getAll: (params?: { quartel?: string; status?: string; tipo?: string }) =>
    api.get('/viatura', { params }),
  
  getById: (id: number) =>
    api.get(`/viatura/${id}`),
  
  create: (data: any) =>
    api.post('/viatura', data),
  
  update: (id: number, data: any) =>
    api.put(`/viatura/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/viatura/${id}`),
  
  getDisponiveis: (quartel?: string) =>
    api.get('/viatura/disponiveis', { params: { quartel } }),
  
  updateStatus: (id: number, status: string) =>
    api.put(`/viatura/${id}/status`, { status }),
  
  updateLocalizacao: (id: number, latitude: number, longitude: number) =>
    api.put(`/viatura/${id}/localizacao`, { latitude, longitude }),
  
  getParaMapa: () =>
    api.get('/viatura/mapa'),
}

// Plantão API
export const plantaoApi = {
  getAll: (params?: { quartel?: string; status?: string; data?: Date }) =>
    api.get('/plantao', { params }),
  
  getById: (id: number) =>
    api.get(`/plantao/${id}`),
  
  create: (data: any) =>
    api.post('/plantao', data),
  
  update: (id: number, data: any) =>
    api.put(`/plantao/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/plantao/${id}`),
  
  addViatura: (plantaoId: number, viaturaId: number) =>
    api.post(`/plantao/${plantaoId}/viatura/${viaturaId}`),
  
  removeViatura: (plantaoId: number, viaturaId: number) =>
    api.delete(`/plantao/${plantaoId}/viatura/${viaturaId}`),
  
  addBombeiro: (plantaoId: number, userId: string, funcao: string) =>
    api.post(`/plantao/${plantaoId}/bombeiro/${userId}`, { funcao }),
  
  removeBombeiro: (plantaoId: number, userId: string) =>
    api.delete(`/plantao/${plantaoId}/bombeiro/${userId}`),
  
  getAtivos: () =>
    api.get('/plantao/ativos'),
  
  getMeus: () =>
    api.get('/plantao/meus'),
}

// Solicitação API
export const solicitacaoApi = {
  getAll: (params?: { status?: string; prioridade?: string; tipo?: string; quartel?: string }) =>
    api.get('/solicitacao', { params }),
  
  getById: (id: number) =>
    api.get(`/solicitacao/${id}`),
  
  getByProtocolo: (protocolo: string) =>
    api.get(`/solicitacao/protocolo/${protocolo}`),
  
  create: (data: any) =>
    api.post('/solicitacao', data),
  
  update: (id: number, data: any) =>
    api.put(`/solicitacao/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/solicitacao/${id}`),
  
  assignViatura: (solicitacaoId: number, viaturaId: number) =>
    api.post(`/solicitacao/${solicitacaoId}/viatura/${viaturaId}`),
  
  updateViaturaStatus: (solicitacaoId: number, viaturaId: number, status: string) =>
    api.put(`/solicitacao/${solicitacaoId}/viatura/${viaturaId}/status`, { status }),
  
  removeViatura: (solicitacaoId: number, viaturaId: number) =>
    api.delete(`/solicitacao/${solicitacaoId}/viatura/${viaturaId}`),
  
  getMinhas: () =>
    api.get('/solicitacao/minhas'),
  
  getEmAtendimento: (quartel?: string) =>
    api.get('/solicitacao/em-atendimento', { params: { quartel } }),
  
  getParaMapa: () =>
    api.get('/solicitacao/mapa'),
  
  getDashboard: () =>
    api.get('/solicitacao/dashboard'),
  
  getResumo: () =>
    api.get('/solicitacao/resumo'),
}

// Sensor API
export const sensorApi = {
  getAll: (params?: { viaturaId?: number; tipo?: string }) =>
    api.get('/sensor', { params }),
  
  getById: (id: number) =>
    api.get(`/sensor/${id}`),
  
  create: (data: any) =>
    api.post('/sensor', data),
  
  update: (id: number, data: any) =>
    api.put(`/sensor/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/sensor/${id}`),
  
  getLeituras: (sensorId: number, dataInicio?: Date, dataFim?: Date) =>
    api.get(`/sensor/leituras/${sensorId}`, { params: { dataInicio, dataFim } }),
  
  createLeitura: (data: any) =>
    api.post('/sensor/leituras', data),
  
  getLatest: () =>
    api.get('/sensor/latest'),
  
  simulate: (viaturaId: number, latitude: number, longitude: number) =>
    api.post(`/sensor/simulate/${viaturaId}`, { latitude, longitude }),
  
  getViaturaGPS: (viaturaId: number) =>
    api.get(`/sensor/viatura/${viaturaId}/gps`),
}

export default api
