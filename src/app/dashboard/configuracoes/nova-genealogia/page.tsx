'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { NovaGenealogiaEnvironment } from '@/components/genealogy/nova-genealogia-environment'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Nova Genealogia Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 bg-white border border-slate-200 rounded-xl shadow text-center space-y-4">
          <h2 className="text-sm font-bold text-slate-800">Ambiente de Genealogia</h2>
          <p className="text-xs text-slate-500">Recarregando árvore genealógica...</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-[#009fe3] text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            Tentar Novamente
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function NovaGenealogiaPage() {
  return (
    <ErrorBoundary>
      <NovaGenealogiaEnvironment showBackButton={true} />
    </ErrorBoundary>
  )
}
