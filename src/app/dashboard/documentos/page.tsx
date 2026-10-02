'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  ExternalLink, 
  File, 
  Bird, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { BirdDocument, Bird as BirdType } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default function DocumentosPage() {
  const { tenant } = useAuth();
  const [documents, setDocuments] = useState<BirdDocument[]>([]);
  const [birds, setBirds] = useState<BirdType[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    birdId: '',
    category: 'SEXING' as BirdDocument['category'],
    fileName: 'laudo_oficial.pdf',
    fileType: 'application/pdf',
    fileSize: '1.4 MB',
    fileUrl: '/docs/laudo-exemplo.pdf',
    issueDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const loadData = () => {
    setDocuments(db.getDocuments(tenant?.id));
    setBirds(db.getBirds(tenant?.id));
  };

  useEffect(() => {
    loadData();
  }, [tenant?.id]);

  const filtered = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.birdName && d.birdName.toLowerCase().includes(search.toLowerCase())) ||
      d.fileName.toLowerCase().includes(search.toLowerCase());

    const matchesCat = !selectedCat || d.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const bird = birds.find(b => b.id === form.birdId);

    db.addDocument({
      tenantId: tenant?.id || 'tenant-demo-01',
      title: form.title,
      birdId: bird?.id,
      birdName: bird?.name,
      category: form.category,
      fileName: form.fileName,
      fileType: form.fileType,
      fileSize: form.fileSize,
      fileUrl: form.fileUrl,
      issueDate: form.issueDate,
      notes: form.notes
    });

    loadData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este documento?')) {
      db.deleteDocument(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Documentos & Laudos Oficiais</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {documents.length} Arquivos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Repositório em nuvem para notas fiscais, GTAs, certidões de nascimento, laudos de DNA e exames.
          </p>
        </div>

        <Button size="sm" onClick={() => {
          setForm({
            title: '',
            birdId: birds[0]?.id || '',
            category: 'SEXING',
            fileName: 'documento_oficial.pdf',
            fileType: 'application/pdf',
            fileSize: '1.2 MB',
            fileUrl: '/docs/documento.pdf',
            issueDate: new Date().toISOString().split('T')[0],
            notes: ''
          });
          setIsModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-1.5" />
          Anexar Novo Documento
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar documento por título, ave ou nome do arquivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
        >
          <option value="">Todas as Categorias</option>
          <option value="INVOICE">Nota Fiscal / GTA</option>
          <option value="ORIGIN">Certificado de Origem</option>
          <option value="SEXING">Laudo de Sexagem DNA</option>
          <option value="GENETICS">Laudo Genômico</option>
          <option value="EXAM">Exames Laboratoriais</option>
          <option value="CERTIFICATE">Certificado de Campeão</option>
        </select>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => (
          <div key={doc.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl">
                  <FileText className="w-6 h-6" />
                </div>
                <Badge variant="info">{doc.category}</Badge>
              </div>

              <h4 className="font-bold text-sm text-slate-900 mt-3 leading-snug">{doc.title}</h4>
              
              {doc.birdName && (
                <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 mt-1">
                  <Bird className="w-3.5 h-3.5" />
                  {doc.birdName}
                </p>
              )}

              <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                <p>{doc.fileName} • {doc.fileSize}</p>
                <p>Emissão: {formatDate(doc.issueDate)}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Arquivo Seguro
              </span>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => alert(`Iniciando download seguro de ${doc.fileName}...`)}
                  className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100"
                  title="Baixar Arquivo"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Anexar Documento ou Laudo Oficial"
        description="Selecione a categoria e vincule a uma ave do criatório."
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Título do Documento *</label>
            <input
              type="text"
              required
              placeholder="Ex: Nota Fiscal de Compra, Laudo PCR"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Ave Vinculada</label>
              <select
                value={form.birdId}
                onChange={(e) => setForm({ ...form, birdId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="">Documento Geral do Criatório</option>
                {birds.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.ringNumber})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="INVOICE">Nota Fiscal / GTA</option>
                <option value="ORIGIN">Certificado de Origem</option>
                <option value="SEXING">Laudo de Sexagem DNA</option>
                <option value="GENETICS">Laudo Genômico</option>
                <option value="EXAM">Exames Laboratoriais</option>
                <option value="CERTIFICATE">Certificado de Torneio</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-2">
            <File className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-600 font-semibold">Simular envio de arquivo PDF/Imagem</p>
            <input
              type="text"
              value={form.fileName}
              onChange={(e) => setForm({ ...form, fileName: e.target.value })}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Documento</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
