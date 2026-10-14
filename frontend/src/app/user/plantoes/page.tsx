'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiCalendar, FiUsers, FiTruck, FiClock, FiCheckCircle, FiXCircle, FiFilter, FiSearch } from 'react-icons/fi'
import { plantaoApi } from '@/lib/api'
import { Plantao } from '@/types'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'

const UserPlantoesPage: React.FC = () => {
  const [plantoes, setPlantoes] = useState<Plantao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const user = getCurrentUser()

  useEffect(() => {
    fetchPlantoes()
  }, [])

  const fetchPlantoes = async () => {
    try {
      setIsLoading(true)
      
      const response = await plantaoApi.getMeus()
      setPlantoes(response.data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar plantões')
      toast.error('Erro ao carregar plantões')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPlantoes()
  }

  const filteredPlantoes = plantoes.filter(plantao => {
    const matchesSearch = plantao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plantao.quartel?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !selectedStatus || plantao.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Meus Plantões</h1>
          <p className="text-gray-600">Visualize e acompanhe seus plantões</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Período</p>
                    <p className="text-sm">
                      {new Date(plantao.dataInicio).toLocaleDateString('pt-BR')} - 
                      {new Date(plantao.dataFim).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Horário</p>
                    <p className="text-sm">
                      {new Date(plantao.dataInicio).toLocaleTimeString('pt-BR')} - 
                      {new Date(plantao.dataFim).toLocaleTimeString('pt-BR')}
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
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Viaturas ({plantao.viatura.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {plantao.viatura.map((v) => (
                      <div key={v.viaturaId} className="bg-gray-50 rounded p-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>{v.identificacao} ({v.tipo})</span>
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
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Bombeiros ({plantao.bombeiros.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {plantao.bombeiros.map((b) => (
                      <div key={b.userId} className="bg-gray-50 rounded p-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>{b.nome}</span>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-1">Total de Plantões</h3>
          <p className="text-3xl font-bold text-gray-800">{plantoes.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-1">Ativos</h3>
          <p className="text-3xl font-bold text-green-500">{plantoes.filter(p => p.status === 'Ativo').length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-1">Finalizados</h3>
          <p className="text-3xl font-bold text-blue-500">{plantoes.filter(p => p.status === 'Finalizado').length}</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <p className="text-blue-700 text-sm">
          <strong>Dica:</strong> Clique nos detalhes do plantão para ver mais informações.
        </p>
      </div>
    </div>
  )
}

export default UserPlantoesPage
