'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Bird, 
  Heart, 
  Activity, 
  CircleDot, 
  Grid3X3, 
  Pill,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { exportToExcel, exportToCsv, formatDate } from '@/lib/utils';

export default function RelatoriosPage() {
  const { tenant } = useAuth();
  const [selectedReport, setSelectedReport] = useState('plantel');

  const birds = db.getBirds(tenant?.id);
  const rings = db.getRings(tenant?.id);
  const cages = db.getCages(tenant?.id);
  const pairs = db.getPairs(tenant?.id);
  const diseases = db.getDiseases(tenant?.id);
  const treatments = db.getTreatments(tenant?.id);

  const reportsList = [
    { id: 'plantel', name: 'Relatório Geral do Plantel de Aves', icon: Bird, count: birds.length },
    { id: 'especies', name: 'Plantel Agrupado por Espécie', icon: Bird, count: birds.length },
    { id: 'anilhas', name: 'Inventário Oficial de Anilhas', icon: CircleDot, count: rings.length },
    { id: 'gaiolas', name: 'Relatório de Gaiolas & Lotação', icon: Grid3X3, count: cages.length },
    { id: 'reproducao', name: 'Relatório de Reprodução & Ninhadas', icon: Heart, count: pairs.length },
    { id: 'saude', name: 'Prontuário Sanitário & Ocorrências', icon: Activity, count: diseases.length },
    { id: 'medicamentos', name: 'Histórico de Fármacos Administrados', icon: Pill, count: treatments.length },
  ];

  const handleExportExcel = () => {
    let data: any[] = [];
    let title = `Relatorio_${selectedReport}_${tenant?.slug || 'birdpro'}`;

    if (selectedReport === 'plantel' || selectedReport === 'especies') {
      data = birds.map(b => ({
        Nome: b.name,
        Anilha: b.ringNumber,
        Especie: b.species,
        Sexo: b.sex === 'MALE' ? 'Macho' : b.sex === 'FEMALE' ? 'Fêmea' : 'Indefinido',
        Status: b.status,
        Nascimento: b.birthDate || '',
        Gaiola: b.cageId || '',
        Mutacao: b.mutation || '',
        Pai: b.fatherName || '',
        Mae: b.motherName || ''
      }));
    } else if (selectedReport === 'anilhas') {
      data = rings.map(r => ({
        Anilha: r.number,
        Ano: r.year,
        Tipo: r.type,
        Status: r.status,
        Ave: r.birdName || 'Disponível',
        Origem: r.origin || ''
      }));
    } else if (selectedReport === 'gaiolas') {
      data = cages.map(c => ({
        Codigo: c.code,
        Nome: c.name,
        Setor: c.location,
        Tipo: c.type,
        Capacidade: c.capacity,
        Status: c.status
      }));
    } else if (selectedReport === 'reproducao') {
      data = pairs.map(p => ({
        Codigo: p.code,
        Nome: p.name,
        Macho: `${p.maleName} (${p.maleRing})`,
        Femea: `${p.femaleName} (${p.femaleRing})`,
        Posturas: p.clutchesCount,
        TotalOvos: p.totalEggs,
        FilhotesEclodidos: p.hatchedCount,
        Status: p.status
      }));
    } else if (selectedReport === 'saude') {
      data = diseases.map(d => ({
        Ave: `${d.birdName} (${d.birdRing})`,
        Doenca: d.diseaseName,
        Sintomas: d.symptoms,
        Diagnostico: d.diagnosis,
        Data: formatDate(d.diagnosedDate),
        Veterinario: d.veterinarian || '',
        Resultado: d.result
      }));
    } else if (selectedReport === 'medicamentos') {
      data = treatments.map(t => ({
        Ave: `${t.birdName} (${t.birdRing})`,
        Medicamento: t.medicationName,
        Dosagem: t.dosage,
        Frequencia: t.frequency,
        Inicio: formatDate(t.startDate),
        Fim: formatDate(t.endDate),
        Responsavel: t.responsiblePerson,
        Status: t.status
      }));
    }

    exportToExcel(data, title);
  };

  const handleExportCsv = () => {
    let data = birds.map(b => ({
      Nome: b.name,
      Anilha: b.ringNumber,
      Especie: b.species,
      Sexo: b.sex,
      Status: b.status
    }));
    exportToCsv(data, `Relatorio_${selectedReport}_${tenant?.slug || 'birdpro'}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Relatórios & Exportações</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Emissão de relatórios zootécnicos, inventários de anilhas, histórico sanitário e dados para órgãos reguladores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
            Exportar Excel (.xlsx)
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="w-4 h-4 mr-1.5" />
            Exportar CSV
          </Button>
          <Button size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" />
            Imprimir Relatório
          </Button>
        </div>
      </div>

      {/* Select Report Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {reportsList.map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;
          return (
            <button
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
              <div>
                <p className="text-xs font-bold leading-tight">{rep.name.split(' ')[0]} {rep.name.split(' ')[1]}</p>
                <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {rep.count} registros
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Report Data Preview Table */}
      <div id="printable-report" className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 print:p-0 print:border-none">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              {reportsList.find(r => r.id === selectedReport)?.name}
            </h3>
            <p className="text-xs text-slate-500">
              {tenant?.name} • CNPJ/CPF: {tenant?.document} • Emitido em: {formatDate(new Date().toISOString())}
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
            Documento Oficial BIRDPRO
          </span>
        </div>

        {/* Dynamic Table based on selected report */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                {selectedReport === 'plantel' || selectedReport === 'especies' ? (
                  <>
                    <th className="py-3 px-4">Nome da Ave</th>
                    <th className="py-3 px-4">Anilha</th>
                    <th className="py-3 px-4">Espécie</th>
                    <th className="py-3 px-4">Sexo</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Gaiola</th>
                    <th className="py-3 px-4">Ascendência</th>
                  </>
                ) : selectedReport === 'anilhas' ? (
                  <>
                    <th className="py-3 px-4">Número da Anilha</th>
                    <th className="py-3 px-4">Ano</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Ave Vinculada</th>
                    <th className="py-3 px-4">Origem</th>
                  </>
                ) : selectedReport === 'reproducao' ? (
                  <>
                    <th className="py-3 px-4">Código / Nome</th>
                    <th className="py-3 px-4">Macho (♂)</th>
                    <th className="py-3 px-4">Fêmea (♀)</th>
                    <th className="py-3 px-4">Posturas</th>
                    <th className="py-3 px-4">Total Ovos</th>
                    <th className="py-3 px-4">Filhotes Eclodidos</th>
                    <th className="py-3 px-4">Status</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Detalhes</th>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedReport === 'plantel' || selectedReport === 'especies' ? (
                birds.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{b.name}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">{b.ringNumber}</td>
                    <td className="py-3 px-4 text-slate-600">{b.species}</td>
                    <td className="py-3 px-4 font-semibold">{b.sex === 'MALE' ? '♂ Macho' : b.sex === 'FEMALE' ? '♀ Fêmea' : '? Indefinido'}</td>
                    <td className="py-3 px-4">{b.status}</td>
                    <td className="py-3 px-4">{b.cageId || '-'}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{b.fatherName ? `Pai: ${b.fatherName}` : 'Origem Direta'}</td>
                  </tr>
                ))
              ) : selectedReport === 'anilhas' ? (
                rings.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.number}</td>
                    <td className="py-3 px-4">{r.year}</td>
                    <td className="py-3 px-4 text-slate-600">{r.type}</td>
                    <td className="py-3 px-4">{r.status}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{r.birdName || 'Disponível'}</td>
                    <td className="py-3 px-4 text-slate-500">{r.origin}</td>
                  </tr>
                ))
              ) : selectedReport === 'reproducao' ? (
                pairs.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{p.name} ({p.code})</td>
                    <td className="py-3 px-4 text-blue-800 font-semibold">{p.maleName} ({p.maleRing})</td>
                    <td className="py-3 px-4 text-rose-800 font-semibold">{p.femaleName} ({p.femaleRing})</td>
                    <td className="py-3 px-4">{p.clutchesCount}</td>
                    <td className="py-3 px-4">{p.totalEggs}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{p.hatchedCount}</td>
                    <td className="py-3 px-4">{p.status}</td>
                  </tr>
                ))
              ) : (
                treatments.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{t.medicationName}</td>
                    <td className="py-3 px-4 text-slate-600">Ave: {t.birdName} • Dose: {t.dosage}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(t.startDate)}</td>
                    <td className="py-3 px-4">{t.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
