'use client'

import React from 'react'
import { ToastContainer } from 'react-toastify'

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default AuthLayout
