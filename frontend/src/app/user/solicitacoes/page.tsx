'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiPlus, FiSearch, FiFilter, FiAlertTriangle, FiClock, FiCheckCircle, FiXCircle, FiMapPin } from 'react-icons/fi'
import { solicitacaoApi } from '@/lib/api'
import { SolicitacaoResumo, SOLICITACAO_STATUS, SOLICITACAO_PRIORIDADE, SOLICITACAO_TIPO } from '@/types'
import Link from 'next/link'
import { isAdmin, isFirefighter, getCurrentUser } from '@/lib/auth'

const UserSolicitacoesPage: React.FC = () => {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoResumo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedPrioridade, setSelectedPrioridade] = useState<string>('')
  const [selectedTipo, setSelectedTipo] = useState<string>('')
  const user = getCurrentUser()

  useEffect(() => {
    fetchSolicitacoes()
  }, [])

  const fetchSolicitacoes = async () => {
    try {
      setIsLoading(true)
      
      let response
      if (isAdmin() || isFirefighter()) {
        response = await solicitacaoApi.getAll({
          status: selectedStatus || undefined,
          prioridade: selectedPrioridade || undefined,
          tipo: selectedTipo || undefined,
        })
      } else {
        response = await solicitacaoApi.getMinhas()
      }
      
      setSolicitacoes(response.data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar solicitações')
      toast.error('Erro ao carregar solicitações')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSolicitacoes()
  }

  const filteredSolicitacoes = solicitacoes.filter(solicitacao => {
    const matchesSearch = solicitacao.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.tipo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !selectedStatus || solicitacao.status === selectedStatus
    const matchesPrioridade = !selectedPrioridade || solicitacao.prioridade === selectedPrioridade
    const matchesTipo = !selectedTipo || solicitacao.tipo === selectedTipo
    
    return matchesSearch && matchesStatus && matchesPrioridade && matchesTipo
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {isAdmin() || isFirefighter() ? 'Solicitações' : 'Minhas Solicitações'}
          </h1>
          <p className="text-gray-600">
            {isAdmin() || isFirefighter() 
              ? 'Visualize e gerencie todas as solicitações' 
              : 'Acompanhe o status das suas solicitações'}
          </p>
        </div>
        {(isAdmin() || isFirefighter()) && (
          <Link
            href="/user/nova-solicitacao"
            className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition flex items-center space-x-2"
          >
            <FiPlus />
            <span>Nova Solicitação</span>
          </Link>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por protocolo, título, tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos os Status</option>
              {Object.values(SOLICITACAO_STATUS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={selectedPrioridade}
              onChange={(e) => setSelectedPrioridade(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todas as Prioridades</option>
              {Object.values(SOLICITACAO_PRIORIDADE).map(prioridade => (
                <option key={prioridade} value={prioridade}>{prioridade}</option>
              ))}
            </select>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos os Tipos</option>
              {Object.values(SOLICITACAO_TIPO).map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition flex items-center space-x-2"
          >
            <FiFilter />
            <span>Filtrar</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Solicitation List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Lista de Solicitações ({filteredSolicitacoes.length})
          </h2>
          <Link
            href="/user/mapa"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <FiMapPin />
            <span>Ver no Mapa</span>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredSolicitacoes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma solicitação encontrada</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Protocolo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Título</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Prioridade</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Endereço</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Viaturas</th>
                </tr>
              </thead>
              <tbody>
                {filteredSolicitacoes.map((solicitacao) => (
                  <tr key={solicitacao.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link
                        href={`/user/solicitacoes/${solicitacao.id}`}
                        className="text-primary-500 hover:text-primary-600 font-medium"
                      >
                        {solicitacao.protocolo}
                      </Link>
                    </td>
                    <td className="py-3 px-4">{solicitacao.tipo}</td>
                    <td className="py-3 px-4">{solicitacao.titulo}</td>
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
                    <td className="py-3 px-4">{solicitacao.endereco || '-'}</td>
                    <td className="py-3 px-4">
                      {new Date(solicitacao.dataAbertura).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">{solicitacao.viaturaCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
          <strong>Dica:</strong> Clique no protocolo para ver mais detalhes sobre a solicitação.
        </p>
      </div>
    </div>
  )
}

export default UserSolicitacoesPage
