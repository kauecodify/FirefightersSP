# FirefightersSP - Sistema de Gestão de Ocorrências

Sistema de gestão de ocorrências para o Corpo de Bombeiros de São Paulo, desenvolvido como parte do Projeto Integrador II da UNIVESP.

## 📋 Visão Geral

O FirefightersSP é um sistema completo para gestão de ocorrências, viaturas, plantões e usuários do Corpo de Bombeiros. O sistema permite:

- **Usuários comuns**: Criar solicitações de ocorrências
- **Bombeiros**: Visualizar e gerenciar solicitações, plantões e viaturas
- **Administradores**: Gerenciar usuários, viaturas, plantões e todas as solicitações

## 🏗️ Estrutura do Projeto

```
FirefightersSP/
├── backend/                 # API em ASP.NET Core
│   ├── src/
│   │   ├── Controllers/     # Controladores da API
│   │   ├── Models/          # Modelos de dados
│   │   ├── Services/        # Serviços de negócio
│   │   ├── Data/            # Contexto e seed do banco
│   │   └── Program.cs       # Configuração principal
│   ├── Dockerfile           # Docker para backend
│   └── appsettings.json     # Configurações
│
├── frontend/                # Aplicação Next.js
│   ├── src/
│   │   ├── app/             # Rotas e páginas
│   │   │   ├── admin/       # Páginas de admin
│   │   │   ├── user/        # Páginas de usuário
│   │   │   └── auth/        # Autenticação
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── lib/             # Bibliotecas e utilitários
│   │   ├── styles/          # Estilos
│   │   └── types/           # Tipos TypeScript
│   ├── Dockerfile           # Docker para frontend
│   └── package.json         # Dependências
│
├── docker-compose.yml       # Orquestração Docker
└── README.md                # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **ASP.NET Core 8.0** - Framework principal
- **Entity Framework Core** - ORM para SQLite
- **Identity Framework** - Gerenciamento de usuários e autenticação
- **JWT (JSON Web Tokens)** - Autenticação
- **Google Authentication** - Login com Google
- **Swagger** - Documentação da API

### Frontend
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Leaflet** - Mapas interativos
- **React Icons** - Ícones
- **React Toastify** - Notificações
- **Axios** - Requisições HTTP

### Infraestrutura
- **Docker** - Containerização
- **SQLite** - Banco de dados

## 🚀 Como Executar

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 18+ (para desenvolvimento local do frontend)
- .NET SDK 8.0+ (para desenvolvimento local do backend)

### Configuração Inicial

1. **Clone o repositório**:
```bash
git clone https://github.com/kauecodify/FirefightersSP.git
cd FirefightersSP
```

2. **Configure as variáveis de ambiente**:
- Crie um arquivo `.env` na raiz do projeto baseando-se no `.env.example`
- Configure as credenciais do Google OAuth:
  - Acesse o [Google Cloud Console](https://console.cloud.google.com/)
  - Crie um novo projeto
  - Habilite a API Google+ 
  - Crie credenciais OAuth 2.0 (Client ID e Client Secret)
  - Adicione `http://localhost:3000` e `http://localhost:5000` como URIs de redirecionamento autorizados

3. **Execute com Docker**:
```bash
docker-compose up -d
```

O sistema estará disponível em:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Swagger (API Docs)**: http://localhost:5000/swagger

### Desenvolvimento Local (sem Docker)

1. **Backend**:
```bash
cd backend
# Configure a connection string no appsettings.json
# Execute as migrations (se necessário)
dotnet ef database update
# Inicie o servidor
dotnet run
```

2. **Frontend**:
```bash
cd frontend
npm install
npm run dev
```

## 📡 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login com email/senha
- `GET /api/auth/google` - Iniciar login com Google
- `GET /api/auth/me` - Obter usuário atual
- `POST /api/auth/logout` - Logout
- `POST /api/auth/register` - Registrar novo usuário (Admin)
- `GET /api/auth/users` - Listar usuários (Admin)
- `PUT /api/auth/users/{id}` - Atualizar usuário (Admin)
- `DELETE /api/auth/users/{id}` - Excluir usuário (Admin)

### Viaturas
- `GET /api/viatura` - Listar viaturas
- `GET /api/viatura/{id}` - Obter viatura por ID
- `POST /api/viatura` - Criar viatura (Admin)
- `PUT /api/viatura/{id}` - Atualizar viatura (Admin)
- `DELETE /api/viatura/{id}` - Excluir viatura (Admin)
- `GET /api/viatura/disponiveis` - Listar viaturas disponíveis
- `PUT /api/viatura/{id}/status` - Atualizar status
- `PUT /api/viatura/{id}/localizacao` - Atualizar localização
- `GET /api/viatura/mapa` - Obter viaturas para mapa

### Plantões
- `GET /api/plantao` - Listar plantões
- `GET /api/plantao/{id}` - Obter plantão por ID
- `POST /api/plantao` - Criar plantão (Admin)
- `PUT /api/plantao/{id}` - Atualizar plantão (Admin)
- `DELETE /api/plantao/{id}` - Excluir plantão (Admin)
- `POST /api/plantao/{plantaoId}/viatura/{viaturaId}` - Adicionar viatura ao plantão
- `DELETE /api/plantao/{plantaoId}/viatura/{viaturaId}` - Remover viatura do plantão
- `POST /api/plantao/{plantaoId}/bombeiro/{userId}` - Adicionar bombeiro ao plantão
- `DELETE /api/plantao/{plantaoId}/bombeiro/{userId}` - Remover bombeiro do plantão
- `GET /api/plantao/ativos` - Listar plantões ativos
- `GET /api/plantao/meus` - Listar meus plantões

### Solicitações
- `GET /api/solicitacao` - Listar solicitações
- `GET /api/solicitacao/{id}` - Obter solicitação por ID
- `GET /api/solicitacao/protocolo/{protocolo}` - Obter solicitação por protocolo
- `POST /api/solicitacao` - Criar solicitação
- `PUT /api/solicitacao/{id}` - Atualizar solicitação
- `DELETE /api/solicitacao/{id}` - Excluir solicitação (Admin)
- `POST /api/solicitacao/{solicitacaoId}/viatura/{viaturaId}` - Designar viatura
- `PUT /api/solicitacao/{solicitacaoId}/viatura/{viaturaId}/status` - Atualizar status da viatura
- `DELETE /api/solicitacao/{solicitacaoId}/viatura/{viaturaId}` - Remover viatura
- `GET /api/solicitacao/minhas` - Listar minhas solicitações
- `GET /api/solicitacao/em-atendimento` - Listar solicitações em atendimento
- `GET /api/solicitacao/mapa` - Obter solicitações para mapa
- `GET /api/solicitacao/dashboard` - Estatísticas do dashboard
- `GET /api/solicitacao/resumo` - Resumo das solicitações

### Sensores
- `GET /api/sensor` - Listar sensores
- `GET /api/sensor/{id}` - Obter sensor por ID
- `POST /api/sensor` - Criar sensor (Admin)
- `PUT /api/sensor/{id}` - Atualizar sensor (Admin)
- `DELETE /api/sensor/{id}` - Excluir sensor (Admin)
- `GET /api/sensor/leituras/{sensorId}` - Listar leituras de sensor
- `POST /api/sensor/leituras` - Criar leitura de sensor
- `GET /api/sensor/latest` - Obter últimas leituras
- `POST /api/sensor/simulate/{viaturaId}` - Simular dados de sensor
- `GET /api/sensor/viatura/{viaturaId}/gps` - Obter localização GPS da viatura

## 📊 Funcionalidades

### Autenticação
- Login com email/senha
- Login com Google OAuth
- Gerenciamento de usuários (Admin)
- Papéis: Admin, Firefighter, User

### Viaturas
- Cadastro, edição e exclusão
- Gerenciamento de status (Disponível, Em Atendimento, Em Plantão, Manutenção)
- Localização em tempo real no mapa
- Integração com sensores (GPS, combustível, etc.)

### Plantões
- Criação e gerenciamento
- Alocação de viaturas e bombeiros
- Controle de capacidade
- Status (Ativo, Finalizado, Cancelado)

### Solicitações
- Criação por usuários
- Designação de viaturas
- Acompanhamento de status
- Histórico de alterações
- Prioridades (Emergência, Alta, Normal, Baixa)
- Tipos (Incêndio, Resgate, Socorro Médico, etc.)

### Sensores
- Monitoramento de localização (GPS)
- Monitoramento de combustível
- Simulação de dados
- Alertas automáticos

### Mapas
- Visualização de viaturas no mapa
- Visualização de solicitações no mapa
- Filtros por status e tipo
- Navegação interativa

## 👥 Papéis e Permissões

| Papel | Permissões |
|-------|------------|
| **Admin** | Acesso completo ao sistema, gerenciamento de usuários, viaturas, plantões e solicitações |
| **Firefighter** | Visualização e gerenciamento de solicitações, plantões e viaturas |
| **User** | Criação de solicitações e visualização do status |

## 🎨 Interface do Usuário

### Páginas Principais

#### Admin
- `/admin/dashboard` - Dashboard administrativo
- `/admin/users` - Gerenciamento de usuários
- `/admin/viaturas` - Gerenciamento de viaturas
- `/admin/viaturas/mapa` - Mapa de viaturas
- `/admin/plantoes` - Gerenciamento de plantões
- `/admin/solicitacoes` - Gerenciamento de solicitações
- `/admin/solicitacoes/nova` - Nova solicitação
- `/admin/solicitacoes/mapa` - Mapa de solicitações
- `/admin/solicitacoes/{id}` - Detalhes da solicitação

#### Usuário
- `/user/dashboard` - Dashboard do usuário
- `/user/solicitacoes` - Minhas solicitações
- `/user/nova-solicitacao` - Nova solicitação
- `/user/solicitacoes/{id}` - Detalhes da solicitação
- `/user/plantoes` - Meus plantões
- `/user/mapa` - Mapa de viaturas e solicitações
- `/user/profile` - Meu perfil

#### Autenticação
- `/auth/login` - Login
- `/auth/register` - Registro

## 📦 Deploy

### Docker Compose
```bash
# Construir e iniciar containers
docker-compose up -d

# Parar containers
docker-compose down

# Visualizar logs
docker-compose logs -f
```

### Kubernetes (opcional)
Para deploy em Kubernetes, crie manifests baseando-se no Docker Compose.

## 🔧 Configuração Adicional

### Google OAuth
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Navegue até APIs & Services > Credentials
4. Crie credenciais OAuth 2.0
5. Adicione URIs de redirecionamento:
   - `http://localhost:5000/api/auth/google-callback` (desenvolvimento)
   - `http://seu-dominio.com/api/auth/google-callback` (produção)

### JWT
- Configure uma chave secreta forte no `appsettings.json`
- Ajuste o tempo de expiração conforme necessário

## 📄 Documentação

- [Documentação da API (Swagger)](http://localhost:5000/swagger)

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📜 Licença

Este projeto está sob a licença BSD 3-Clause. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- UNIVESP - Universidade Virtual do Estado de São Paulo
- Corpo de Bombeiros de São Paulo
- Todos os contribuidores do projeto

---

**Desenvolvido por:** PROJETO INTEGRADOR II - (TECNOLOGIA DA INFORMAÇÃO | ENGENHARIA DA COMPUTAÇÃO)

**Versão:** 1.0.0

**Data:** 2026
