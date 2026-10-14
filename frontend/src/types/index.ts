// User types
export interface User {
  id: string;
  email: string;
  nome: string;
  cargo: string;
  quartel: string;
  picture: string;
  telefone: string;
  roles: string[];
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  nomeCompleto: string;
  cpf?: string;
  cargo?: string;
  quartel?: string;
  telefone?: string;
}

// Viatura types
export interface Viatura {
  id: number;
  identificacao: string;
  tipo: string;
  modelo: string;
  placa: string;
  descricao: string | null;
  status: string;
  quartelBase: string | null;
  capacidade: number;
  ativa: boolean;
  latitude: number | null;
  longitude: number | null;
  localizacaoAtual: string | null;
  dataCadastro: Date;
  dataUltimaManutencao: Date | null;
  nivelCombustivel: number | null;
  velocidade: number | null;
  ultimaAtualizacaoSensor: Date | null;
}

export interface CreateViaturaData {
  identificacao: string;
  tipo: string;
  modelo: string;
  placa: string;
  descricao?: string;
  status: string;
  quartelBase?: string;
  capacidade: number;
  ativa: boolean;
  latitude?: number;
  longitude?: number;
}

export interface ViaturaMapData {
  id: number;
  identificacao: string;
  tipo: string;
  status: string;
  latitude: number;
  longitude: number;
  quartel: string | null;
  placa: string | null;
}

// Plantão types
export interface Plantao {
  id: number;
  nome: string;
  descricao: string | null;
  dataInicio: Date;
  dataFim: Date;
  status: string;
  quartel: string | null;
  maxViatura: number;
  maxBombeiros: number;
  viaturaCount: number;
  bombeiroCount: number;
  viatura: PlantaoViatura[];
  bombeiros: PlantaoBombeiro[];
}

export interface PlantaoViatura {
  viaturaId: number;
  identificacao: string;
  tipo: string;
  status: string;
}

export interface PlantaoBombeiro {
  userId: string;
  nome: string;
  funcao: string;
  status: string;
}

export interface CreatePlantaoData {
  nome: string;
  descricao?: string;
  dataInicio: Date;
  dataFim: Date;
  status: string;
  quartel?: string;
  maxViatura: number;
  maxBombeiros: number;
}

// Solicitação types
export interface Solicitacao {
  id: number;
  protocolo: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  status: string;
  prioridade: string;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  latitude: number | null;
  longitude: number | null;
  nomeSolicitante: string | null;
  telefoneSolicitante: string | null;
  userId: string | null;
  userNome: string | null;
  dataAbertura: Date;
  dataInicioAtendimento: Date | null;
  dataFimAtendimento: Date | null;
  observacoes: string | null;
  viatura: SolicitacaoViatura[];
  historico: SolicitacaoHistorico[];
}

export interface SolicitacaoViatura {
  viaturaId: number;
  identificacao: string;
  tipo: string;
  placa: string;
  quartel: string | null;
  status: string;
  dataAlocacao: Date;
  dataChegada: Date | null;
  dataSaida: Date | null;
}

export interface SolicitacaoHistorico {
  id: number;
  statusAnterior: string;
  statusNovo: string;
  dataAlteracao: Date;
  userNome: string | null;
  observacoes: string | null;
}

export interface CreateSolicitacaoData {
  tipo: string;
  titulo: string;
  descricao?: string;
  prioridade: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  nomeSolicitante?: string;
  telefoneSolicitante?: string;
  observacoes?: string;
}

export interface SolicitacaoMapData {
  id: number;
  protocolo: string;
  tipo: string;
  status: string;
  prioridade: string;
  latitude: number;
  longitude: number;
  endereco: string | null;
  titulo: string;
}

export interface SolicitacaoResumo {
  id: number;
  protocolo: string;
  tipo: string;
  titulo: string;
  status: string;
  prioridade: string;
  dataAbertura: Date;
  endereco: string | null;
  viaturaCount: number;
}

export interface SolicitacaoDashboard {
  totalAbertas: number;
  totalEmAtendimento: number;
  totalFinalizadas: number;
  totalEmergencia: number;
  porTipo: SolicitacaoPorTipo[];
  porQuartel: SolicitacaoPorQuartel[];
}

export interface SolicitacaoPorTipo {
  tipo: string;
  quantidade: number;
}

export interface SolicitacaoPorQuartel {
  quartel: string;
  quantidade: number;
}

// Sensor types
export interface Sensor {
  id: number;
  identificacao: string;
  tipo: string;
  viaturaId: number;
  viaturaIdentificacao: string | null;
  descricao: string | null;
  ativo: boolean;
  dataInstalacao: Date;
  dataUltimaLeitura: Date | null;
}

export interface SensorLeitura {
  id: number;
  sensorId: number;
  sensorIdentificacao: string | null;
  sensorTipo: string | null;
  viaturaId: number | null;
  viaturaIdentificacao: string | null;
  valor: string;
  unidade: string | null;
  dataLeitura: Date;
  latitude: number | null;
  longitude: number | null;
  alertado: boolean;
}

// Map types
export interface MapMarker {
  id: number;
  position: [number, number];
  type: 'viatura' | 'solicitacao';
  data: ViaturaMapData | SolicitacaoMapData;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Filter types
export interface SolicitacaoFiltro {
  status?: string;
  prioridade?: string;
  tipo?: string;
  quartel?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

// Status constants
export const VIATURA_STATUS = {
  DISPONIVEL: 'Disponível',
  EM_ATENDIMENTO: 'Em Atendimento',
  EM_PLANTAO: 'Em Plantão',
  MANUTENCAO: 'Manutenção',
} as const

export const SOLICITACAO_STATUS = {
  ABERTA: 'Aberta',
  EM_ATENDIMENTO: 'Em Atendimento',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
} as const

export const SOLICITACAO_PRIORIDADE = {
  EMERGENCIA: 'Emergência',
  ALTA: 'Alta',
  NORMAL: 'Normal',
  BAIXA: 'Baixa',
} as const

export const SOLICITACAO_TIPO = {
  INCENDIO: 'Incêndio',
  RESGATE: 'Resgate',
  SOCORRO_MEDICO: 'Socorro Médico',
  ACIDENTE_TRANSITO: 'Acidente de Trânsito',
  INUNDACAO: 'Inundação',
  OUTRO: 'Outro',
} as const

export const VIATURA_TIPO = {
  AUTO_BOMBA: 'Auto Bomba',
  AMBULANCIA: 'Ambulância',
  RESGATE: 'Resgate',
  ESCADA: 'Escada',
  COMANDO: 'Comando',
  SALVAMENTO: 'Salvamento',
  OUTRO: 'Outro',
} as const
