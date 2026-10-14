'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiClock, FiCheckCircle, FiXCircle, FiMapPin, FiUser, FiPhone, FiAlertTriangle } from 'react-icons/fi'
import { solicitacaoApi } from '@/lib/api'
import { Solicitacao } from '@/types'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { isAdmin, isFirefighter } from '@/lib/auth'

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">Carregando mapa...</div>
})

const SolicitacaoDetailPage: React.FC<{ params: { id: string } }> = ({ params }) => {
  const router = useRouter()
  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      const response = await solicitacaoApi.getById(parseInt(params.id))
      setSolicitacao(response.data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar solicitação')
      toast.error('Erro ao carregar solicitação')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate duration
  const getDuration = () => {
    if (!solicitacao?.dataInicioAtendimento) return 'Não iniciado'
    
    const end = solicitacao.dataFimAtendimento || new Date()
    const start = new Date(solicitacao.dataInicioAtendimento)
    
    const diff = (end.getTime() - start.getTime()) / 1000 / 60 // minutes
    
    if (diff < 60) return `${Math.round(diff)} min`
    if (diff < 1440) return `${Math.round(diff / 60)} horas`
    return `${Math.round(diff / 1440)} dias`
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
          href="/user/solicitacoes"
          className="mt-4 inline-block bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition"
        >
          Voltar para lista
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/user/solicitacoes')}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FiArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Solicitação #{solicitacao.protocolo}</h1>
            <p className="text-gray-600">{solicitacao.titulo}</p>
          </div>
        </div>
      </div>

      {/* Status and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Status</h2>
          <div className="flex items-center space-x-4">
            <span className={`badge badge-${solicitacao.status.toLowerCase().replace(' ', '-')} text-xl px-4 py-2`}>
              {solicitacao.status}
            </span>
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
      {solicitacao.viatura.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Viaturas Designadas ({solicitacao.viatura.length})</h2>
          
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
        </div>
      )}

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
    </div>
  )
}

export default SolicitacaoDetailPage
