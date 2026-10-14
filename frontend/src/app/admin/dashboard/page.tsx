'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiTruck, FiAlertTriangle, FiUsers, FiCalendar, FiBarChart2, FiMap, FiClock, FiCheckCircle } from 'react-icons/fi'
import { solicitacaoApi, viaturaApi, authApi } from '@/lib/api'
import { SolicitacaoDashboard, Viatura } from '@/types'
import MapComponent from '@/components/MapComponent'
import Link from 'next/link'

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SolicitacaoDashboard | null>(null)
  const [viaturas, setViatura] = useState<Viatura[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch dashboard stats
        const statsResponse = await solicitacaoApi.getDashboard()
        setStats(statsResponse.data)
        
        // Fetch viaturas
        const viaturasResponse = await viaturaApi.getAll()
        setViatura(viaturasResponse.data)
        
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados')
        toast.error('Erro ao carregar dados do dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  const viaturasDisponiveis = viaturas.filter(v => v.status === 'Disponível').length
  const viaturasEmAtendimento = viaturas.filter(v => v.status === 'Em Atendimento').length
  const viaturasEmManutencao = viaturas.filter(v => v.status === 'Manutenção').length

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Dashboard Administrativo</h1>
        <p className="text-primary-100">Bem-vindo ao sistema de gestão do Corpo de Bombeiros</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <FiAlertTriangle className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Solicitações Abertas</h3>
          <p className="text-3xl font-bold text-gray-800">{stats?.totalAbertas || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <FiClock className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Em Atendimento</h3>
          <p className="text-3xl font-bold text-gray-800">{stats?.totalEmAtendimento || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Finalizadas</h3>
          <p className="text-3xl font-bold text-gray-800">{stats?.totalFinalizadas || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <FiAlertTriangle className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Emergências</h3>
          <p className="text-3xl font-bold text-gray-800">{stats?.totalEmergencia || 0}</p>
        </div>
      </div>

      {/* Viatura Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <FiTruck className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Viaturas Disponíveis</h3>
          <p className="text-3xl font-bold text-gray-800">{viaturasDisponiveis}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <FiTruck className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Em Atendimento</h3>
          <p className="text-3xl font-bold text-gray-800">{viaturasEmAtendimento}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <FiTruck className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Em Manutenção</h3>
          <p className="text-3xl font-bold text-gray-800">{viaturasEmManutencao}</p>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Mapa de Viaturas e Ocorrências</h2>
          <Link
            href="/admin/mapa"
            className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition"
          >
            Ver Mapa Completo
          </Link>
        </div>
        <MapComponent
          viaturas={viaturas.map(v => ({
            id: v.id,
            identificacao: v.identificacao,
            tipo: v.tipo,
            status: v.status,
            latitude: v.latitude || -23.5505,
            longitude: v.longitude || -46.6333,
            quartel: v.quartelBase,
            placa: v.placa
          }))}
          height="400px"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/viaturas"
            className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition"
          >
            <FiTruck className="text-2xl text-primary-500 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Gerenciar Viaturas</span>
          </Link>
          <Link
            href="/admin/plantoes"
            className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition"
          >
            <FiCalendar className="text-2xl text-primary-500 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Gerenciar Plantões</span>
          </Link>
          <Link
            href="/admin/solicitacoes"
            className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition"
          >
            <FiAlertTriangle className="text-2xl text-primary-500 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Ver Solicitações</span>
          </Link>
          <Link
            href="/admin/users"
            className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition"
          >
            <FiUsers className="text-2xl text-primary-500 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Gerenciar Usuários</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
