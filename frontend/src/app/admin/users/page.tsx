'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiFilter, FiUser, FiUsers, FiMail, FiPhone, FiShield } from 'react-icons/fi'
import { authApi } from '@/lib/api'
import { User } from '@/types'
import Link from 'next/link'

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedQuartel, setSelectedQuartel] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nomeCompleto: '',
    cpf: '',
    cargo: 'User',
    quartel: '',
    telefone: '',
    roles: ['User'] as string[],
    ativo: true,
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await authApi.getUsers()
      setUsers(response.data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar usuários')
      toast.error('Erro ao carregar usuários')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      await authApi.register(formData)
      toast.success('Usuário criado com sucesso')
      setShowCreateModal(false)
      setFormData({
        email: '',
        password: '',
        nomeCompleto: '',
        cpf: '',
        cargo: 'User',
        quartel: '',
        telefone: '',
        roles: ['User'],
        ativo: true,
      })
      fetchUsers()
    } catch (err: any) {
      toast.error('Erro ao criar usuário')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    
    try {
      setIsLoading(true)
      await authApi.updateUser(selectedUser.id, formData)
      toast.success('Usuário atualizado com sucesso')
      setShowEditModal(false)
      fetchUsers()
    } catch (err: any) {
      toast.error('Erro ao atualizar usuário')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    
    try {
      setIsLoading(true)
      await authApi.deleteUser(id)
      toast.success('Usuário excluído com sucesso')
      fetchUsers()
    } catch (err: any) {
      toast.error('Erro ao excluir usuário')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClick = (user: User) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      password: '',
      nomeCompleto: user.nome || '',
      cpf: '',
      cargo: user.cargo || 'User',
      quartel: user.quartel || '',
      telefone: user.telefone || '',
      roles: user.roles || ['User'],
      ativo: true,
    })
    setShowEditModal(true)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cpf?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = !selectedRole || user.roles?.includes(selectedRole)
    const matchesQuartel = !selectedQuartel || user.quartel === selectedQuartel
    
    return matchesSearch && matchesRole && matchesQuartel
  })

  // Get unique quartel and role values
  const quartelOptions = [...new Set(users.map(u => u.quartel).filter(Boolean))]
  const roleOptions = ['Admin', 'Firefighter', 'User']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gerenciamento de Usuários</h1>
          <p className="text-gray-600">Cadastre, edite e gerencie todos os usuários do sistema</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition flex items-center space-x-2"
        >
          <FiPlus />
          <span>Novo Usuário</span>
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
                placeholder="Buscar por email, nome, CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos os Papéis</option>
              {roleOptions.map(role => (
                <option key={role} value={role}>{role}</option>
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

      {/* User List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Lista de Usuários ({filteredUsers.length})</h2>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum usuário encontrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Nome</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Cargo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Quartel</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Papéis</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {user.picture ? (
                          <img
                            src={user.picture}
                            alt={user.nome}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {user.nome?.slice(0, 2) || 'U'}
                          </div>
                        )}
                        <span>{user.nome || user.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.cargo || '-'}</td>
                    <td className="py-3 px-4">{user.quartel || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map(role => (
                          <span key={role} className="badge badge-info text-xs">{role}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${user.ativo ? 'badge-disponivel' : 'badge-manutencao'}`}>
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-2 text-blue-500 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
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
              <h2 className="text-xl font-bold text-gray-800">Novo Usuário</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline mr-1" /> Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.nomeCompleto}
                  onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                  placeholder="Digite o nome completo"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="inline mr-1" /> Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Digite o email"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiShield className="inline mr-1" /> Senha
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Digite a senha"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                <select
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Admin">Administrador</option>
                  <option value="Firefighter">Bombeiro</option>
                  <option value="User">Usuário</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quartel</label>
                <input
                  type="text"
                  value={formData.quartel}
                  onChange={(e) => setFormData({ ...formData, quartel: e.target.value })}
                  placeholder="Digite o quartel"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiPhone className="inline mr-1" /> Telefone
                </label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="Digite o telefone"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Papéis</label>
                <div className="space-y-2">
                  {roleOptions.map(role => (
                    <label key={role} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(role)}
                        onChange={(e) => {
                          const newRoles = e.target.checked
                            ? [...formData.roles, role]
                            : formData.roles.filter(r => r !== role)
                          setFormData({ ...formData, roles: newRoles })
                        }}
                        className="rounded"
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Ativo</label>
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
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
                  {isLoading ? 'Criando...' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Editar Usuário</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline mr-1" /> Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.nomeCompleto}
                  onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="inline mr-1" /> Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                <select
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Admin">Administrador</option>
                  <option value="Firefighter">Bombeiro</option>
                  <option value="User">Usuário</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quartel</label>
                <input
                  type="text"
                  value={formData.quartel}
                  onChange={(e) => setFormData({ ...formData, quartel: e.target.value })}
                  placeholder="Digite o quartel"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiPhone className="inline mr-1" /> Telefone
                </label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Papéis</label>
                <div className="space-y-2">
                  {roleOptions.map(role => (
                    <label key={role} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(role)}
                        onChange={(e) => {
                          const newRoles = e.target.checked
                            ? [...formData.roles, role]
                            : formData.roles.filter(r => r !== role)
                          setFormData({ ...formData, roles: newRoles })
                        }}
                        className="rounded"
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Ativo</label>
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
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
                  {isLoading ? 'Atualizando...' : 'Atualizar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-1">Total de Usuários</h3>
          <p className="text-3xl font-bold text-gray-800">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-1">Administradores</h3>
          <p className="text-3xl font-bold text-purple-500">{users.filter(u => u.roles?.includes('Admin')).length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-1">Bombeiros</h3>
          <p className="text-3xl font-bold text-orange-500">{users.filter(u => u.roles?.includes('Firefighter')).length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-1">Usuários</h3>
          <p className="text-3xl font-bold text-blue-500">{users.filter(u => u.roles?.includes('User')).length}</p>
        </div>
      </div>
    </div>
  )
}

export default AdminUsersPage
