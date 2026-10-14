'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isAuthenticated, isAdmin, isFirefighter, clearAuthData } from '@/lib/auth'
import { toast } from 'react-toastify'
import {
  FiHome,
  FiUser,
  FiUsers,
  FiTruck,
  FiCalendar,
  FiAlertTriangle,
  FiBell,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiMap,
  FiBarChart2,
  FiFileText,
  FiShield
} from 'react-icons/fi'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = () => {
    clearAuthData()
    toast.success('Deslogado com sucesso')
    window.location.href = '/auth/login'
  }

  const isAdminUser = isAdmin()
  const isFirefighterUser = isFirefighter()
  const isAuth = isAuthenticated()

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { href: '/admin/users', label: 'Usuários', icon: <FiUsers /> },
    { href: '/admin/viaturas', label: 'Viaturas', icon: <FiTruck /> },
    { href: '/admin/plantoes', label: 'Plantões', icon: <FiCalendar /> },
    { href: '/admin/solicitacoes', label: 'Solicitações', icon: <FiAlertTriangle /> },
    { href: '/admin/sensores', label: 'Sensores', icon: <FiSettings /> },
    { href: '/admin/relatorios', label: 'Relatórios', icon: <FiFileText /> },
  ]

  const firefighterLinks = [
    { href: '/user/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { href: '/user/solicitacoes', label: 'Solicitações', icon: <FiAlertTriangle /> },
    { href: '/user/plantoes', label: 'Meus Plantões', icon: <FiCalendar /> },
    { href: '/user/viaturas', label: 'Viaturas', icon: <FiTruck /> },
    { href: '/user/mapa', label: 'Mapa', icon: <FiMap /> },
  ]

  const userLinks = [
    { href: '/user/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { href: '/user/solicitacoes', label: 'Minhas Solicitações', icon: <FiAlertTriangle /> },
    { href: '/user/nova-solicitacao', label: 'Nova Solicitação', icon: <FiAlertTriangle /> },
    { href: '/user/mapa', label: 'Mapa', icon: <FiMap /> },
  ]

  const getLinks = () => {
    if (isAdminUser) return adminLinks
    if (isFirefighterUser) return firefighterLinks
    if (isAuth) return userLinks
    return []
  }

  const links = getLinks()

  const isLinkActive = (href: string) => {
    if (pathname === href) return true
    if (pathname.startsWith(href + '/')) return true
    return false
  }

  if (!isAuth) {
    return null
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isMobile ? 'w-72' : 'w-64'}`}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <FiShield className="text-white text-xl" />
            </div>
            <span className="font-bold text-lg text-gray-800">FirefightersSP</span>
          </div>
          {isMobile && (
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <FiX className="text-gray-600" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg sidebar-link ${
                    isLinkActive(link.href) ? 'active' : ''
                  }`}
                  onClick={() => isMobile && onToggle()}
                >
                  <span className="text-gray-600">{link.icon}</span>
                  <span className="text-gray-700">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div className="my-4 border-t" />

          {/* Bottom links */}
          <ul className="space-y-2">
            <li>
              <Link
                href="/user/profile"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg sidebar-link ${
                  pathname === '/user/profile' ? 'active' : ''
                }`}
                onClick={() => isMobile && onToggle()}
              >
                <FiUser className="text-gray-600" />
                <span className="text-gray-700">Perfil</span>
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg sidebar-link w-full text-left hover:bg-red-50"
              >
                <FiLogOut className="text-red-500" />
                <span className="text-red-500">Sair</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Toggle button (for mobile) */}
      {isMobile && !isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-4 top-4 z-40 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50"
        >
          <FiMenu className="text-gray-600" />
        </button>
      )}
    </>
  )
}

export default Sidebar
