'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiFilter, FiCalendar, FiUsers, FiTruck, FiClock } from 'react-icons/fi'
import { plantaoApi, viaturaApi, authApi } from '@/lib/api'
import { Plantao, Viatura, User } from '@/types'
import Link from 'next/link'

const AdminPlantaoPage: React.FC = () => {
  const [plantoes, setPlantoes] = useState<Plantao[]>([])
  const [viaturas, setViatura] = useState<Viatura[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedQuartel, setSelectedQuartel] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddViaturaModal, setShowAddViaturaModal] = useState(false)
  const [showAddBombeiroModal, setShowAddBombeiroModal] = useState(false)
  const [selectedPlantao, setSelectedPlantao] = useState<Plantao | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    status: 'Ativo',
    quartel: '',
    maxViatura: 10,
    maxBombeiros: 20,
  })

  const [viaturaId, setViaturaId] = useState<number>()
  const [bombeiroId, setBombeiroId] = useState<string>('')
  const [bombeiroFuncao, setBombeiroFuncao] = useState<string>('Bombeiro')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      const [plantoesResponse, viaturasResponse, usersResponse] = await Promise.all([
        plantaoApi.getAll({
          status: selectedStatus || undefined,
          quartel: selectedQuartel || undefined,
        }),
        viaturaApi.getAll(),
        authApi.getUsers(),
      ])
      
      setPlantoes(plantoesResponse.data)
      setViatura(viaturasResponse.data)
      setUsers(usersResponse.data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados')
      toast.error('Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchData()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      await plantaoApi.create(formData)
      toast.success('Plantão criado com sucesso')
      setShowCreateModal(false)
      setFormData({
        nome: '',
        descricao: '',
        dataInicio: '',
        dataFim: '',
        status: 'Ativo',
        quartel: '',
        maxViatura: 10,
        maxBombeiros: 20,
      })
      fetchData()
    } catch (err: any) {
      toast.error('Erro ao criar plantão')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlantao) return
    
    try {
      setIsLoading(true)
      await plantaoApi.update(selectedPlantao.id, formData)
      toast.success('Plantão atualizado com sucesso')
      setShowEditModal(false)
      fetchData()
    } catch (err: any) {
      toast.error('Erro ao atualizar plantão')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este plantão?')) return
    
    try {
      setIsLoading(true)
      await plantaoApi.delete(id)
      toast.success('Plantão excluído com sucesso')
      fetchData()
    } catch (err: any) {
      toast.error('Erro ao excluir plantão')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClick = (plantao: Plantao) => {
    setSelectedPlantao(plantao)
    setFormData({
      nome: plantao.nome,
      descricao: plantao.descricao || '',
      dataInicio: new Date(plantao.dataInicio).toISOString().slice(0, 16),
      dataFim: new Date(plantao.dataFim).toISOString().slice(0, 16),
      status: plantao.status,
      quartel: plantao.quartel || '',
      maxViatura: plantao.maxViatura,
      maxBombeiros: plantao.maxBombeiros,
    })
    setShowEditModal(true)
  }

  const handleAddViatura = async () => {
    if (!selectedPlantao || !viaturaId) return
    
    try {
      setIsLoading(true)
      await plantaoApi.addViatura(selectedPlantao.id, viaturaId)
      toast.success('Viatura adicionada ao plantão')
      setShowAddViaturaModal(false)
      setViaturaId(undefined)
      fetchData()
    } catch (err: any) {
      toast.error('Erro ao adicionar viatura ao plantão')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveViatura = async (plantaoId: number, viaturaId: number) => {
    try {
      setIsLoading(true)
      await plantaoApi.removeViatura(plantaoId, viaturaId)
      toast.success('Viatura removida do plantão')
      fetchData()
    } catch (err: any) {
      toast.error('Erro ao remover viatura do plantão')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBombeiro = async () => {
    if (!selectedPlantao || !bombeiroId) return
    
    try {
      setIsLoading(true)
      await plantaoApi.addBombeiro(selectedPlantao.id, bombeiroId, bombeiroFuncao)
      toast.success('Bombeiro adicionado ao plantão')
      setShowAddBombeiroModal(false)
      setBombeiroId('')
      setBombeiroFuncao('Bombeiro')
      fetchData()
    } catch (err: any) {
      toast.error('Erro ao adicionar bombeiro ao plantão')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveBombeiro = async (plantaoId: number, userId: string) => {
    try {
      setIsLoading(true)
      await plantaoApi.removeBombeiro(plantaoId, userId)
      toast.success('Bombeiro removido do plantão')
      fetchData()
    } catch (err: any) {
      toast.error('Erro ao remover bombeiro do plantão')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPlantoes = plantoes.filter(plantao => {
    const matchesSearch = plantao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plantao.quartel?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !selectedStatus || plantao.status === selectedStatus
    const matchesQuartel = !selectedQuartel || plantao.quartel === selectedQuartel
    
    return matchesSearch && matchesStatus && matchesQuartel
  })

  // Get unique quartel values
  const quartelOptions = [...new Set(plantoes.map(p => p.quartel).filter(Boolean))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gerenciamento de Plantões</h1>
          <p className="text-gray-600">Cadastre, edite e gerencie os plantões dos bombeiros</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition flex items-center space-x-2"
        >
          <FiPlus />
          <span>Novo Plantão</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, quartel..."
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
              <option value="Ativo">Ativo</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <select
              value={selectedQuartel}
              onChange={(e) => setSelectedQuartel(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos os Quartéis</option>
              {quartelOptions.map(quartel => (
                <option key={quartel} value={quartel}>{quartel}</option>
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

      {/* Plantão List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Lista de Plantões ({filteredPlantoes.length})</h2>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredPlantoes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum plantão encontrado</p>
        ) : (
          <div className="space-y-4">
            {filteredPlantoes.map((plantao) => (
              <div key={plantao.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                      <FiCalendar className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{plantao.nome}</h3>
                      <p className="text-sm text-gray-600">{plantao.quartel || 'Sem quartel'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`badge badge-${plantao.status.toLowerCase()}`}>
                      {plantao.status}
                    </span>
                    <button
                      onClick={() => handleEditClick(plantao)}
                      className="p-2 text-blue-500 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(plantao.id)}
                      className="p-2 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Período</p>
                    <p className="text-sm">
                      {new Date(plantao.dataInicio).toLocaleDateString('pt-BR')} - 
                      {new Date(plantao.dataFim).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Capacidade</p>
                    <p className="text-sm">
                      {plantao.viaturaCount}/{plantao.maxViatura} Viaturas | 
                      {plantao.bombeiroCount}/{plantao.maxBombeiros} Bombeiros
                    </p>
                  </div>
                </div>
                
                {plantao.descricao && (
                  <p className="text-sm text-gray-600 mb-4">{plantao.descricao}</p>
                )}
                
                {/* Viatura List */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-700">Viaturas ({plantao.viatura.length})</h4>
                    <button
                      onClick={() => {
                        setSelectedPlantao(plantao)
                        setShowAddViaturaModal(true)
                      }}
                      className="text-xs bg-primary-500 text-white px-2 py-1 rounded"
                    >
                      + Adicionar
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {plantao.viatura.map((v) => (
                      <div key={v.viaturaId} className="bg-gray-50 rounded p-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>{v.identificacao} ({v.tipo})</span>
                          <button
                            onClick={() => handleRemoveViatura(plantao.id, v.viaturaId)}
                            className="text-red-500 hover:text-red-600"
                          >
                            ×
                          </button>
                        </div>
                        <span className={`badge badge-${v.status.toLowerCase().replace(' ', '-')} text-xs`}>
                          {v.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Bombeiro List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-700">Bombeiros ({plantao.bombeiros.length})</h4>
                    <button
                      onClick={() => {
                        setSelectedPlantao(plantao)
                        setShowAddBombeiroModal(true)
                      }}
                      className="text-xs bg-primary-500 text-white px-2 py-1 rounded"
                    >
                      + Adicionar
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {plantao.bombeiros.map((b) => (
                      <div key={b.userId} className="bg-gray-50 rounded p-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>{b.nome}</span>
                          <button
                            onClick={() => handleRemoveBombeiro(plantao.id, b.userId)}
                            className="text-red-500 hover:text-red-600"
                          >
                            ×
                          </button>
                        </div>
                        <span className="text-xs text-gray-500">{b.funcao}</span>
                        <span className={`badge badge-${b.status.toLowerCase()} text-xs`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Novo Plantão</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Plantão Diurno - Quartel Central"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição opcional"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
                <input
                  type="datetime-local"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
                <input
                  type="datetime-local"
                  value={formData.dataFim}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quartel</label>
                <input
                  type="text"
                  value={formData.quartel}
                  onChange={(e) => setFormData({ ...formData, quartel: e.target.value })}
                  placeholder="Ex: Quartel Central"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Máx. Viaturas</label>
                <input
                  type="number"
                  value={formData.maxViatura}
                  onChange={(e) => setFormData({ ...formData, maxViatura: parseInt(e.target.value) || 10 })}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Máx. Bombeiros</label>
                <input
                  type="number"
                  value={formData.maxBombeiros}
                  onChange={(e) => setFormData({ ...formData, maxBombeiros: parseInt(e.target.value) || 20 })}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
                >
                  {isLoading ? 'Criando...' : 'Criar Plantão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPlantao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Editar Plantão</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
                <input
                  type="datetime-local"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
                <input
                  type="datetime-local"
                  value={formData.dataFim}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quartel</label>
                <input
                  type="text"
                  value={formData.quartel}
                  onChange={(e) => setFormData({ ...formData, quartel: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Máx. Viaturas</label>
                <input
                  type="number"
                  value={formData.maxViatura}
                  onChange={(e) => setFormData({ ...formData, maxViatura: parseInt(e.target.value) || 10 })}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Máx. Bombeiros</label>
                <input
                  type="number"
                  value={formData.maxBombeiros}
                  onChange={(e) => setFormData({ ...formData, maxBombeiros: parseInt(e.target.value) || 20 })}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
                >
                  {isLoading ? 'Atualizando...' : 'Atualizar Plantão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Viatura Modal */}
      {showAddViaturaModal && selectedPlantao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Adicionar Viatura ao Plantão</h2>
              <button
                onClick={() => setShowAddViaturaModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Plantão: <strong>{selectedPlantao.nome}</strong>
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Viatura</label>
                <select
                  value={viaturaId || ''}
                  onChange={(e) => setViaturaId(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Selecione uma viatura</option>
                  {viaturas
                    .filter(v => !selectedPlantao.viatura.some(pv => pv.viaturaId === v.id))
                    .map(viatura => (
                      <option key={viatura.id} value={viatura.id}>
                        {viatura.identificacao} - {viatura.tipo} ({viatura.status})
                      </option>
                    ))}
                </select>
              </div>
              
              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddViaturaModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddViatura}
                  disabled={isLoading || !viaturaId}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
                >
                  {isLoading ? 'Adicionando...' : 'Adicionar Viatura'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bombeiro Modal */}
      {showAddBombeiroModal && selectedPlantao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Adicionar Bombeiro ao Plantão</h2>
              <button
                onClick={() => setShowAddBombeiroModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Plantão: <strong>{selectedPlantao.nome}</strong>
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bombeiro</label>
                <select
                  value={bombeiroId}
                  onChange={(e) => setBombeiroId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Selecione um bombeiro</option>
                  {users
                    .filter(u => !selectedPlantao.bombeiros.some(pb => pb.userId === u.id))
                    .map(user => (
                      <option key={user.id} value={user.id}>
                        {user.nome} - {user.cargo}
                      </option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Função</label>
                <select
                  value={bombeiroFuncao}
                  onChange={(e) => setBombeiroFuncao(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="Bombeiro">Bombeiro</option>
                  <option value="Motorista">Motorista</option>
                  <option value="Comandante">Comandante</option>
                  <option value="Enfermeiro">Enfermeiro</option>
                </select>
              </div>
              
              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddBombeiroModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddBombeiro}
                  disabled={isLoading || !bombeiroId}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
                >
                  {isLoading ? 'Adicionando...' : 'Adicionar Bombeiro'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPlantaoPage
