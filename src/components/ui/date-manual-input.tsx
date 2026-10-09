'use client'

import React, { useState, useEffect } from 'react'

export interface DateManualInputProps {
  value?: string // Aceita YYYY-MM-DD ou DD/MM/AAAA
  onChange: (value: string) => void // Retorna YYYY-MM-DD quando completa ou valor bruto
  placeholder?: string
  className?: string
  required?: boolean
  disabled?: boolean
  id?: string
  name?: string
  autoFocus?: boolean
}

// Converte YYYY-MM-DD para DD/MM/AAAA
export function isoToDisplay(isoStr?: string): string {
  if (!isoStr) return ''
  const clean = isoStr.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split('-')
    return `${d}/${m}/${y}`
  }
  return clean
}

// Converte DD/MM/AAAA para YYYY-MM-DD
export function displayToIso(dispStr?: string): string {
  if (!dispStr) return ''
  const clean = dispStr.trim()
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) {
    const [d, m, y] = clean.split('/')
    return `${y}-${m}-${d}`
  }
  return clean
}

/**
 * Campo de data com preenchimento 100% manual por teclado numérico.
 * Evita o picker/agenda nativo em dispositivos móveis, permitindo digitação ágil (DD/MM/AAAA).
 */
export function DateManualInput({
  value = '',
  onChange,
  placeholder = 'DD/MM/AAAA',
  className = '',
  required = false,
  disabled = false,
  id,
  name,
  autoFocus = false
}: DateManualInputProps) {
  const [displayValue, setDisplayValue] = useState(() => isoToDisplay(value))

  useEffect(() => {
    setDisplayValue(isoToDisplay(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // Permite apenas dígitos
    const digits = raw.replace(/\D/g, '').slice(0, 8)

    // Formata com máscara DD/MM/AAAA
    let masked = digits
    if (digits.length > 2 && digits.length <= 4) {
      masked = `${digits.slice(0, 2)}/${digits.slice(2)}`
    } else if (digits.length > 4) {
      masked = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
    }

    setDisplayValue(masked)

    if (masked.length === 10) {
      // Converte data final DD/MM/AAAA para padrão ISO YYYY-MM-DD
      const iso = displayToIso(masked)
      onChange(iso)
    } else if (masked.length === 0) {
      onChange('')
    } else {
      onChange(masked)
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9/]*"
      maxLength={10}
      id={id}
      name={name}
      disabled={disabled}
      required={required}
      autoFocus={autoFocus}
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      className={className}
    />
  )
}
