'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import Sidebar from './Sidebar'
import Header from './Header'
import { ToastContainer } from 'react-toastify'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Check authentication on route change
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated()
      const isAuthPage = pathname.startsWith('/auth')
      
      if (!isAuth && !isAuthPage) {
        router.push('/auth/login')
      }
    }

    checkAuth()
  }, [pathname, router])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Close sidebar on mobile when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      }
    }

    handleRouteChange()
  }, [pathname])

  // Hide sidebar on auth pages
  const isAuthPage = pathname.startsWith('/auth')
  if (isAuthPage) {
    return (
      <>
        {children}
        <ToastContainer position="top-right" autoClose={3000} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        
        <div className="flex-1 flex flex-col min-h-screen">
          <Header onToggleSidebar={toggleSidebar} />
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default Layout
