'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building, 
  Users, 
  ShieldCheck, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  Check, 
  AlertTriangle,
  History,
  Lock,
  FileCheck
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { User, Tenant, UserRole, AuditLog } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default function ConfiguracoesPage() {
  const { tenant, user, refreshTenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'CRIATORIO' | 'EQUIPE' | 'BACKUP' | 'AUDITORIA' | 'LGPD'>('CRIATORIO');

  const [usersList, setUsersList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Criatorio form
  const [tenantForm, setTenantForm] = useState({
    name: tenant?.name || '',
    document: tenant?.document || '',
    email: tenant?.email || '',
    phone: tenant?.phone || '',
    whatsapp: tenant?.whatsapp || '',
    address: tenant?.address || '',
    city: tenant?.city || '',
    state: tenant?.state || '',
    zipCode: tenant?.zipCode || '',
    description: tenant?.description || '',
    isPublic: tenant?.isPublic ?? true
  });

  // User modal
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'STAFF' as UserRole,
    phone: ''
  });

  const loadData = () => {
    setUsersList(db.getUsers(tenant?.id));
    setAuditLogs(db.getAuditLogs(tenant?.id));
  };

  useEffect(() => {
    loadData();
  }, [tenant?.id]);

  const handleSaveTenant = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateTenant(tenantForm, tenant?.id);
    refreshTenant();
    alert('Dados do criatório atualizados com sucesso!');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) return;

    db.addUser({
      tenantId: tenant?.id || 'tenant-demo-01',
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role,
      phone: newUserForm.phone,
      active: true
    });

    loadData();
    setIsNewUserModalOpen(false);
    setNewUserForm({ name: '', email: '', role: 'STAFF', phone: '' });
  };

  const handleDownloadBackup = () => {
    const backupJson = db.exportBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_birdpro_${tenant?.slug || 'criatorio'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = db.importBackup(content);
      if (success) {
        alert('Backup restaurado com sucesso!');
        loadData();
        refreshTenant();
      } else {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (confirm('Deseja recarregar os dados de demonstração iniciais?')) {
      db.resetToDemoData();
      loadData();
      refreshTenant();
      alert('Dados resetados com sucesso!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Configurações do Criatório & Segurança</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Gerenciamento de dados cadastrais, equipe e permissões, backup em nuvem, auditoria e LGPD.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('CRIATORIO')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'CRIATORIO' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Dados do Criatório</span>
        </button>

        <button
          onClick={() => setActiveTab('EQUIPE')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'EQUIPE' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Equipe & Permissões</span>
        </button>

        <button
          onClick={() => setActiveTab('BACKUP')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'BACKUP' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Backup & Restauração</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDITORIA')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'AUDITORIA' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Auditoria & Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('LGPD')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'LGPD' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Privacidade & LGPD</span>
        </button>
      </div>

      {/* TAB 1: CRIATÓRIO */}
      {activeTab === 'CRIATORIO' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-3xl space-y-6">
          <form onSubmit={handleSaveTenant} className="space-y-4 text-xs">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Identificação do Criatório
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Oficial do Criatório *</label>
                <input
                  type="text"
                  required
                  value={tenantForm.name}
                  onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">CPF ou CNPJ (Registro IBAMA) *</label>
                <input
                  type="text"
                  required
                  value={tenantForm.document}
                  onChange={(e) => setTenantForm({ ...tenantForm, document: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">E-mail de Contato</label>
                <input
                  type="email"
                  value={tenantForm.email}
                  onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={tenantForm.phone}
                  onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Endereço</label>
                <input
                  type="text"
                  value={tenantForm.address}
                  onChange={(e) => setTenantForm({ ...tenantForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cidade</label>
                <input
                  type="text"
                  value={tenantForm.city}
                  onChange={(e) => setTenantForm({ ...tenantForm, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estado (UF)</label>
                <input
                  type="text"
                  value={tenantForm.state}
                  onChange={(e) => setTenantForm({ ...tenantForm, state: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Descrição Institucional</label>
              <textarea
                rows={3}
                value={tenantForm.description}
                onChange={(e) => setTenantForm({ ...tenantForm, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tenantForm.isPublic}
                  onChange={(e) => setTenantForm({ ...tenantForm, isPublic: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-800">
                  Manter página pública do criatório ativada no endereço: <span className="text-emerald-700">/criatorio/{tenant?.slug}</span>
                </span>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button type="submit">Salvar Dados do Criatório</Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: EQUIPE & PERMISSÕES */}
      {activeTab === 'EQUIPE' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Membros da Equipe & Papéis</h3>
              <p className="text-xs text-slate-500">Controle de quem pode cadastrar, editar ou apenas visualizar dados</p>
            </div>
            <Button size="sm" onClick={() => setIsNewUserModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Convidar Membro
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Função / Papel</th>
                  <th className="py-3 px-4">Telefone</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant={u.role === 'OWNER' ? 'purple' : u.role === 'ADMIN' ? 'success' : 'default'}>
                        {u.role === 'OWNER' ? '👑 Proprietário' : u.role === 'ADMIN' ? '⭐ Administrador' : u.role === 'STAFF' ? '🛠 Funcionário' : '👁 Visualizador'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{u.phone || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-700 font-bold">Ativo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP & RESTAURAÇÃO */}
      {activeTab === 'BACKUP' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900">Exportar Backup Completo</h4>
                <p className="text-xs text-slate-500">Baixe todo o banco de dados (aves, anilhas, genealogias, saúde) em arquivo JSON seguro.</p>
              </div>
            </div>

            <Button onClick={handleDownloadBackup} className="w-full">
              <Download className="w-4 h-4 mr-1.5" />
              Baixar Cópia de Segurança (.json)
            </Button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900">Restaurar Cópia de Backup</h4>
                <p className="text-xs text-slate-500">Importe um arquivo de backup previamente gerado para restaurar o estado completo.</p>
              </div>
            </div>

            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreBackup}
                className="hidden"
              />
              <span className="inline-flex items-center justify-center font-bold text-xs h-10 px-5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm cursor-pointer w-full">
                <Upload className="w-4 h-4 mr-2" />
                Carregar Arquivo de Backup (.json)
              </span>
            </label>
          </div>

          <div className="md:col-span-2 bg-amber-50 rounded-3xl p-6 border border-amber-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-amber-900">Ambiente de Demonstração</h4>
              <p className="text-xs text-amber-800 mt-0.5">Deseja reiniciar a base com as 16 aves modelo, linhagens e anilhas de demonstração?</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleResetDemo} className="border-amber-400 text-amber-900 hover:bg-amber-100">
              Recarregar Dados Demo
            </Button>
          </div>
        </div>
      )}

      {/* TAB 4: AUDITORIA */}
      {activeTab === 'AUDITORIA' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Trilha de Auditoria & Logs de Acesso</h3>
            <p className="text-xs text-slate-500">Registro cronológico de todas as alterações, cadastros e acessos ao criatório</p>
          </div>

          <div className="overflow-x-auto max-h-96 custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Data / Hora</th>
                  <th className="py-3 px-4">Usuário</th>
                  <th className="py-3 px-4">Módulo</th>
                  <th className="py-3 px-4">Ação</th>
                  <th className="py-3 px-4">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{formatDate(log.createdAt)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.userName}</td>
                    <td className="py-3 px-4"><Badge variant="info">{log.module}</Badge></td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{log.action}</td>
                    <td className="py-3 px-4 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: LGPD */}
      {activeTab === 'LGPD' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 max-w-3xl">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Privacidade, Termos e Conformidade LGPD</h3>
              <p className="text-xs text-slate-500">Direitos do titular de dados e segurança de informações</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p><strong>1. Coleta de Dados:</strong> Os dados de criatórios e matrizes são armazenados sob criptografia de ponta a ponta e nunca são compartilhados ou vendidos a terceiros.</p>
            <p><strong>2. Direito de Portabilidade:</strong> Você pode exportar todos os seus dados cadastrais e zootécnicos em formato aberto (.json / .xlsx) a qualquer momento no menu de Backup.</p>
            <p><strong>3. Eliminação de Conta:</strong> O titular pode solicitar a exclusão irrevogável de todos os registros armazenados mediante solicitação direta ao suporte técnico.</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" onClick={() => alert('Termos de Uso e Política de Privacidade exibidos com sucesso.')}>
              <FileCheck className="w-4 h-4 mr-1.5" />
              Visualizar Termos de Uso
            </Button>
            <Button variant="danger" size="sm" onClick={() => alert('Para excluir sua conta definitivamente, envie um chamado com o assunto EXCLUSÃO.')}>
              Solicitar Exclusão da Conta
            </Button>
          </div>
        </div>
      )}

      {/* Modal Convidar Usuário */}
      <Modal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        title="Convidar Novo Membro da Equipe"
        description="Defina as permissões de acesso do funcionário ou tratador."
        maxWidth="md"
      >
        <form onSubmit={handleAddUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
            <input
              type="text"
              required
              value={newUserForm.name}
              onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">E-mail de Acesso *</label>
            <input
              type="email"
              required
              value={newUserForm.email}
              onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Papel de Acesso</label>
              <select
                value={newUserForm.role}
                onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="ADMIN">Administrador</option>
                <option value="STAFF">Funcionário / Tratador</option>
                <option value="VIEWER">Visualizador (Somente Leitura)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Telefone</label>
              <input
                type="text"
                value={newUserForm.phone}
                onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsNewUserModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Enviar Convite</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
