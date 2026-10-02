'use client'

import React, { Suspense } from 'react'
import CheckoutPage from '../checkout/page'

export default function ContratarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    }>
      <CheckoutPage />
    </Suspense>
  )
}
