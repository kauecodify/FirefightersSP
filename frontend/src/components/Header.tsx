'use client'

import React from 'react'
import Link from 'next/link'
import { getCurrentUser, formatUserName, getUserInitials } from '@/lib/auth'
import { FiBell, FiUser, FiChevronDown, FiMenu } from 'react-icons/fi'

interface HeaderProps {
  onToggleSidebar: () => void
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [isMobile, setIsMobile] = React.useState(false)
  const [showProfileMenu, setShowProfileMenu] = React.useState(false)
  const user = getCurrentUser()

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu)
  }

  const closeProfileMenu = () => {
    setShowProfileMenu(false)
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            {isMobile && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 mr-4"
              >
                <FiMenu className="text-gray-600" />
              </button>
            )}
            
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FB</span>
                </div>
                <span className="font-semibold text-gray-800 hidden sm:block">FirefightersSP</span>
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100">
              <FiBell className="text-gray-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                3
              </span>
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={handleProfileClick}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              >
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {getUserInitials(user)}
                  </div>
                )}
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-800">{formatUserName(user)}</div>
                  <div className="text-xs text-gray-500">{user?.cargo || 'Usuário'}</div>
                </div>
                <FiChevronDown className="text-gray-400 hidden sm:block" />
              </button>

              {/* Profile menu */}
              {showProfileMenu && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                  onClick={closeProfileMenu}
                >
                  <Link
                    href="/user/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Meu Perfil
                  </Link>
                  <Link
                    href="/user/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Configurações
                  </Link>
                  <div className="border-t my-2" />
                  <Link
                    href="/auth/logout"
                    className="block px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    Sair
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
