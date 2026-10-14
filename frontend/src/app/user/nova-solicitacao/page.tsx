'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { FiSave, FiMapPin, FiAlertTriangle, FiType, FiTag, FiCalendar, FiUser, FiPhone } from 'react-icons/fi'
import { solicitacaoApi } from '@/lib/api'
import { SOLICITACAO_TIPO, SOLICITACAO_PRIORIDADE } from '@/types'
import dynamic from 'next/dynamic'
import { getCurrentUser } from '@/lib/auth'

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">Carregando mapa...</div>
})

const NovaSolicitacaoPage: React.FC = () => {
  const router = useRouter()
  const user = getCurrentUser()
  const [formData, setFormData] = useState({
    tipo: 'Incêndio',
    titulo: '',
    descricao: '',
    prioridade: 'Normal',
    endereco: '',
    bairro: '',
    cidade: 'São Paulo',
    cep: '',
    latitude: -23.5505,
    longitude: -46.6333,
    nomeSolicitante: user?.nome || '',
    telefoneSolicitante: user?.telefone || '',
    observacoes: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)

  // Get user's current location
  useEffect(() => {
    if (useCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          toast.success('Localização atual obtida')
        },
        (err) => {
          toast.error('Erro ao obter localização: ' + err.message)
        }
      )
    }
  }, [useCurrentLocation])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Convert latitude and longitude to numbers
      const dataToSend = {
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      }
      
      const response = await solicitacaoApi.create(dataToSend)
      toast.success('Solicitação criada com sucesso')
      router.push(`/user/solicitacoes/${response.data.id}`)
    } catch (err: any) {
      setError(err.message || 'Erro ao criar solicitação')
      toast.error('Erro ao criar solicitação')
    } finally {
      setIsLoading(false)
    }
  }

  // Mock viaturas for map display
  const mockViatura = [
    {
      id: 1,
      identificacao: 'AB-001',
      tipo: 'Auto Bomba',
      status: 'Disponível',
      latitude: -23.5505,
      longitude: -46.6333,
      quartel: 'Quartel Central',
      placa: 'ABC1234',
    },
    {
      id: 2,
      identificacao: 'AM-001',
      tipo: 'Ambulância',
      status: 'Em Atendimento',
      latitude: -23.5614,
      longitude: -46.6558,
      quartel: 'Quartel Norte',
      placa: 'AMB001',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Nova Solicitação</h1>
          <p className="text-gray-600">Crie uma nova solicitação de ocorrência</p>
        </div>
        <button
          onClick={() => router.push('/user/solicitacoes')}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          Voltar
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiTag className="inline mr-1" /> Tipo
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                {Object.values(SOLICITACAO_TIPO).map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiAlertTriangle className="inline mr-1" /> Prioridade
              </label>
              <select
                name="prioridade"
                value={formData.prioridade}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                {Object.values(SOLICITACAO_PRIORIDADE).map(prioridade => (
                  <option key={prioridade} value={prioridade}>{prioridade}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title and Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiType className="inline mr-1" /> Título
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ex: Incêndio em prédio residencial"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva a ocorrência em detalhes"
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiMapPin className="inline mr-1" /> Endereço
              </label>
              <input
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                placeholder="Ex: Rua das Flores, 123"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
              <input
                type="text"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                placeholder="Ex: Centro"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                placeholder="Ex: São Paulo"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
              <input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                placeholder="Ex: 01234-567"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                step="0.0001"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                step="0.0001"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          {/* Use current location */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Usar localização atual</label>
            <input
              type="checkbox"
              checked={useCurrentLocation}
              onChange={(e) => setUseCurrentLocation(e.target.checked)}
              className="rounded"
            />
          </div>

          {/* Map */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiMapPin className="inline mr-1" /> Selecione a localização no mapa
            </label>
            <MapComponent
              viaturas={mockViatura}
              center={[formData.latitude, formData.longitude]}
              zoom={14}
              height="400px"
            />
            <p className="text-xs text-gray-500 mt-2">
              Clique no mapa para definir a localização exata da ocorrência
            </p>
          </div>

          {/* Requester Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiUser className="inline mr-1" /> Nome do Solicitante
              </label>
              <input
                type="text"
                name="nomeSolicitante"
                value={formData.nomeSolicitante}
                onChange={handleChange}
                placeholder="Ex: João Silva"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiPhone className="inline mr-1" /> Telefone do Solicitante
              </label>
              <input
                type="tel"
                name="telefoneSolicitante"
                value={formData.telefoneSolicitante}
                onChange={handleChange}
                placeholder="Ex: 11 98765-4321"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Observações adicionais"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => router.push('/user/solicitacoes')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Criando...</span>
                </>
              ) : (
                <>
                  <FiSave />
                  <span>Salvar Solicitação</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <p className="text-blue-700 text-sm">
          <strong>Dica:</strong> Preencha todos os campos com o máximo de detalhes possível para facilitar o atendimento.
        </p>
      </div>
    </div>
  )
}

export default NovaSolicitacaoPage
