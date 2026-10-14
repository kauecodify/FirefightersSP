'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiRefreshCw, FiFilter, FiMap, FiList, FiAlertTriangle } from 'react-icons/fi'
import { solicitacaoApi } from '@/lib/api'
import { Solicitacao, SolicitacaoMapData } from '@/types'
import MapComponent from '@/components/MapComponent'
import Link from 'next/link'

const AdminSolicitacaoMapPage: React.FC = () => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showList, setShowList] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<'todas' | 'abertas' | 'em-atendimento' | 'finalizadas'>('todas')

  useEffect(() => {
    fetchSolicitacoes()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSolicitacoes, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchSolicitacoes = async () => {
    try {
      setIsLoading(true)
      const response = await solicitacaoApi.getParaMapa()
      setSolicitacoes(response.data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar solicitações')
      toast.error('Erro ao carregar solicitações')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    await fetchSolicitacoes()
    toast.success('Dados atualizados')
  }

  const handleSolicitacaoClick = (solicitacao: SolicitacaoMapData) => {
    toast.info(`Solicitação: ${solicitacao.protocolo} - ${solicitacao.titulo}`)
  }

  const filteredSolicitacoes = solicitacoes.filter(solicitacao => {
    switch (selectedFilter) {
      case 'abertas':
        return solicitacao.status === 'Aberta'
      case 'em-atendimento':
        return solicitacao.status === 'Em Atendimento'
      case 'finalizadas':
        return solicitacao.status === 'Finalizada'
      default:
        return true
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Mapa de Solicitações</h1>
          <p className="text-gray-600">Visualize a localização de todas as solicitações em tempo real</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <FiRefreshCw className={`text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowList(!showList)}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {showList ? <FiMap /> : <FiList />}
          </button>
          <Link
            href="/admin/solicitacoes"
            className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition"
          >
            Voltar para Lista
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-600">Filtros:</span>
          <button
            onClick={() => setSelectedFilter('todas')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedFilter === 'todas' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Todas
          </button>
          <button
            onClick={() => setSelectedFilter('abertas')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedFilter === 'abertas' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Abertas
          </button>
          <button
            onClick={() => setSelectedFilter('em-atendimento')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedFilter === 'em-atendimento' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Em Atendimento
          </button>
          <button
            onClick={() => setSelectedFilter('finalizadas')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedFilter === 'finalizadas' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Finalizadas
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Map */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <MapComponent
          solicitacoes={filteredSolicitacoes.map(s => ({
            id: s.id,
            protocolo: s.protocolo,
            tipo: s.tipo,
            status: s.status,
            prioridade: s.prioridade,
            latitude: s.latitude || -23.5505,
            longitude: s.longitude || -46.6333,
            endereco: s.endereco,
            titulo: s.titulo
          }))}
          height="600px"
          onSolicitacaoClick={handleSolicitacaoClick}
        />
      </div>

      {/* List View */}
      {showList && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Lista de Solicitações ({filteredSolicitacoes.length})</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Protocolo</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Tipo</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Prioridade</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Endereço</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Localização</th>
                </tr>
              </thead>
              <tbody>
                {filteredSolicitacoes.map((solicitacao) => (
                  <tr key={solicitacao.id} className="border-b">
                    <td className="py-2 px-3">{solicitacao.protocolo}</td>
                    <td className="py-2 px-3">{solicitacao.tipo}</td>
                    <td className="py-2 px-3">
                      <span className={`badge badge-${solicitacao.status.toLowerCase().replace(' ', '-')}`}>
                        {solicitacao.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`badge badge-${solicitacao.prioridade.toLowerCase()}`}>
                        {solicitacao.prioridade}
                      </span>
                    </td>
                    <td className="py-2 px-3">{solicitacao.endereco || '-'}</td>
                    <td className="py-2 px-3">
                      {solicitacao.latitude && solicitacao.longitude ? (
                        `${solicitacao.latitude.toFixed(4)}, ${solicitacao.longitude.toFixed(4)}`
                      ) : '-'} 
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-1">Total de Solicitações</h3>
          <p className="text-3xl font-bold text-gray-800">{solicitacoes.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-1">Abertas</h3>
          <p className="text-3xl font-bold text-red-500">{solicitacoes.filter(s => s.status === 'Aberta').length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-1">Em Atendimento</h3>
          <p className="text-3xl font-bold text-blue-500">{solicitacoes.filter(s => s.status === 'Em Atendimento').length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-1">Finalizadas</h3>
          <p className="text-3xl font-bold text-green-500">{solicitacoes.filter(s => s.status === 'Finalizada').length}</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <p className="text-blue-700 text-sm">
          <strong>Dica:</strong> Clique nos marcadores no mapa para ver mais detalhes sobre as solicitações.
        </p>
      </div>
    </div>
  )
}

export default AdminSolicitacaoMapPage
