import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as XLSX from "xlsx";
import { Bird, Ring } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

export function formatDate(dateInput?: any): string {
  if (!dateInput) return '-';
  try {
    if (typeof dateInput === 'object') {
      if (typeof dateInput.toDate === 'function') {
        return dateInput.toDate().toLocaleDateString('pt-BR');
      }
      if (typeof dateInput.seconds === 'number') {
        return new Date(dateInput.seconds * 1000).toLocaleDateString('pt-BR');
      }
      if (dateInput instanceof Date) {
        return isNaN(dateInput.getTime()) ? '-' : dateInput.toLocaleDateString('pt-BR');
      }
    }
    const str = String(dateInput);
    const parts = str.split('T')[0].split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-BR');
    }
    return str;
  } catch {
    return '-';
  }
}

export function calculateAge(birthDateStr?: string): string {
  if (!birthDateStr) return 'Não informada';
  try {
    const birth = new Date(birthDateStr);
    const now = new Date();
    
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      days += 30;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years > 0) {
      return `${years} ano${years > 1 ? 's' : ''}${months > 0 ? ` e ${months} m` : ''}`;
    }
    if (months > 0) {
      return `${months} mês${months > 1 ? 'es' : ''}${days > 0 ? ` e ${days} d` : ''}`;
    }
    return `${days} dia${days !== 1 ? 's' : ''}`;
  } catch {
    return '-';
  }
}

export function maskRingNumber(ringNumber: string): string {
  if (!ringNumber) return '---';
  if (ringNumber.length <= 6) return ringNumber;
  const start = ringNumber.slice(0, 4);
  const end = ringNumber.slice(-2);
  return `${start}****${end}`;
}

export function calculateInbreedingRisk(birdA?: Bird, birdB?: Bird): {
  coefficient: number;
  level: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  message: string;
} {
  if (!birdA || !birdB) {
    return { coefficient: 0, level: 'NONE', message: 'Sem dados suficientes' };
  }

  // Same parents
  if (birdA.fatherName && birdB.fatherName && birdA.fatherName === birdB.fatherName && birdA.motherName && birdB.motherName && birdA.motherName === birdB.motherName) {
    return {
      coefficient: 0.25,
      level: 'CRITICAL',
      message: 'Irmãos completos (mesmo pai e mesma mãe). Alto risco de homozigose deletéria.'
    };
  }

  // Half siblings (same father or same mother)
  if ((birdA.fatherName && birdB.fatherName && birdA.fatherName === birdB.fatherName) || 
      (birdA.motherName && birdB.motherName && birdA.motherName === birdB.motherName)) {
    return {
      coefficient: 0.125,
      level: 'HIGH',
      message: 'Meio-irmãos (mesmo pai ou mesma mãe). Cruzamento com consanguinidade moderada/alta.'
    };
  }

  // Parent x Offspring
  if (birdA.name === birdB.fatherName || birdA.name === birdB.motherName || birdB.name === birdA.fatherName || birdB.name === birdA.motherName) {
    return {
      coefficient: 0.25,
      level: 'CRITICAL',
      message: 'Cruzamento direto entre Pai/Mãe e Filho(a). Não recomendado sem acompanhamento genético estrito.'
    };
  }

  return {
    coefficient: 0.0,
    level: 'NONE',
    message: 'Sem parentesco direto detectado nas gerações cadastradas. Cruzamento seguro.'
  };
}

export function exportToExcel(data: any[], fileName: string, sheetName = 'Dados') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function exportToCsv(data: any[], fileName: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
