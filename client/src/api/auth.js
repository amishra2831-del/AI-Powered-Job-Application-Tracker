import api from './axios.js'

export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser = (data) => api.post('/auth/login', data)
export const logoutUser = () => api.post('/auth/logout')
export const getMe = () => api.get('/auth/me')
export const getGoogleAuthUrl = () =>
  `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`
export const checkEmail = (email) => api.post('/auth/check-email', { email })
export const updateProfile = (data) => api.put('/auth/profile', data)