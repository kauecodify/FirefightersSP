'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiEdit, FiTrash2, FiTruck, FiClock, FiCheckCircle, FiXCircle, FiMapPin, FiUser, FiPhone, FiAlertTriangle } from 'react-icons/fi'
import { solicitacaoApi, viaturaApi } from '@/lib/api'
import { Solicitacao, SOLICITACAO_STATUS, VIATURA_STATUS } from '@/types'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">Carregando mapa...</div>
})

const SolicitacaoDetailPage: React.FC<{ params: { id: string } }> = ({ params }) => {
  const router = useRouter()
  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null)
  const [viaturasDisponiveis, setViaturaDisponiveis] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedViaturaId, setSelectedViaturaId] = useState<number>()

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      const [solicitacaoResponse, viaturasResponse] = await Promise.all([
        solicitacaoApi.getById(parseInt(params.id)),
        viaturaApi.getDisponiveis(),
      ])
      
      setSolicitacao(solicitacaoResponse.data)
      setViaturaDisponiveis(viaturasResponse.data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar solicitação')
      toast.error('Erro ao carregar solicitação')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignViatura = async () => {
    if (!solicitacao || !selectedViaturaId) return
    
    try {
      setIsLoading(true)
      await solicitacaoApi.assignViatura(solicitacao.id, selectedViaturaId)
      toast.success('Viatura designada com sucesso')
      setShowAssignModal(false)
      setSelectedViaturaId(undefined)
      fetchData()
    } catch (err: any) {
      toast.error('Erro ao designar viatura')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!solicitacao) return
    
    try {
      setIsLoading(true)
      await solicitacaoApi.update(solicitacao.id, { status: newStatus })
      toast.success('Status atualizado com sucesso')
      fetchData()
    } catch (err: any) {
      toast.error('Erro ao atualizar status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!solicitacao || !confirm('Tem certeza que deseja excluir esta solicitação?')) return
    
    try {
      setIsLoading(true)
      await solicitacaoApi.delete(solicitacao.id)
      toast.success('Solicitação excluída com sucesso')
      router.push('/admin/solicitacoes')
    } catch (err: any) {
      toast.error('Erro ao excluir solicitação')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error || !solicitacao) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error || 'Solicitação não encontrada'}</p>
        <Link
          href="/admin/solicitacoes"
          className="mt-4 inline-block bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition"
        >
          Voltar para lista
        </Link>
      </div>
    )
  }

  // Calculate duration
  const getDuration = () => {
    if (!solicitacao.dataInicioAtendimento) return 'Não iniciado'
    
    const end = solicitacao.dataFimAtendimento || new Date()
    const start = new Date(solicitacao.dataInicioAtendimento)
    
    const diff = (end.getTime() - start.getTime()) / 1000 / 60 // minutes
    
    if (diff < 60) return `${Math.round(diff)} min`
    if (diff < 1440) return `${Math.round(diff / 60)} horas`
    return `${Math.round(diff / 1440)} dias`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/solicitacoes')}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FiArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Solicitação #{solicitacao.protocolo}</h1>
            <p className="text-gray-600">{solicitacao.titulo}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/admin/solicitacoes/${solicitacao.id}/editar`)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <FiEdit />
            <span>Editar</span>
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition flex items-center space-x-2"
          >
            <FiTrash2 />
            <span>Excluir</span>
          </button>
        </div>
      </div>

      {/* Status and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Status</h2>
          <div className="flex items-center space-x-4">
            <select
              value={solicitacao.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg font-medium"
            >
              {Object.values(SOLICITACAO_STATUS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              solicitacao.status === 'Aberta' ? 'bg-red-500' :
              solicitacao.status === 'Em Atendimento' ? 'bg-blue-500' :
              solicitacao.status === 'Finalizada' ? 'bg-green-500' :
              'bg-gray-500'
            }`}>
              <FiAlertTriangle className="text-white" />
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-1">Data de Abertura</p>
            <p className="font-medium">{new Date(solicitacao.dataAbertura).toLocaleString('pt-BR')}</p>
          </div>
          
          {solicitacao.dataInicioAtendimento && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500 mb-1">Início do Atendimento</p>
              <p className="font-medium">{new Date(solicitacao.dataInicioAtendimento).toLocaleString('pt-BR')}</p>
            </div>
          )}
          
          {solicitacao.dataFimAtendimento && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500 mb-1">Fim do Atendimento</p>
              <p className="font-medium">{new Date(solicitacao.dataFimAtendimento).toLocaleString('pt-BR')}</p>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-1">Duração</p>
            <p className="font-medium">{getDuration()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Prioridade</h2>
          <div className="flex items-center space-x-4">
            <span className={`badge badge-${solicitacao.prioridade.toLowerCase()} text-xl px-4 py-2`}>
              {solicitacao.prioridade}
            </span>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              solicitacao.prioridade === 'Emergência' ? 'bg-red-500' :
              solicitacao.prioridade === 'Alta' ? 'bg-orange-500' :
              solicitacao.prioridade === 'Normal' ? 'bg-blue-500' :
              'bg-green-500'
            }`}>
              <FiAlertTriangle className="text-white" />
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-1">Tipo</p>
            <p className="font-medium">{solicitacao.tipo}</p>
          </div>
        </div>
      </div>

      {/* Requester Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações do Solicitante</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Nome</p>
            <p className="font-medium">{solicitacao.nomeSolicitante || 'Não informado'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Telefone</p>
            <p className="font-medium">{solicitacao.telefoneSolicitante || 'Não informado'}</p>
          </div>
        </div>
        
        {solicitacao.userNome && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-1">Usuário do Sistema</p>
            <p className="font-medium">{solicitacao.userNome}</p>
          </div>
        )}
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Localização</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Endereço</p>
            <p className="font-medium">{solicitacao.endereco || 'Não informado'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Bairro</p>
            <p className="font-medium">{solicitacao.bairro || 'Não informado'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Cidade</p>
            <p className="font-medium">{solicitacao.cidade || 'Não informado'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">CEP</p>
            <p className="font-medium">{solicitacao.cep || 'Não informado'}</p>
          </div>
        </div>
        
        {solicitacao.latitude && solicitacao.longitude && (
          <div className="bg-gray-50 rounded-lg p-4">
            <MapComponent
              center={[solicitacao.latitude, solicitacao.longitude]}
              zoom={16}
              height="300px"
              solicitacoes={[{
                id: solicitacao.id,
                protocolo: solicitacao.protocolo,
                tipo: solicitacao.tipo,
                status: solicitacao.status,
                prioridade: solicitacao.prioridade,
                latitude: solicitacao.latitude,
                longitude: solicitacao.longitude,
                endereco: solicitacao.endereco,
                titulo: solicitacao.titulo
              }]}
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Coordenadas: {solicitacao.latitude.toFixed(6)}, {solicitacao.longitude.toFixed(6)}
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Descrição</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{solicitacao.descricao || 'Sem descrição'}</p>
      </div>

      {/* Observations */}
      {solicitacao.observacoes && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Observações</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{solicitacao.observacoes}</p>
        </div>
      )}

      {/* Viatura Assignment */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Viaturas Designadas ({solicitacao.viatura.length})</h2>
          {solicitacao.status === 'Aberta' && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition flex items-center space-x-2"
            >
              <FiTruck />
              <span>Designar Viatura</span>
            </button>
          )}
        </div>
        
        {solicitacao.viatura.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhuma viatura designada</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">ID</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Tipo</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Placa</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Quartel</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Data Alocação</th>
                </tr>
              </thead>
              <tbody>
                {solicitacao.viatura.map((v) => (
                  <tr key={v.viaturaId} className="border-b">
                    <td className="py-2 px-3">{v.identificacao}</td>
                    <td className="py-2 px-3">{v.tipo}</td>
                    <td className="py-2 px-3">{v.placa}</td>
                    <td className="py-2 px-3">{v.quartel || '-'}</td>
                    <td className="py-2 px-3">
                      <span className={`badge badge-${v.status.toLowerCase().replace(' ', '-')}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">{new Date(v.dataAlocacao).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Histórico de Status ({solicitacao.historico.length})</h2>
        
        {solicitacao.historico.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhum histórico disponível</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Data</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">De</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Para</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Usuário</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Observações</th>
                </tr>
              </thead>
              <tbody>
                {solicitacao.historico.slice().reverse().map((h) => (
                  <tr key={h.id} className="border-b">
                    <td className="py-2 px-3">{new Date(h.dataAlteracao).toLocaleString('pt-BR')}</td>
                    <td className="py-2 px-3">
                      <span className={`badge badge-${h.statusAnterior.toLowerCase().replace(' ', '-')}`}>
                        {h.statusAnterior}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`badge badge-${h.statusNovo.toLowerCase().replace(' ', '-')}`}>
                        {h.statusNovo}
                      </span>
                    </td>
                    <td className="py-2 px-3">{h.userNome || 'Sistema'}</td>
                    <td className="py-2 px-3">{h.observacoes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Viatura Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Designar Viatura</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Solicitação: <strong>{solicitacao.protocolo} - {solicitacao.titulo}</strong>
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
                  onClick={() => setShowAssignModal(false)}
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
    </div>
  )
}

export default SolicitacaoDetailPage
