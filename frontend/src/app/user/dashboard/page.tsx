'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiTruck, FiAlertTriangle, FiCalendar, FiMap, FiClock, FiCheckCircle, FiBarChart2 } from 'react-icons/fi'
import { solicitacaoApi, viaturaApi, plantaoApi } from '@/lib/api'
import { SolicitacaoDashboard, Viatura, Plantao, SolicitacaoResumo } from '@/types'
import MapComponent from '@/components/MapComponent'
import Link from 'next/link'
import { isAdmin, isFirefighter, getCurrentUser } from '@/lib/auth'

const UserDashboard: React.FC = () => {
  const [stats, setStats] = useState<SolicitacaoDashboard | null>(null)
  const [viaturas, setViatura] = useState<Viatura[]>([])
  const [plantoes, setPlantoes] = useState<Plantao[]>([])
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoResumo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const user = getCurrentUser()

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
        
        // Fetch plantoes
        const plantoesResponse = await plantaoApi.getMeus()
        setPlantoes(plantoesResponse.data)
        
        // Fetch solicitacoes
        const solicitacoesResponse = await solicitacaoApi.getResumo()
        setSolicitacoes(solicitacoesResponse.data)
        
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
  const proximoPlantao = plantoes
    .filter(p => p.status === 'Ativo')
    .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())[0]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {isAdmin() ? 'Dashboard Administrativo' : isFirefighter() ? 'Dashboard do Bombeiro' : 'Dashboard do Usuário'}
        </h1>
        <p className="text-primary-100">Bem-vindo de volta, {user?.nome || 'Usuário'}</p>
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
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <FiTruck className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Viaturas Disponíveis</h3>
          <p className="text-3xl font-bold text-gray-800">{viaturasDisponiveis}</p>
        </div>
      </div>

      {/* Firefighter specific info */}
      {isFirefighter() && proximoPlantao && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <FiCalendar className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Próximo Plantão</h3>
          <p className="text-xl font-bold text-gray-800">{proximoPlantao.nome}</p>
          <p className="text-sm text-gray-600">
            {new Date(proximoPlantao.dataInicio).toLocaleDateString('pt-BR')} - 
            {new Date(proximoPlantao.dataFim).toLocaleDateString('pt-BR')}
          </p>
          <Link
            href="/user/plantoes"
            className="inline-block mt-4 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition"
          >
            Ver detalhes
          </Link>
        </div>
      )}

      {/* Map Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Mapa de Viaturas e Ocorrências</h2>
          <Link
            href="/user/mapa"
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

      {/* Recent Solicitations */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Solicitações Recentes</h2>
          <Link
            href={isAdmin() ? "/admin/solicitacoes" : "/user/solicitacoes"}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
          >
            Ver todas
          </Link>
        </div>
        
        {solicitacoes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma solicitação recente</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Protocolo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Prioridade</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Data</th>
                </tr>
              </thead>
              <tbody>
                {solicitacoes.map((solicitacao) => (
                  <tr key={solicitacao.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link
                        href={isAdmin() ? `/admin/solicitacoes/${solicitacao.id}` : `/user/solicitacoes/${solicitacao.id}`}
                        className="text-primary-500 hover:text-primary-600 font-medium"
                      >
                        {solicitacao.protocolo}
                      </Link>
                    </td>
                    <td className="py-3 px-4">{solicitacao.tipo}</td>
                    <td className="py-3 px-4">
                      <span className={`badge badge-${solicitacao.status.toLowerCase().replace(' ', '-')}`}>
                        {solicitacao.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge badge-${solicitacao.prioridade.toLowerCase()}`}>
                        {solicitacao.prioridade}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(solicitacao.dataAbertura).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isAdmin() && (
            <>
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
                href="/admin/users"
                className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition"
              >
                <FiUsers className="text-2xl text-primary-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-700">Gerenciar Usuários</span>
              </Link>
            </>
          )}
          
          {isFirefighter() && (
            <>
              <Link
                href="/user/solicitacoes"
                className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition"
              >
                <FiAlertTriangle className="text-2xl text-primary-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-700">Ver Solicitações</span>
              </Link>
              <Link
                href="/user/plantoes"
                className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition"
              >
                <FiCalendar className="text-2xl text-primary-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-700">Meus Plantões</span>
              </Link>
            </>
          )}
          
          {!isAdmin() && !isFirefighter() && (
            <>
              <Link
                href="/user/nova-solicitacao"
                className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition"
              >
                <FiAlertTriangle className="text-2xl text-primary-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-700">Nova Solicitação</span>
              </Link>
              <Link
                href="/user/solicitacoes"
                className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition"
              >
                <FiBarChart2 className="text-2xl text-primary-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-700">Minhas Solicitações</span>
              </Link>
              <Link
                href="/user/mapa"
                className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition"
              >
                <FiMap className="text-2xl text-primary-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-700">Mapa</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
