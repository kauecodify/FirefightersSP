'use client'

import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Viatura, Solicitacao, ViaturaMapData, SolicitacaoMapData } from '@/types'

// Fix for default marker icons in Next.js
const defaultIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Custom icons
const createViaturaIcon = (tipo: string, status: string) => {
  const colors: Record<string, string> = {
    'Disponível': '#22c55e',
    'Em Atendimento': '#3b82f6',
    'Em Plantão': '#f59e0b',
    'Manutenção': '#ef4444',
  }
  
  const icons: Record<string, string> = {
    'Auto Bomba': 'fire-truck',
    'Ambulância': 'ambulance',
    'Resgate': 'helicopter',
    'Escada': 'ladder',
    'Comando': 'car',
    'Salvamento': 'life-ring',
  }
  
  return L.divIcon({
    className: 'viatura-marker',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background: ${colors[status] || '#64748b'};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">${icons[tipo] ? '🚒' : tipo[0]}</span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  })
}

const createSolicitacaoIcon = (tipo: string, prioridade: string) => {
  const priorityColors: Record<string, string> = {
    'Emergência': '#ef4444',
    'Alta': '#f59e0b',
    'Normal': '#3b82f6',
    'Baixa': '#22c55e',
  }
  
  const tipoIcons: Record<string, string> = {
    'Incêndio': '🔥',
    'Resgate': '🆘',
    'Socorro Médico': '⚕️',
    'Acidente de Trânsito': '🚗',
    'Inundação': '🌊',
  }
  
  return L.divIcon({
    className: 'solicitacao-marker',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background: ${priorityColors[prioridade] || '#64748b'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 0 0 2px ${priorityColors[prioridade] || '#64748b'};
      ">
        <span style="color: white; font-size: 14px;">${tipoIcons[tipo] || '?'}</span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  })
}

interface MapComponentProps {
  viaturas?: ViaturaMapData[]
  solicitacoes?: SolicitacaoMapData[]
  center?: [number, number]
  zoom?: number
  onViaturaClick?: (viatura: ViaturaMapData) => void
  onSolicitacaoClick?: (solicitacao: SolicitacaoMapData) => void
  height?: string
}

const MapComponent: React.FC<MapComponentProps> = ({
  viaturas = [],
  solicitacoes = [],
  center = [-23.5505, -46.6333], // São Paulo center
  zoom = 12,
  onViaturaClick,
  onSolicitacaoClick,
  height = '600px',
}) => {
  const [isClient, setIsClient] = useState(false)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fit map to bounds of all markers
  useEffect(() => {
    if (!isClient || !mapRef.current) return
    
    const map = mapRef.current
    const bounds = L.latLngBounds([])
    
    viaturas.forEach(v => {
      if (v.latitude && v.longitude) {
        bounds.extend([v.latitude, v.longitude])
      }
    })
    
    solicitacoes.forEach(s => {
      if (s.latitude && s.longitude) {
        bounds.extend([s.latitude, s.longitude])
      }
    })
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [isClient, viaturas, solicitacoes])

  if (!isClient) {
    return (
      <div className="w-full h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Carregando mapa...</p>
      </div>
    )
  }

  return (
    <div className="w-full rounded-lg overflow-hidden" style={{ height }}>
      <MapContainer
        center={center as [number, number]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <ZoomControl position="topright" />
        
        {/* Viatura markers */}
        {viaturas.map((viatura) => (
          <Marker
            key={`viatura-${viatura.id}`}
            position={[viatura.latitude, viatura.longitude]}
            icon={createViaturaIcon(viatura.tipo, viatura.status)}
            eventHandlers={{
              click: () => {
                if (onViaturaClick) {
                  onViaturaClick(viatura)
                }
              },
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-lg mb-2">{viatura.identificacao}</h3>
                <p className="text-sm mb-1"><strong>Tipo:</strong> {viatura.tipo}</p>
                <p className="text-sm mb-1"><strong>Status:</strong> {viatura.status}</p>
                {viatura.quartel && (
                  <p className="text-sm mb-1"><strong>Quartel:</strong> {viatura.quartel}</p>
                )}
                {viatura.placa && (
                  <p className="text-sm"><strong>Placa:</strong> {viatura.placa}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Solicitação markers */}
        {solicitacoes.map((solicitacao) => (
          <Marker
            key={`solicitacao-${solicitacao.id}`}
            position={[solicitacao.latitude, solicitacao.longitude]}
            icon={createSolicitacaoIcon(solicitacao.tipo, solicitacao.prioridade)}
            eventHandlers={{
              click: () => {
                if (onSolicitacaoClick) {
                  onSolicitacaoClick(solicitacao)
                }
              },
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-lg mb-2">{solicitacao.protocolo}</h3>
                <p className="text-sm mb-1"><strong>Tipo:</strong> {solicitacao.tipo}</p>
                <p className="text-sm mb-1"><strong>Status:</strong> {solicitacao.status}</p>
                <p className="text-sm mb-1"><strong>Prioridade:</strong> {solicitacao.prioridade}</p>
                <p className="text-sm mb-1"><strong>Título:</strong> {solicitacao.titulo}</p>
                {solicitacao.endereco && (
                  <p className="text-sm"><strong>Endereço:</strong> {solicitacao.endereco}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default MapComponent
