'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiRefreshCw, FiFilter, FiMap, FiList, FiTruck, FiAlertTriangle } from 'react-icons/fi'
import { viaturaApi, solicitacaoApi } from '@/lib/api'
import { Viatura, Solicitacao, ViaturaMapData, SolicitacaoMapData } from '@/types'
import MapComponent from '@/components/MapComponent'
import Link from 'next/link'
import { isAdmin, isFirefighter } from '@/lib/auth'

const UserMapPage: React.FC = () => {
  const [viaturas, setViatura] = useState<Viatura[]>([])
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showList, setShowList] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<'todas' | 'viaturas' | 'solicitacoes'>('todas')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch viaturas
        const viaturasResponse = await viaturaApi.getParaMapa()
        setViatura(viaturasResponse.data)
        
        // Fetch solicitacoes
        const solicitacoesResponse = await solicitacaoApi.getParaMapa()
        setSolicitacoes(solicitacoesResponse.data)
        
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados')
        toast.error('Erro ao carregar dados do mapa')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    try {
      setIsLoading(true)
      const viaturasResponse = await viaturaApi.getParaMapa()
      setViatura(viaturasResponse.data)
      const solicitacoesResponse = await solicitacaoApi.getParaMapa()
      setSolicitacoes(solicitacoesResponse.data)
      toast.success('Dados atualizados')
    } catch (err: any) {
      toast.error('Erro ao atualizar dados')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViaturaClick = (viatura: ViaturaMapData) => {
    toast.info(`Viatura: ${viatura.identificacao} - ${viatura.tipo}`)
  }

  const handleSolicitacaoClick = (solicitacao: SolicitacaoMapData) => {
    toast.info(`Solicitação: ${solicitacao.protocolo} - ${solicitacao.titulo}`)
  }

  const filteredViatura = selectedFilter === 'viaturas' ? viaturas : []
  const filteredSolicitacoes = selectedFilter === 'solicitacoes' ? solicitacoes : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Mapa de Viaturas e Ocorrências</h1>
          <p className="text-gray-600">Visualize em tempo real a localização de viaturas e solicitações</p>
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
            onClick={() => setSelectedFilter('viaturas')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedFilter === 'viaturas' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <FiTruck className="inline mr-1" /> Viaturas
          </button>
          <button
            onClick={() => setSelectedFilter('solicitacoes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedFilter === 'solicitacoes' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <FiAlertTriangle className="inline mr-1" /> Solicitações
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
          viaturas={selectedFilter !== 'solicitacoes' ? viaturas.map(v => ({
            id: v.id,
            identificacao: v.identificacao,
            tipo: v.tipo,
            status: v.status,
            latitude: v.latitude,
            longitude: v.longitude,
            quartel: v.quartel,
            placa: v.placa
          })) : []}
          solicitacoes={selectedFilter !== 'viaturas' ? solicitacoes.map(s => ({
            id: s.id,
            protocolo: s.protocolo,
            tipo: s.tipo,
            status: s.status,
            prioridade: s.prioridade,
            latitude: s.latitude,
            longitude: s.longitude,
            endereco: s.endereco,
            titulo: s.titulo
          })) : []}
          height="600px"
          onViaturaClick={handleViaturaClick}
          onSolicitacaoClick={handleSolicitacaoClick}
        />
      </div>

      {/* List View */}
      {showList && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Lista de Itens no Mapa</h2>
          
          {/* Viaturas List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Viaturas ({viaturas.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">ID</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Tipo</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Localização</th>
                  </tr>
                </thead>
                <tbody>
                  {viaturas.map((viatura) => (
                    <tr key={viatura.id} className="border-b">
                      <td className="py-2 px-3">{viatura.identificacao}</td>
                      <td className="py-2 px-3">{viatura.tipo}</td>
                      <td className="py-2 px-3">
                        <span className={`badge badge-${viatura.status.toLowerCase().replace(' ', '-')}`}>
                          {viatura.status}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {viatura.latitude?.toFixed(4)}, {viatura.longitude?.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Solicitações List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Solicitações ({solicitacoes.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Protocolo</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Tipo</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Prioridade</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Localização</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitacoes.map((solicitacao) => (
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
                      <td className="py-2 px-3">
                        {solicitacao.latitude?.toFixed(4)}, {solicitacao.longitude?.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <p className="text-blue-700 text-sm">
          <strong>Dica:</strong> Clique nos marcadores no mapa para ver mais detalhes sobre viaturas e solicitações.
        </p>
      </div>
    </div>
  )
}

export default UserMapPage
