'use client'

import { toast } from 'react-toastify'

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem('token')
  return !!token
}

// Get current user from localStorage
export const getCurrentUser = (): any => {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

// Check if user has specific role
export const hasRole = (role: string): boolean => {
  const user = getCurrentUser()
  if (!user) return false
  return user.roles?.includes(role) || false
}

// Check if user is admin
export const isAdmin = (): boolean => hasRole('Admin')

// Check if user is firefighter
export const isFirefighter = (): boolean => hasRole('Firefighter')

// Get auth token
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

// Store auth data
export const storeAuthData = (token: string, user: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }
}

// Clear auth data
export const clearAuthData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

// Handle Google auth callback
export const handleGoogleAuthCallback = (
  token: string,
  user: { id: string; email: string; nome: string; picture: string }
): void => {
  storeAuthData(token, {
    id: user.id,
    email: user.email,
    nome: user.nome,
    picture: user.picture,
    roles: ['User'], // Default role, will be updated from API
  })
  
  toast.success(`Bem-vindo, ${user.nome}!`)
  
  // Redirect to dashboard
  if (typeof window !== 'undefined') {
    window.location.href = '/user/dashboard'
  }
}

// Format user name
export const formatUserName = (user: any): string => {
  if (!user) return 'Usuário'
  return user.nome || user.email || 'Usuário'
}

// Get user initials for avatar
export const getUserInitials = (user: any): string => {
  if (!user) return 'U'
  const nome = user.nome || user.email || ''
  return nome.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
}
