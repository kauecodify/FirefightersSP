'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, hasRole } from '@/lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: string[]
  redirectTo?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles = [],
  redirectTo = '/auth/login',
}) => {
  const router = useRouter()

  useEffect(() => {
    const checkAccess = () => {
      const isAuth = isAuthenticated()
      
      if (!isAuth) {
        router.push(redirectTo)
        return
      }
      
      // Check if user has required role
      if (roles.length > 0) {
        const hasRequiredRole = roles.some(role => hasRole(role))
        if (!hasRequiredRole) {
          router.push('/auth/forbidden')
        }
      }
    }

    checkAccess()
  }, [router, roles, redirectTo])

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
