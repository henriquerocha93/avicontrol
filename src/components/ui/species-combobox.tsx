'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, Plus, Sparkles, Search, X } from 'lucide-react';
import { SYSTEM_SPECIES, POPULAR_QUICK_SPECIES, getRegisteredSpecies } from '@/lib/constants/species';
import { Bird } from '@/types';

interface SpeciesComboboxProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  plantelBirds?: Bird[];
  className?: string;
  inputClassName?: string;
  showQuickChips?: boolean;
}

export function SpeciesCombobox({
  value,
  onChange,
  label = 'Espécie',
  placeholder = 'Ex: Canário-da-terra (Sicalis flaveola)',
  required = false,
  plantelBirds = [],
  className = '',
  inputClassName = '',
  showQuickChips = false,
}: SpeciesComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const datalistId = useId();

  // Obter espécies únicas do plantel do criatório
  const plantelSpecies = Array.from(
    new Set(plantelBirds.map((b) => b.species?.trim()).filter(Boolean))
  ) as string[];

  // Lista consolidada de espécies cadastradas
  const allRegisteredSpecies = getRegisteredSpecies(plantelSpecies);

  // Filtragem
  const filteredSpecies = allRegisteredSpecies.filter((sp) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return sp.toLowerCase().includes(term);
  });

  const isCustomValue =
    Boolean(value.trim()) &&
    !allRegisteredSpecies.some(
      (sp) => sp.toLowerCase() === value.trim().toLowerCase()
    );

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (specie: string) => {
    onChange(specie);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setSearchTerm(val);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
            (Selecione da lista ou digite a sua)
          </span>
        </label>
      )}

      {/* Input com botão dropdown */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          list={datalistId}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setSearchTerm(value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          className={`w-full px-3 py-2 pr-9 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00c853]/20 focus:border-[#00c853] transition ${inputClassName}`}
        />

        {/* Botão para abrir/fechar opções */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setSearchTerm('');
              inputRef.current?.focus();
            }
          }}
          className="absolute right-2 p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          title="Ver espécies cadastradas"
          tabIndex={-1}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-600' : ''
            }`}
          />
        </button>

        {/* Datalist nativo para compatibilidade com navegadores */}
        <datalist id={datalistId}>
          {allRegisteredSpecies.slice(0, 50).map((sp) => (
            <option key={sp} value={sp} />
          ))}
        </datalist>
      </div>

      {/* Dropdown Customizado com busca e destaque */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-80 flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header do dropdown */}
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Espécies Cadastradas no Sistema
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Opção se digitou espécie personalizada não listada */}
          {value.trim() && isCustomValue && (
            <div className="p-2 border-b border-emerald-100 bg-emerald-50/50">
              <button
                type="button"
                onClick={() => {
                  onChange(value.trim());
                  setIsOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg bg-emerald-100/70 hover:bg-emerald-200/80 text-emerald-900 text-xs font-bold flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="truncate">
                  Usar <strong>&quot;{value.trim()}&quot;</strong> (Espécie personalizada)
                </span>
              </button>
            </div>
          )}

          {/* Lista scrollável */}
          <div className="overflow-y-auto divide-y divide-slate-50 flex-1 custom-scrollbar text-xs">
            {/* Espécies do plantel do usuário (se houver) */}
            {plantelSpecies.length > 0 && !searchTerm && (
              <div className="p-2 bg-emerald-50/30">
                <span className="text-[10px] font-extrabold uppercase text-emerald-800 px-2 py-0.5 mb-1 block">
                  ★ Do seu Plantel
                </span>
                {plantelSpecies.map((sp) => (
                  <button
                    key={`plantel-${sp}`}
                    type="button"
                    onClick={() => handleSelect(sp)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition hover:bg-emerald-100/60 ${
                      value === sp ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">{sp}</span>
                    {value === sp && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}

            {/* Todas as espécies cadastradas */}
            <div className="p-1">
              {filteredSpecies.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  <p className="text-xs">Nenhuma espécie encontrada com &quot;{searchTerm}&quot;</p>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(searchTerm);
                      setIsOpen(false);
                    }}
                    className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    Usar &quot;{searchTerm}&quot; como nova espécie
                  </button>
                </div>
              ) : (
                filteredSpecies.map((sp) => {
                  const isSelected = value === sp;
                  return (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => handleSelect(sp)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between text-xs transition hover:bg-slate-100 ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      <span className="truncate">{sp}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Dica no rodapé */}
          <div className="p-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 text-center">
            Dica: Digite livremente caso sua espécie não esteja na lista.
          </div>
        </div>
      )}

      {/* Chips rápidos opcionais para preenchimento imediato */}
      {showQuickChips && (
        <div className="mt-1.5 flex flex-wrap gap-1 items-center">
          <span className="text-[10px] text-slate-400 font-medium">Mais comuns:</span>
          {POPULAR_QUICK_SPECIES.slice(0, 5).map((sp) => {
            const shortName = sp.split('(')[0].trim();
            const isCurr = value === sp || value === shortName;
            return (
              <button
                key={sp}
                type="button"
                onClick={() => onChange(sp)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                  isCurr
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {shortName}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
