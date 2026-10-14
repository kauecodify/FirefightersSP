'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiRefreshCw, FiFilter, FiMap, FiList } from 'react-icons/fi'
import { viaturaApi } from '@/lib/api'
import { Viatura, ViaturaMapData } from '@/types'
import MapComponent from '@/components/MapComponent'
import Link from 'next/link'

const AdminViaturaMapPage: React.FC = () => {
  const [viaturas, setViatura] = useState<Viatura[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showList, setShowList] = useState(false)

  useEffect(() => {
    fetchViatura()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchViatura, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchViatura = async () => {
    try {
      setIsLoading(true)
      const response = await viaturaApi.getParaMapa()
      setViatura(response.data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar viaturas')
      toast.error('Erro ao carregar viaturas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    await fetchViatura()
    toast.success('Dados atualizados')
  }

  const handleViaturaClick = (viatura: ViaturaMapData) => {
    toast.info(`Viatura: ${viatura.identificacao} - ${viatura.tipo}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Mapa de Viaturas</h1>
          <p className="text-gray-600">Visualize a localização de todas as viaturas em tempo real</p>
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
            href="/admin/viaturas"
            className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition"
          >
            Voltar para Lista
          </Link>
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
          viaturas={viaturas.map(v => ({
            id: v.id,
            identificacao: v.identificacao,
            tipo: v.tipo,
            status: v.status,
            latitude: v.latitude,
            longitude: v.longitude,
            quartel: v.quartel,
            placa: v.placa
          }))}
          height="600px"
          onViaturaClick={handleViaturaClick}
        />
      </div>

      {/* List View */}
      {showList && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Lista de Viaturas ({viaturas.length})</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">ID</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Tipo</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Quartel</th>
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
                    <td className="py-2 px-3">{viatura.quartel || '-'}</td>
                    <td className="py-2 px-3">
                      {viatura.latitude && viatura.longitude ? (
                        `${viatura.latitude.toFixed(4)}, ${viatura.longitude.toFixed(4)}`
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-1">Total de Viaturas</h3>
          <p className="text-3xl font-bold text-gray-800">{viaturas.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-1">Disponíveis</h3>
          <p className="text-3xl font-bold text-green-500">{viaturas.filter(v => v.status === 'Disponível').length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-1">Em Atendimento</h3>
          <p className="text-3xl font-bold text-blue-500">{viaturas.filter(v => v.status === 'Em Atendimento').length}</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <p className="text-blue-700 text-sm">
          <strong>Dica:</strong> Clique nos marcadores no mapa para ver mais detalhes sobre as viaturas.
        </p>
      </div>
    </div>
  )
}

export default AdminViaturaMapPage
