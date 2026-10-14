'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiFilter, FiAlertTriangle, FiClock, FiCheckCircle, FiXCircle, FiMapPin } from 'react-icons/fi'
import { solicitacaoApi, viaturaApi } from '@/lib/api'
import { Solicitacao, SolicitacaoResumo, SOLICITACAO_STATUS, SOLICITACAO_PRIORIDADE, SOLICITACAO_TIPO } from '@/types'
import Link from 'next/link'

const AdminSolicitacaoPage: React.FC = () => {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoResumo[]>([])
  const [viaturasDisponiveis, setViaturaDisponiveis] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedPrioridade, setSelectedPrioridade] = useState<string>('')
  const [selectedTipo, setSelectedTipo] = useState<string>('')
  const [showAssignViaturaModal, setShowAssignViaturaModal] = useState(false)
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoResumo | null>(null)
  const [selectedViaturaId, setSelectedViaturaId] = useState<number>()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      const [solicitacoesResponse, viaturasResponse] = await Promise.all([
        solicitacaoApi.getAll({
          status: selectedStatus || undefined,
          prioridade: selectedPrioridade || undefined,
          tipo: selectedTipo || undefined,
        }),
        viaturaApi.getDisponiveis(),
      ])
      
      setSolicitacoes(solicitacoesResponse.data)
      setViaturaDisponiveis(viaturasResponse.data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar solicitações')
      toast.error('Erro ao carregar solicitações')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchData()
  }

  const handleAssignViatura = async () => {
    if (!selectedSolicitacao || !selectedViaturaId) return
    
    try {
      setIsLoading(true)
      await solicitacaoApi.assignViatura(selectedSolicitacao.id, selectedViaturaId)
      toast.success('Viatura designada com sucesso')
      setShowAssignViaturaModal(false)
      setSelectedViaturaId(undefined)
      fetchData()
    } catch (err: any) {
      toast.error('Erro ao designar viatura')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      setIsLoading(true)
      await solicitacaoApi.update(id, { status: newStatus })
      toast.success('Status atualizado com sucesso')
      fetchData()
    } catch (err: any) {
      toast.error('Erro ao atualizar status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta solicitação?')) return
    
    try {
      setIsLoading(true)
      await solicitacaoApi.delete(id)
      toast.success('Solicitação excluída com sucesso')
      fetchData()
    } catch (err: any) {
      toast.error('Erro ao excluir solicitação')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignClick = (solicitacao: SolicitacaoResumo) => {
    setSelectedSolicitacao(solicitacao)
    setShowAssignViaturaModal(true)
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gerenciamento de Solicitações</h1>
          <p className="text-gray-600">Visualize, gerencie e acompanhe todas as solicitações</p>
        </div>
        <Link
          href="/admin/solicitacoes/nova"
          className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition flex items-center space-x-2"
        >
          <FiPlus />
          <span>Nova Solicitação</span>
        </Link>
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
          <h2 className="text-xl font-bold text-gray-800">Lista de Solicitações ({filteredSolicitacoes.length})</h2>
          <Link
            href="/admin/solicitacoes/mapa"
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
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSolicitacoes.map((solicitacao) => (
                  <tr key={solicitacao.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/solicitacoes/${solicitacao.id}`}
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
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {solicitacao.status === 'Aberta' && (
                          <button
                            onClick={() => handleAssignClick(solicitacao)}
                            className="p-2 text-blue-500 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                            title="Designar Viatura"
                          >
                            <FiTruck />
                          </button>
                        )}
                        <select
                          onChange={(e) => handleUpdateStatus(solicitacao.id, e.target.value)}
                          value={solicitacao.status}
                          className="text-sm p-1 border border-gray-300 rounded"
                        >
                          {Object.values(SOLICITACAO_STATUS).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleDelete(solicitacao.id)}
                          className="p-2 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Viatura Modal */}
      {showAssignViaturaModal && selectedSolicitacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Designar Viatura</h2>
              <button
                onClick={() => setShowAssignViaturaModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Solicitação: <strong>{selectedSolicitacao.protocolo} - {selectedSolicitacao.titulo}</strong>
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Viatura Disponível</label>
                <select
                  value={selectedViaturaId || ''}
                  onChange={(e) => setSelectedViaturaId(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Selecione uma viatura</option>
                  {viaturasDisponiveis.map(viatura => (
                    <option key={viatura.id} value={viatura.id}>
                      {viatura.identificacao} - {viatura.tipo} ({viatura.status})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignViaturaModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAssignViatura}
                  disabled={isLoading || !selectedViaturaId}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
                >
                  {isLoading ? 'Designando...' : 'Designar Viatura'}
                </button>
              </div>
            </div>
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
    </div>
  )
}

export default AdminSolicitacaoPage
