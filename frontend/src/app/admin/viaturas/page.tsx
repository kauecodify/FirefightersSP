'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiFilter, FiTruck, FiMapPin, FiAlertCircle } from 'react-icons/fi'
import { viaturaApi } from '@/lib/api'
import { Viatura, VIATURA_STATUS, VIATURA_TIPO } from '@/types'
import Link from 'next/link'

const AdminViaturaPage: React.FC = () => {
  const [viaturas, setViatura] = useState<Viatura[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedTipo, setSelectedTipo] = useState<string>('')
  const [selectedQuartel, setSelectedQuartel] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedViatura, setSelectedViatura] = useState<Viatura | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    identificacao: '',
    tipo: 'Auto Bomba',
    modelo: '',
    placa: '',
    descricao: '',
    status: 'Disponível',
    quartelBase: '',
    capacidade: 1,
    ativa: true,
  })

  useEffect(() => {
    fetchViatura()
  }, [])

  const fetchViatura = async () => {
    try {
      setIsLoading(true)
      const response = await viaturaApi.getAll({
        status: selectedStatus || undefined,
        tipo: selectedTipo || undefined,
        quartel: selectedQuartel || undefined,
      })
      setViatura(response.data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar viaturas')
      toast.error('Erro ao carregar viaturas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchViatura()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      await viaturaApi.create(formData)
      toast.success('Viatura criada com sucesso')
      setShowCreateModal(false)
      setFormData({
        identificacao: '',
        tipo: 'Auto Bomba',
        modelo: '',
        placa: '',
        descricao: '',
        status: 'Disponível',
        quartelBase: '',
        capacidade: 1,
        ativa: true,
      })
      fetchViatura()
    } catch (err: any) {
      toast.error('Erro ao criar viatura')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedViatura) return
    
    try {
      setIsLoading(true)
      await viaturaApi.update(selectedViatura.id, formData)
      toast.success('Viatura atualizada com sucesso')
      setShowEditModal(false)
      fetchViatura()
    } catch (err: any) {
      toast.error('Erro ao atualizar viatura')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta viatura?')) return
    
    try {
      setIsLoading(true)
      await viaturaApi.delete(id)
      toast.success('Viatura excluída com sucesso')
      fetchViatura()
    } catch (err: any) {
      toast.error('Erro ao excluir viatura')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClick = (viatura: Viatura) => {
    setSelectedViatura(viatura)
    setFormData({
      identificacao: viatura.identificacao,
      tipo: viatura.tipo,
      modelo: viatura.modelo,
      placa: viatura.placa,
      descricao: viatura.descricao || '',
      status: viatura.status,
      quartelBase: viatura.quartelBase || '',
      capacidade: viatura.capacidade,
      ativa: viatura.ativa,
    })
    setShowEditModal(true)
  }

  const filteredViatura = viaturas.filter(viatura => {
    const matchesSearch = viatura.identificacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viatura.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viatura.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viatura.placa.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !selectedStatus || viatura.status === selectedStatus
    const matchesTipo = !selectedTipo || viatura.tipo === selectedTipo
    const matchesQuartel = !selectedQuartel || viatura.quartelBase === selectedQuartel
    
    return matchesSearch && matchesStatus && matchesTipo && matchesQuartel
  })

  // Get unique quartel values
  const quartelOptions = [...new Set(viaturas.map(v => v.quartelBase).filter(Boolean))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gerenciamento de Viaturas</h1>
          <p className="text-gray-600">Cadastre, edite e gerencie todas as viaturas do sistema</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition flex items-center space-x-2"
        >
          <FiPlus />
          <span>Nova Viatura</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por identificação, tipo, modelo..."
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
              {Object.values(VIATURA_STATUS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos os Tipos</option>
              {Object.values(VIATURA_TIPO).map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
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

      {/* Viatura List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Lista de Viaturas ({filteredViatura.length})</h2>
          <Link
            href="/admin/viaturas/mapa"
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
        ) : filteredViatura.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma viatura encontrada</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Modelo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Placa</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Quartel</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Localização</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredViatura.map((viatura) => (
                  <tr key={viatura.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{viatura.identificacao}</td>
                    <td className="py-3 px-4">{viatura.tipo}</td>
                    <td className="py-3 px-4">{viatura.modelo}</td>
                    <td className="py-3 px-4">{viatura.placa}</td>
                    <td className="py-3 px-4">
                      <span className={`badge badge-${viatura.status.toLowerCase().replace(' ', '-')}`}>
                        {viatura.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{viatura.quartelBase || '-'}</td>
                    <td className="py-3 px-4">
                      {viatura.latitude && viatura.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${viatura.latitude},${viatura.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-500 hover:text-primary-600 flex items-center space-x-1"
                        >
                          <FiMapPin className="text-sm" />
                          <span>{viatura.latitude.toFixed(4)}, {viatura.longitude.toFixed(4)}</span>
                        </a>
                      ) : '-'} 
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditClick(viatura)}
                          className="p-2 text-blue-500 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(viatura.id)}
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Nova Viatura</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiAlertCircle className="text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Identificação</label>
                <input
                  type="text"
                  value={formData.identificacao}
                  onChange={(e) => setFormData({ ...formData, identificacao: e.target.value })}
                  placeholder="Ex: AB-001"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  {Object.values(VIATURA_TIPO).map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  placeholder="Ex: Scania P360"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placa</label>
                <input
                  type="text"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                  placeholder="Ex: ABC1234"
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
                  {Object.values(VIATURA_STATUS).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quartel Base</label>
                <input
                  type="text"
                  value={formData.quartelBase}
                  onChange={(e) => setFormData({ ...formData, quartelBase: e.target.value })}
                  placeholder="Ex: Quartel Central"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacidade</label>
                <input
                  type="number"
                  value={formData.capacidade}
                  onChange={(e) => setFormData({ ...formData, capacidade: parseInt(e.target.value) || 1 })}
                  min="1"
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
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Ativa</label>
                <input
                  type="checkbox"
                  checked={formData.ativa}
                  onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                  className="rounded"
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
                  {isLoading ? 'Criando...' : 'Criar Viatura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedViatura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Editar Viatura</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiAlertCircle className="text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Identificação</label>
                <input
                  type="text"
                  value={formData.identificacao}
                  onChange={(e) => setFormData({ ...formData, identificacao: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  {Object.values(VIATURA_TIPO).map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placa</label>
                <input
                  type="text"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
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
                  {Object.values(VIATURA_STATUS).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quartel Base</label>
                <input
                  type="text"
                  value={formData.quartelBase}
                  onChange={(e) => setFormData({ ...formData, quartelBase: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacidade</label>
                <input
                  type="number"
                  value={formData.capacidade}
                  onChange={(e) => setFormData({ ...formData, capacidade: parseInt(e.target.value) || 1 })}
                  min="1"
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
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Ativa</label>
                <input
                  type="checkbox"
                  checked={formData.ativa}
                  onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                  className="rounded"
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
                  {isLoading ? 'Atualizando...' : 'Atualizar Viatura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminViaturaPage
