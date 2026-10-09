'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  RotateCcw,
  ChevronLeft,
  User as UserIcon,
  Sliders,
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  Layers,
  SlidersHorizontal,
  Link2,
  FolderUp,
  Camera,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react'
import { db } from '@/lib/db'
import { Tenant, BreederOwner, TenantVisualConfig, Bird } from '@/types'
import { BadgeFrontAndBack } from '@/components/genealogy/badge-front-and-back'
import { DateManualInput } from '@/components/ui/date-manual-input'

export default function CriatorioConfigPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Credentials (Login & Password) State
  const [loginEmail, setLoginEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSavingCredentials, setIsSavingCredentials] = useState(false)
  const [credentialMessage, setCredentialMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Image Selector Modal State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [activeImageField, setActiveImageField] = useState<keyof TenantVisualConfig | null>(null)
  const [activeImageTitle, setActiveImageTitle] = useState('')
  const [imageModalTab, setImageModalTab] = useState<'upload' | 'presets' | 'url'>('upload')
  const [customImageUrl, setCustomImageUrl] = useState('')
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [dragOverField, setDragOverField] = useState<string | null>(null)

  // Owner Modal State
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false)
  const [editingOwnerIndex, setEditingOwnerIndex] = useState<number | null>(null)
  const [ownerForm, setOwnerForm] = useState<BreederOwner>({
    id: '',
    name: '',
    cpf: '',
    city: '',
    state: 'SP',
    avatarUrl: ''
  })

  useEffect(() => {
    let targetTenantId: string | undefined
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('birdpro_current_user')
        if (raw) {
          const u = JSON.parse(raw)
          if (u?.tenantId) targetTenantId = u.tenantId
        }
      } catch {}
    }
    const t = db.getTenant(targetTenantId)
    if (t) {
      // Sanitize any legacy demo/mock data if present in state
      const sanitized: Tenant = {
        ...t,
        name: t.name?.includes('Madruguinha') ? '' : (t.name || ''),
        slug: t.slug === 'madruguinha' ? '' : (t.slug || ''),
        document: (t.document === '022.034.960-61' || t.document === '000.000.000-00') ? '' : (t.document || ''),
        email: t.email === 'luis.henrique.schreiber@hotmail.com' ? '' : (t.email || ''),
        phone: t.phone === '(55) 9134-3265' ? '' : (t.phone || ''),
        cellphone: t.cellphone === '(55) 9 9134-3265' ? '' : (t.cellphone || ''),
        whatsapp: (t.whatsapp === '5555991343265' || t.whatsapp === '(55) 9 9134-3265') ? '' : (t.whatsapp || ''),
        address: t.address === 'Rua das violetas' ? '' : (t.address || ''),
        addressNumber: t.addressNumber === '109' ? '' : (t.addressNumber || ''),
        neighborhood: t.neighborhood === 'universitario' ? '' : (t.neighborhood || ''),
        city: t.city === 'IJUI' ? '' : (t.city || ''),
        state: (t.state === 'RS' && t.city === 'IJUI') ? '' : (t.state || ''),
        zipCode: (t.zipCode === '98700-000' || t.zipCode === '98700 000') ? '' : (t.zipCode || ''),
        registryNumber: t.registryNumber === '4719754' ? '' : (t.registryNumber || ''),
        facebook: t.facebook?.includes('MADRUGUINHA') ? '' : (t.facebook || ''),
        instagram: t.instagram?.includes('MADRUGUINHA') ? '' : (t.instagram || ''),
        website: t.website?.includes('madruguinha') ? '' : (t.website || ''),
        owners: (t.owners || []).filter(o => !o.name?.includes('Madruguinha') && !o.nickname?.includes('Madruguinha'))
      }
      setTenant(sanitized)

      // Initialize login email from session or tenant
      try {
        const rawSession = typeof window !== 'undefined' ? localStorage.getItem('birdpro_current_user') : null
        if (rawSession) {
          const sessionUser = JSON.parse(rawSession)
          if (sessionUser?.email) setLoginEmail(sessionUser.email)
        } else if (sanitized.email) {
          setLoginEmail(sanitized.email)
        }
      } catch {}
    }
  }, [])

  if (!tenant) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00c853]"></div>
      </div>
    )
  }

  const handleInputChange = (field: keyof Tenant, value: any) => {
    setTenant(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleVisualConfigChange = (field: keyof TenantVisualConfig, value: any) => {
    setTenant(prev => {
      if (!prev) return null
      const currentVc = prev.visualConfig || {}
      const updatedVc: TenantVisualConfig = {
        ...currentVc,
        [field]: value
      }

      // Sincronizar pares de propriedades legadas e atuais para compatibilidade total
      const aliasMap: Record<string, string> = {
        treeTextColor: 'textColorGenealogy',
        textColorGenealogy: 'treeTextColor',
        labelFrontTextColor: 'textColorLabelFront',
        textColorLabelFront: 'labelFrontTextColor',
        labelBackTextColor: 'textColorLabelBack',
        textColorLabelBack: 'labelBackTextColor',
        fieldBgColor: 'colorField',
        colorField: 'fieldBgColor',
        fieldTextColor: 'colorTextField',
        colorTextField: 'fieldTextColor',
        maleColor: 'colorPaletteMale',
        colorPaletteMale: 'maleColor',
        femaleColor: 'colorPaletteFemale',
        colorPaletteFemale: 'femaleColor',
        maleTextColor: 'colorTextPaletteMale',
        colorTextPaletteMale: 'maleTextColor',
        femaleTextColor: 'colorTextPaletteFemale',
        colorTextPaletteFemale: 'femaleTextColor',
        malePaletteDisplay: 'levelDisplayPaletteGenealogy',
        levelDisplayPaletteGenealogy: 'malePaletteDisplay',
        femalePaletteDisplay: 'levelDisplayPaletteLabel',
        levelDisplayPaletteLabel: 'femalePaletteDisplay',
        printCertificateTitle: 'printTitleCertificate',
        printTitleCertificate: 'printCertificateTitle',
        printUpToSixthGeneration: 'printSixthGeneration',
        printSixthGeneration: 'printUpToSixthGeneration'
      }

      const alias = aliasMap[field as string]
      if (alias) {
        (updatedVc as any)[alias] = value
      }

      return {
        ...prev,
        visualConfig: updatedVc
      }
    })
  }

  const handleCepSearch = async () => {
    if (!tenant.zipCode && !tenant.cep) return
    const cleanCep = (tenant.zipCode || tenant.cep || '').replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      alert('Por favor, informe um CEP válido com 8 dígitos.')
      return
    }

    setIsLoadingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setTenant(prev => {
          if (!prev) return null
          return {
            ...prev,
            address: data.logradouro || prev.address,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state
          }
        })
      } else {
        alert('CEP não encontrado.')
      }
    } catch (e) {
      console.error(e)
      alert('Erro ao buscar o CEP.')
    } finally {
      setIsLoadingCep(false)
    }
  }

  const handleOpenOwnerModal = (owner?: BreederOwner, index?: number) => {
    if (owner && typeof index === 'number') {
      setOwnerForm({ ...owner })
      setEditingOwnerIndex(index)
    } else {
      setOwnerForm({
        id: `own_${Date.now()}`,
        name: '',
        cpf: '',
        city: tenant.city || '',
        state: tenant.state || 'SP',
        avatarUrl: ''
      })
      setEditingOwnerIndex(null)
    }
    setIsOwnerModalOpen(true)
  }

  const handleSaveOwner = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ownerForm.name || !ownerForm.cpf) {
      alert('Nome e CPF são obrigatórios.')
      return
    }

    setTenant(prev => {
      if (!prev) return null
      const updatedOwners = [...(prev.owners || [])]
      if (editingOwnerIndex !== null) {
        updatedOwners[editingOwnerIndex] = ownerForm
      } else {
        updatedOwners.push(ownerForm)
      }
      return { ...prev, owners: updatedOwners }
    })

    setIsOwnerModalOpen(false)
  }

  const handleDeleteOwner = (index: number) => {
    if (confirm('Deseja realmente remover este proprietário?')) {
      setTenant(prev => {
        if (!prev) return null
        const updated = [...(prev.owners || [])]
        updated.splice(index, 1)
        return { ...prev, owners: updated }
      })
    }
  }

  const handleClearOwners = () => {
    if (confirm('Deseja limpar todos os proprietários?')) {
      setTenant(prev => prev ? { ...prev, owners: [] } : null)
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleSaveCredentials = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setCredentialMessage(null)

    const cleanEmail = loginEmail.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setCredentialMessage({ type: 'error', text: 'Por favor, informe um endereço de e-mail de login válido.' })
      return
    }

    if (newPassword) {
      if (newPassword.length < 4) {
        setCredentialMessage({ type: 'error', text: 'A nova senha deve possuir pelo menos 4 caracteres.' })
        return
      }
      if (newPassword !== confirmPassword) {
        setCredentialMessage({ type: 'error', text: 'A confirmação de senha não confere com a nova senha digitada.' })
        return
      }
    }

    setIsSavingCredentials(true)
    try {
      let activeUserId = tenant?.id
      if (typeof window !== 'undefined') {
        const rawSession = localStorage.getItem('birdpro_current_user')
        if (rawSession) {
          const parsed = JSON.parse(rawSession)
          if (parsed?.id) activeUserId = parsed.id
        }
      }

      const res = db.updateUserCredentials(activeUserId || cleanEmail, cleanEmail, newPassword || undefined)
      if (!res.success) {
        setCredentialMessage({ type: 'error', text: res.message })
        setIsSavingCredentials(false)
        return
      }

      // Sync tenant email if updated
      if (tenant && tenant.email !== cleanEmail) {
        setTenant(prev => prev ? { ...prev, email: cleanEmail } : null)
      }

      setCredentialMessage({ type: 'success', text: '✓ Login e senha alterados com sucesso!' })
      setNewPassword('')
      setConfirmPassword('')
      showToast('Credenciais de login salvas com sucesso!')
    } catch (err) {
      console.error('Error saving credentials:', err)
      setCredentialMessage({ type: 'error', text: 'Erro ao atualizar credenciais de acesso.' })
    } finally {
      setIsSavingCredentials(false)
    }
  }

  const processImageFile = (file: File, field: keyof TenantVisualConfig) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, etc.).')
      return
    }
    setIsProcessingImage(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (dataUrl) {
        const img = new Image()
        img.onload = () => {
          const maxWidth = 1200
          const maxHeight = 1200
          let width = img.width
          let height = img.height

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            } else {
              width = Math.round((width * maxHeight) / height)
              height = maxHeight
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)
            const compressed = canvas.toDataURL('image/jpeg', 0.88)
            handleVisualConfigChange(field, compressed)
          } else {
            handleVisualConfigChange(field, dataUrl)
          }
          setIsProcessingImage(false)
          setIsImageModalOpen(false)
          showToast('Imagem importada com sucesso!')
        }
        img.onerror = () => {
          handleVisualConfigChange(field, dataUrl)
          setIsProcessingImage(false)
          setIsImageModalOpen(false)
          showToast('Imagem importada com sucesso!')
        }
        img.src = dataUrl
      }
    }
    reader.readAsDataURL(file)
  }

  const handleOpenImageSelector = (field: keyof TenantVisualConfig, title: string) => {
    setActiveImageField(field)
    setActiveImageTitle(title)
    setCustomImageUrl((vc[field] as string) || '')
    setImageModalTab('upload')
    setIsImageModalOpen(true)
  }

  const handleApplyPresetOrUrl = (url: string) => {
    if (!activeImageField) return
    handleVisualConfigChange(activeImageField, url)
    setIsImageModalOpen(false)
    showToast('Imagem aplicada com sucesso!')
  }

  const handleClearImage = (field: keyof TenantVisualConfig) => {
    handleVisualConfigChange(field, '')
    if (field === 'treeLogoUrl') handleVisualConfigChange('treeLogoScale', 1)
    if (field === 'treeBackgroundUrl') handleVisualConfigChange('treeBackgroundScale', 1)
    if (field === 'labelLogoUrl') handleVisualConfigChange('labelLogoScale', 1)
    if (field === 'labelFrontBackgroundUrl') handleVisualConfigChange('labelFrontScale', 1)
    if (field === 'labelBackBackgroundUrl') handleVisualConfigChange('labelBackScale', 1)
    showToast('Imagem removida.')
  }

  const handleResetColor = (field: keyof TenantVisualConfig, defaultColor: string) => {
    handleVisualConfigChange(field, defaultColor)
  }

  const handleSave = () => {
    if (!tenant) return
    setIsSaving(true)

    // Save credentials if modified
    if ((loginEmail && loginEmail !== tenant.email) || newPassword) {
      try {
        let activeUserId = tenant.id
        if (typeof window !== 'undefined') {
          const rawSession = localStorage.getItem('birdpro_current_user')
          if (rawSession) {
            const parsed = JSON.parse(rawSession)
            if (parsed?.id) activeUserId = parsed.id
          }
        }
        db.updateUserCredentials(activeUserId, loginEmail.trim().toLowerCase(), newPassword || undefined)
      } catch (e) {
        console.error('Error auto-saving credentials:', e)
      }
    }

    setTimeout(() => {
      db.saveTenant(tenant)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('birdpro_db_updated'))
      }
      setIsSaving(false)
      setSavedSuccess(true)
      showToast('Configurações e cores salvas com sucesso!')
      setTimeout(() => setSavedSuccess(false), 4500)
    }, 150)
  }

  const vc = tenant.visualConfig || {}
  const treeTextColor = vc.treeTextColor || vc.textColorGenealogy || '#000000'
  const labelFrontTextColor = vc.labelFrontTextColor || vc.textColorLabelFront || '#000000'
  const labelBackTextColor = vc.labelBackTextColor || vc.textColorLabelBack || '#000000'
  const fieldBgColor = vc.fieldBgColor || vc.colorField || '#ffffff'
  const fieldTextColor = vc.fieldTextColor || vc.colorTextField || '#000000'
  const maleColor = vc.maleColor || vc.colorPaletteMale || '#dbeafe'
  const femaleColor = vc.femaleColor || vc.colorPaletteFemale || '#fce7f3'
  const maleTextColor = vc.maleTextColor || vc.colorTextPaletteMale || '#000000'
  const femaleTextColor = vc.femaleTextColor || vc.colorTextPaletteFemale || '#000000'

  const previewBird: Bird = {
    id: 'preview-bird-01',
    tenantId: tenant.id,
    name: 'CAMPEÃO DE OURO',
    ringNumber: 'SISPASS 2.8 RS 2026',
    species: 'Curió (Sporophila angolensis)',
    sex: 'MALE',
    birthDate: '2024-10-15',
    fatherName: 'TROVÃO NEGRO',
    motherName: 'SERENA DA MATA',
    paternalGrandfatherId: 'VENTANIA',
    paternalGrandmotherId: 'HONDA',
    maternalGrandfatherId: 'PREDADOR',
    maternalGrandmotherId: 'LADY GAGA',
    status: 'ACTIVE' as any,
    entryDate: '2024-10-15',
    isPublic: true,
    createdAt: '2024-10-15'
  }

  return (
    <div className="space-y-4 pb-20 w-full font-sans">
      {/* Breadcrumb e Barra de Salvamento Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500">
          <Link href="/dashboard" className="text-[#00c853] hover:underline font-medium">Home</Link>
          <span>/</span>
          <span className="text-slate-400">Criador</span>
        </div>

        {/* Botão Salvar Superior Rápido */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
            savedSuccess 
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' 
              : isSaving 
              ? 'bg-emerald-700 text-white cursor-wait' 
              : 'bg-[#00c853] hover:bg-[#00b84a] text-white'
          }`}
        >
          {isSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Salvando...</span>
            </>
          ) : savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
              <span>✓ Salvo com Sucesso!</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Salvar Configurações</span>
            </>
          )}
        </button>
      </div>

      {/* Toast & Success Alerts */}
      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded shadow-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-white shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Bottom Toast Notification (Visível em qualquer posição de rolagem) */}
      {savedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-4 rounded-xl shadow-2xl border border-emerald-400 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 max-w-sm">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-white stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-black">Configurações Salvas com Sucesso!</p>
            <p className="text-[11px] text-emerald-100">Todas as informações, imagens e cores foram salvas no sistema.</p>
          </div>
          <button 
            type="button"
            onClick={() => setSavedSuccess(false)}
            className="ml-2 text-white/80 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main White Card Form Container */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs p-6 space-y-8">
        
        {/* 1. SEÇÃO CRIADOR */}
        <div>
          <div className="flex items-center space-x-2 pb-3 mb-4 text-slate-700 font-medium text-sm border-b border-slate-100">
            <span className="text-base">📝</span>
            <span>Criador</span>
          </div>

          <div className="space-y-4">
            {/* Linha 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs text-slate-600 mb-1">
                  CNPJ/CPF<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tenant.document || tenant.cpfCnpj || ''}
                  onChange={(e) => {
                    handleInputChange('document', e.target.value)
                    handleInputChange('cpfCnpj', e.target.value)
                  }}
                  placeholder="000.000.000-00"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
                />
              </div>

              <div className="md:col-span-5">
                <label className="block text-xs text-slate-600 mb-1">
                  Nome do Criatório<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tenant.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Criatório Canto & Fibra"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-slate-600 mb-1">Registro</label>
                <input
                  type="text"
                  value={tenant.registryNumber || tenant.registrationNumber || ''}
                  onChange={(e) => {
                    handleInputChange('registryNumber', e.target.value)
                    handleInputChange('registrationNumber', e.target.value)
                  }}
                  placeholder="Ex: 1234567"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-slate-600 mb-1">Data Licença</label>
                <DateManualInput
                  value={tenant.licenseDate || ''}
                  onChange={(val) => handleInputChange('licenseDate', val)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
                />
              </div>
            </div>

            {/* Linha 2 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-3">
                <label className="block text-xs text-slate-600 mb-1">
                  Categoria<span className="text-red-500">*</span>
                </label>
                <select
                  value={tenant.category || 'Amador'}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
                >
                  <option value="Amador">Amador</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Científico">Científico</option>
                  <option value="Conservacionista">Conservacionista</option>
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs text-slate-600 mb-1">
                  Tipo Espécie<span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4 pt-1.5 text-xs text-slate-700">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="speciesType"
                      value="Ambos"
                      checked={(tenant.speciesType || 'Ambos') === 'Ambos'}
                      onChange={() => handleInputChange('speciesType', 'Ambos')}
                      className="text-[#00c853] focus:ring-[#00c853]"
                    />
                    <span>Ambos</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="speciesType"
                      value="SISPASS"
                      checked={tenant.speciesType === 'SISPASS'}
                      onChange={() => handleInputChange('speciesType', 'SISPASS')}
                      className="text-[#00c853] focus:ring-[#00c853]"
                    />
                    <span>SISPASS</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="speciesType"
                      value="FOB"
                      checked={tenant.speciesType === 'FOB'}
                      onChange={() => handleInputChange('speciesType', 'FOB')}
                      className="text-[#00c853] focus:ring-[#00c853]"
                    />
                    <span>FOB</span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-5">
                <label className="block text-xs text-slate-600 mb-1">Site</label>
                <input
                  type="text"
                  value={tenant.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://seusite.com.br ou @seucriatorio"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. SEÇÃO REDE SOCIAL */}
        <div>
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Rede Social</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">WhatsApp</label>
              <input
                type="text"
                value={tenant.whatsapp || tenant.socialMedia?.whatsapp || ''}
                onChange={(e) => {
                  handleInputChange('whatsapp', e.target.value)
                  setTenant(prev => prev ? { ...prev, socialMedia: { ...prev.socialMedia, whatsapp: e.target.value } } : null)
                }}
                placeholder="(00) 00000-0000"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1">FaceBook</label>
              <input
                type="text"
                value={tenant.facebook || tenant.socialMedia?.facebook || ''}
                onChange={(e) => {
                  handleInputChange('facebook', e.target.value)
                  setTenant(prev => prev ? { ...prev, socialMedia: { ...prev.socialMedia, facebook: e.target.value } } : null)
                }}
                placeholder="facebook.com/seucriatorio"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1">Twitter</label>
              <input
                type="text"
                value={tenant.twitter || tenant.socialMedia?.twitter || ''}
                onChange={(e) => {
                  handleInputChange('twitter', e.target.value)
                  setTenant(prev => prev ? { ...prev, socialMedia: { ...prev.socialMedia, twitter: e.target.value } } : null)
                }}
                placeholder="@seucriatorio"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1">Instagram</label>
              <input
                type="text"
                value={tenant.instagram || tenant.socialMedia?.instagram || ''}
                onChange={(e) => {
                  handleInputChange('instagram', e.target.value)
                  setTenant(prev => prev ? { ...prev, socialMedia: { ...prev.socialMedia, instagram: e.target.value } } : null)
                }}
                placeholder="@seucriatorio"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1">YouTube</label>
              <input
                type="text"
                value={tenant.youtube || tenant.socialMedia?.youtube || ''}
                onChange={(e) => {
                  handleInputChange('youtube', e.target.value)
                  setTenant(prev => prev ? { ...prev, socialMedia: { ...prev.socialMedia, youtube: e.target.value } } : null)
                }}
                placeholder="youtube.com/@seucriatorio"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
              />
            </div>
          </div>
        </div>

        {/* 3. SEÇÃO CONTATO */}
        <div>
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Contato</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Fone</label>
              <input
                type="text"
                value={tenant.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(00) 0000-0000"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1">Celular</label>
              <input
                type="text"
                value={tenant.cellphone || tenant.mobile || ''}
                onChange={(e) => {
                  handleInputChange('cellphone', e.target.value)
                  handleInputChange('mobile', e.target.value)
                }}
                placeholder="(00) 00000-0000"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1">E-mail</label>
              <input
                type="email"
                value={tenant.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contato@seucriatorio.com.br"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
              />
            </div>
          </div>
        </div>

        {/* 4. SEÇÃO ENDEREÇO */}
        <div>
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Endereço</h3>
          <div className="space-y-4">
            {/* Linha 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs text-slate-600 mb-1">CEP</label>
                <div className="flex">
                  <input
                    type="text"
                    value={tenant.zipCode || tenant.cep || ''}
                    onChange={(e) => {
                      handleInputChange('zipCode', e.target.value)
                      handleInputChange('cep', e.target.value)
                    }}
                    placeholder="00000-000"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-l text-slate-800 focus:outline-none focus:border-[#00c853]"
                  />
                  <button
                    type="button"
                    onClick={handleCepSearch}
                    disabled={isLoadingCep}
                    className="px-3 bg-slate-100 border border-l-0 border-slate-300 rounded-r hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                    title="Buscar CEP"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="md:col-span-7">
                <label className="block text-xs text-slate-600 mb-1">
                  Endereço<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tenant.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Ex: Rua das Flores"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-slate-600 mb-1">
                  Número<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tenant.addressNumber || tenant.number || ''}
                  onChange={(e) => {
                    handleInputChange('addressNumber', e.target.value)
                    handleInputChange('number', e.target.value)
                  }}
                  placeholder="Ex: 123"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
                />
              </div>
            </div>

            {/* Linha 2 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <label className="block text-xs text-slate-600 mb-1">
                  Bairro<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tenant.neighborhood || ''}
                  onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  placeholder="Ex: Centro"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs text-slate-600 mb-1">
                  UF<span className="text-red-500">*</span>
                </label>
                <select
                  value={tenant.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
                >
                  <option value="">Selecione UF</option>
                  <option value="AC">AC</option>
                  <option value="AL">AL</option>
                  <option value="AP">AP</option>
                  <option value="AM">AM</option>
                  <option value="BA">BA</option>
                  <option value="CE">CE</option>
                  <option value="DF">DF</option>
                  <option value="ES">ES</option>
                  <option value="GO">GO</option>
                  <option value="MA">MA</option>
                  <option value="MT">MT</option>
                  <option value="MS">MS</option>
                  <option value="MG">MG</option>
                  <option value="PA">PA</option>
                  <option value="PB">PB</option>
                  <option value="PR">PR</option>
                  <option value="PE">PE</option>
                  <option value="PI">PI</option>
                  <option value="RJ">RJ</option>
                  <option value="RN">RN</option>
                  <option value="RS">RS</option>
                  <option value="RO">RO</option>
                  <option value="RR">RR</option>
                  <option value="SC">SC</option>
                  <option value="SP">SP</option>
                  <option value="SE">SE</option>
                  <option value="TO">TO</option>
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs text-slate-600 mb-1">
                  Cidade<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tenant.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Ex: Sua Cidade"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
                />
              </div>
            </div>

            {/* Linha 3 */}
            <div>
              <label className="block text-xs text-slate-600 mb-1">Complemento</label>
              <input
                type="text"
                value={tenant.complement || ''}
                onChange={(e) => handleInputChange('complement', e.target.value)}
                placeholder="Ex: Bloco B, Apto 101, Chácara 02"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
              />
            </div>
          </div>
        </div>

        {/* 5. SEÇÃO PROPRIETÁRIOS */}
        <div>
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Proprietários</h3>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleClearOwners}
                className="px-3 py-1 bg-[#e57373] hover:bg-[#ef5350] text-white text-xs font-medium rounded flex items-center space-x-1 transition shadow-xs"
              >
                <span>Limpar</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenOwnerModal()}
                className="px-3 py-1 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-medium rounded flex items-center space-x-1 transition shadow-xs"
              >
                <span>+ Adicionar</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {(!tenant.owners || tenant.owners.length === 0) ? (
              <div className="p-4 border border-dashed border-slate-300 rounded text-center text-xs text-slate-400">
                Nenhum proprietário cadastrado.
              </div>
            ) : (
              tenant.owners.map((owner, idx) => (
                <div key={owner.id || idx} className="p-4 rounded border border-slate-200 bg-white flex items-center justify-between shadow-xs">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-[#00c853] flex items-center justify-center text-white shrink-0">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{owner.name}</h4>
                      <div className="flex items-center space-x-6 text-[11px] text-slate-500 mt-0.5">
                        <span>CPF: {owner.cpf}</span>
                        <span>{owner.city} - {owner.state}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenOwnerModal(owner, idx)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOwner(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                      title="Excluir"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 6. SEÇÃO ACESSO & SEGURANÇA (MUDAR LOGIN E SENHA) */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-200 gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-md bg-[#00c853]/10 text-[#00c853] flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  Acesso & Segurança
                  <span className="text-[10px] font-normal normal-case bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Login e Senha
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Atualize seu e-mail de acesso e altere sua senha de entrada no sistema
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveCredentials}
              disabled={isSavingCredentials}
              className="self-start sm:self-auto px-4 py-2 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-bold rounded flex items-center space-x-1.5 transition shadow-xs disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isSavingCredentials ? 'Atualizando...' : 'Atualizar Credenciais'}</span>
            </button>
          </div>

          {credentialMessage && (
            <div
              className={`p-3 rounded text-xs mb-4 flex items-center gap-2 ${
                credentialMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {credentialMessage.type === 'success' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{credentialMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* E-mail de Login */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail de Login / Acesso
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="seu-email@exemplo.com"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">E-mail utilizado para entrar na plataforma.</p>
            </div>

            {/* Nova Senha */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="•••••••• (deixe em branco se não for alterar)"
                  className="w-full text-xs pl-3 pr-8 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Mínimo de 4 caracteres.</p>
            </div>

            {/* Confirmar Nova Senha */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={!newPassword}
                  className="w-full text-xs pl-3 pr-8 py-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#00c853] disabled:bg-slate-100 disabled:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={!newPassword}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Repita exatamente a nova senha.</p>
            </div>
          </div>
        </div>

        {/* 7. SEÇÃO IMAGEM */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">🖼️</span>
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Imagem & Identidade Visual</h3>
            </div>
            <span className="text-[11px] text-slate-500">
              Personalize os logos e fundos para emissão de árvores genealógicas e crachás
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Box 1: Árvore Genealógica */}
            <div className="border border-slate-200 rounded p-4 bg-white space-y-3 shadow-2xs hover:border-[#00c853]/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 block">Árvore Genealógica</span>
                {vc.treeLogoUrl && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">Ativo</span>
                )}
              </div>
              
              <div 
                onDragOver={(e) => { e.preventDefault(); setDragOverField('treeLogoUrl'); }}
                onDragLeave={() => setDragOverField(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverField(null);
                  if (e.dataTransfer.files?.[0]) processImageFile(e.dataTransfer.files[0], 'treeLogoUrl');
                }}
                onClick={() => handleOpenImageSelector('treeLogoUrl', 'Árvore Genealógica')}
                className={`h-36 bg-slate-50 border-2 ${dragOverField === 'treeLogoUrl' ? 'border-[#00c853] bg-emerald-50/40' : 'border-dashed border-slate-200'} rounded flex items-center justify-center overflow-hidden p-2 relative group cursor-pointer`}
              >
                {vc.treeLogoUrl ? (
                  <img 
                    src={vc.treeLogoUrl} 
                    alt="Árvore Genealógica" 
                    className="max-h-full object-contain transition-transform duration-150" 
                    style={{ transform: `scale(${vc.treeLogoScale || 1})` }}
                  />
                ) : (
                  <div className="text-center text-slate-400 p-2">
                    <UploadCloud className="w-7 h-7 mx-auto mb-1 text-slate-400 group-hover:text-[#00c853] transition" />
                    <span className="text-[11px] block font-medium">Clique ou arraste a imagem aqui</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>Zoom / Escala</span>
                  <span className="font-mono font-bold text-slate-600">{Math.round((vc.treeLogoScale || 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.05"
                  value={vc.treeLogoScale || 1}
                  onChange={(e) => handleVisualConfigChange('treeLogoScale', parseFloat(e.target.value))}
                  className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenImageSelector('treeLogoUrl', 'Árvore Genealógica')}
                  className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded transition flex items-center justify-center gap-1.5 ${
                    vc.treeLogoUrl 
                      ? 'bg-[#00c853] hover:bg-[#00b84a] text-white shadow-2xs' 
                      : 'border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Selecionar image</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleClearImage('treeLogoUrl')}
                  className="py-1.5 px-3 border border-red-400 text-red-500 hover:bg-red-500 hover:text-white text-[11px] rounded transition"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Box 2: Background Árvore (1150x800px) */}
            <div className="border border-slate-200 rounded p-4 bg-white space-y-3 shadow-2xs hover:border-[#00c853]/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 block">Background Árvore Genealógica (1150x800px)</span>
                {vc.treeBackgroundUrl && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">Ativo</span>
                )}
              </div>

              <div 
                onDragOver={(e) => { e.preventDefault(); setDragOverField('treeBackgroundUrl'); }}
                onDragLeave={() => setDragOverField(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverField(null);
                  if (e.dataTransfer.files?.[0]) processImageFile(e.dataTransfer.files[0], 'treeBackgroundUrl');
                }}
                onClick={() => handleOpenImageSelector('treeBackgroundUrl', 'Background Árvore Genealógica (1150x800px)')}
                className={`h-36 bg-slate-50 border-2 ${dragOverField === 'treeBackgroundUrl' ? 'border-[#00c853] bg-emerald-50/40' : 'border-dashed border-slate-200'} rounded flex items-center justify-center overflow-hidden p-2 relative group cursor-pointer`}
              >
                {vc.treeBackgroundUrl ? (
                  <img 
                    src={vc.treeBackgroundUrl} 
                    alt="Background Árvore" 
                    className="max-h-full w-full object-cover transition-transform duration-150 rounded" 
                    style={{ transform: `scale(${vc.treeBackgroundScale || 1})` }}
                  />
                ) : (
                  <div className="text-center text-slate-400 p-2">
                    <UploadCloud className="w-7 h-7 mx-auto mb-1 text-slate-400 group-hover:text-[#00c853] transition" />
                    <span className="text-[11px] block font-medium">Clique ou arraste o fundo aqui</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>Zoom / Escala</span>
                  <span className="font-mono font-bold text-slate-600">{Math.round((vc.treeBackgroundScale || 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.05"
                  value={vc.treeBackgroundScale || 1}
                  onChange={(e) => handleVisualConfigChange('treeBackgroundScale', parseFloat(e.target.value))}
                  className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenImageSelector('treeBackgroundUrl', 'Background Árvore Genealógica (1150x800px)')}
                  className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded transition flex items-center justify-center gap-1.5 ${
                    vc.treeBackgroundUrl 
                      ? 'border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white' 
                      : 'border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Selecionar image</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleClearImage('treeBackgroundUrl')}
                  className="py-1.5 px-3 border border-red-400 text-red-500 hover:bg-red-500 hover:text-white text-[11px] rounded transition"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Box 3: Etiqueta */}
            <div className="border border-slate-200 rounded p-4 bg-white space-y-3 shadow-2xs hover:border-[#00c853]/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 block">Etiqueta</span>
                {vc.labelLogoUrl && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">Ativo</span>
                )}
              </div>

              <div 
                onDragOver={(e) => { e.preventDefault(); setDragOverField('labelLogoUrl'); }}
                onDragLeave={() => setDragOverField(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverField(null);
                  if (e.dataTransfer.files?.[0]) processImageFile(e.dataTransfer.files[0], 'labelLogoUrl');
                }}
                onClick={() => handleOpenImageSelector('labelLogoUrl', 'Etiqueta')}
                className={`h-36 bg-slate-50 border-2 ${dragOverField === 'labelLogoUrl' ? 'border-[#00c853] bg-emerald-50/40' : 'border-dashed border-slate-200'} rounded flex items-center justify-center overflow-hidden p-2 relative group cursor-pointer`}
              >
                {vc.labelLogoUrl ? (
                  <img 
                    src={vc.labelLogoUrl} 
                    alt="Etiqueta" 
                    className="max-h-full object-contain transition-transform duration-150" 
                    style={{ transform: `scale(${vc.labelLogoScale || 1})` }}
                  />
                ) : (
                  <div className="text-center text-slate-400 p-2">
                    <UploadCloud className="w-7 h-7 mx-auto mb-1 text-slate-400 group-hover:text-[#00c853] transition" />
                    <span className="text-[11px] block font-medium">Clique ou arraste a logo aqui</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>Zoom / Escala</span>
                  <span className="font-mono font-bold text-slate-600">{Math.round((vc.labelLogoScale || 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.05"
                  value={vc.labelLogoScale || 1}
                  onChange={(e) => handleVisualConfigChange('labelLogoScale', parseFloat(e.target.value))}
                  className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenImageSelector('labelLogoUrl', 'Etiqueta')}
                  className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded transition flex items-center justify-center gap-1.5 ${
                    vc.labelLogoUrl 
                      ? 'border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white' 
                      : 'border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Selecionar image</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleClearImage('labelLogoUrl')}
                  className="py-1.5 px-3 border border-red-400 text-red-500 hover:bg-red-500 hover:text-white text-[11px] rounded transition"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Box 4: Background Etiqueta Frente */}
            <div className="border border-slate-200 rounded p-4 bg-white space-y-3 shadow-2xs hover:border-[#00c853]/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 block">Background Etiqueta Frente (100x60px)</span>
                {vc.labelFrontBackgroundUrl && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">Ativo</span>
                )}
              </div>

              <div 
                onDragOver={(e) => { e.preventDefault(); setDragOverField('labelFrontBackgroundUrl'); }}
                onDragLeave={() => setDragOverField(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverField(null);
                  if (e.dataTransfer.files?.[0]) processImageFile(e.dataTransfer.files[0], 'labelFrontBackgroundUrl');
                }}
                onClick={() => handleOpenImageSelector('labelFrontBackgroundUrl', 'Background Etiqueta Frente (100x60px)')}
                className={`h-36 bg-slate-50 border-2 ${dragOverField === 'labelFrontBackgroundUrl' ? 'border-[#00c853] bg-emerald-50/40' : 'border-dashed border-slate-200'} rounded flex items-center justify-center overflow-hidden p-2 relative group cursor-pointer`}
              >
                {vc.labelFrontBackgroundUrl ? (
                  <img 
                    src={vc.labelFrontBackgroundUrl} 
                    alt="Etiqueta Frente" 
                    className="max-h-full w-full object-cover transition-transform duration-150 rounded" 
                    style={{ transform: `scale(${vc.labelFrontScale || 1})` }}
                  />
                ) : (
                  <div className="text-center text-slate-400 p-2">
                    <UploadCloud className="w-7 h-7 mx-auto mb-1 text-slate-400 group-hover:text-[#00c853] transition" />
                    <span className="text-[11px] block font-medium">Clique ou arraste o fundo aqui</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>Zoom / Escala</span>
                  <span className="font-mono font-bold text-slate-600">{Math.round((vc.labelFrontScale || 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.05"
                  value={vc.labelFrontScale || 1}
                  onChange={(e) => handleVisualConfigChange('labelFrontScale', parseFloat(e.target.value))}
                  className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenImageSelector('labelFrontBackgroundUrl', 'Background Etiqueta Frente (100x60px)')}
                  className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded transition flex items-center justify-center gap-1.5 ${
                    vc.labelFrontBackgroundUrl 
                      ? 'border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white' 
                      : 'border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Selecionar image</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleClearImage('labelFrontBackgroundUrl')}
                  className="py-1.5 px-3 border border-red-400 text-red-500 hover:bg-red-500 hover:text-white text-[11px] rounded transition"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Box 5: Background Etiqueta Verso */}
            <div className="border border-slate-200 rounded p-4 bg-white space-y-3 shadow-2xs hover:border-[#00c853]/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 block">Background Etiqueta Verso (100x60px)</span>
                {vc.labelBackBackgroundUrl && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">Ativo</span>
                )}
              </div>

              <div 
                onDragOver={(e) => { e.preventDefault(); setDragOverField('labelBackBackgroundUrl'); }}
                onDragLeave={() => setDragOverField(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverField(null);
                  if (e.dataTransfer.files?.[0]) processImageFile(e.dataTransfer.files[0], 'labelBackBackgroundUrl');
                }}
                onClick={() => handleOpenImageSelector('labelBackBackgroundUrl', 'Background Etiqueta Verso (100x60px)')}
                className={`h-36 bg-slate-50 border-2 ${dragOverField === 'labelBackBackgroundUrl' ? 'border-[#00c853] bg-emerald-50/40' : 'border-dashed border-slate-200'} rounded flex items-center justify-center overflow-hidden p-2 relative group cursor-pointer`}
              >
                {vc.labelBackBackgroundUrl ? (
                  <img 
                    src={vc.labelBackBackgroundUrl} 
                    alt="Etiqueta Verso" 
                    className="max-h-full w-full object-cover transition-transform duration-150 rounded" 
                    style={{ transform: `scale(${vc.labelBackScale || 1})` }}
                  />
                ) : (
                  <div className="text-center text-slate-400 p-2">
                    <UploadCloud className="w-7 h-7 mx-auto mb-1 text-slate-400 group-hover:text-[#00c853] transition" />
                    <span className="text-[11px] block font-medium">Clique ou arraste o fundo aqui</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>Zoom / Escala</span>
                  <span className="font-mono font-bold text-slate-600">{Math.round((vc.labelBackScale || 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.05"
                  value={vc.labelBackScale || 1}
                  onChange={(e) => handleVisualConfigChange('labelBackScale', parseFloat(e.target.value))}
                  className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenImageSelector('labelBackBackgroundUrl', 'Background Etiqueta Verso (100x60px)')}
                  className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded transition flex items-center justify-center gap-1.5 ${
                    vc.labelBackBackgroundUrl 
                      ? 'border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white' 
                      : 'border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Selecionar image</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleClearImage('labelBackBackgroundUrl')}
                  className="py-1.5 px-3 border border-red-400 text-red-500 hover:bg-red-500 hover:text-white text-[11px] rounded transition"
                >
                  Limpar
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 7. SEÇÃO CONFIGURAÇÃO */}
        <div>
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-4">Configuração</h3>
          
          <div className="space-y-6">
            {/* Linha 1 de Cores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Cor do texto geral Árvore Genealógica</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={treeTextColor}
                    onChange={(e) => handleVisualConfigChange('treeTextColor', e.target.value)}
                    className="w-full h-8 rounded border border-slate-300 cursor-pointer p-0.5 bg-black"
                  />
                  <button
                    type="button"
                    onClick={() => handleResetColor('treeTextColor', '#000000')}
                    className="px-3 py-1.5 border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white text-xs rounded transition shrink-0 cursor-pointer"
                  >
                    Cor Padrão
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Cor do texto geral Etiqueta Frente</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={labelFrontTextColor}
                    onChange={(e) => handleVisualConfigChange('labelFrontTextColor', e.target.value)}
                    className="w-full h-8 rounded border border-slate-300 cursor-pointer p-0.5 bg-black"
                  />
                  <button
                    type="button"
                    onClick={() => handleResetColor('labelFrontTextColor', '#000000')}
                    className="px-3 py-1.5 border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white text-xs rounded transition shrink-0 cursor-pointer"
                  >
                    Cor Padrão
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Cor do texto geral Etiqueta Verso</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={labelBackTextColor}
                    onChange={(e) => handleVisualConfigChange('labelBackTextColor', e.target.value)}
                    className="w-full h-8 rounded border border-slate-300 cursor-pointer p-0.5 bg-black"
                  />
                  <button
                    type="button"
                    onClick={() => handleResetColor('labelBackTextColor', '#000000')}
                    className="px-3 py-1.5 border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white text-xs rounded transition shrink-0 cursor-pointer"
                  >
                    Cor Padrão
                  </button>
                </div>
              </div>
            </div>

            {/* Linha 2 de Cores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Cor do campo</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={fieldBgColor}
                    onChange={(e) => handleVisualConfigChange('fieldBgColor', e.target.value)}
                    className="w-full h-8 rounded border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleResetColor('fieldBgColor', '#ffffff')}
                    className="px-3 py-1.5 border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white text-xs rounded transition shrink-0 cursor-pointer"
                  >
                    Cor Padrão
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Cor do texto do campo</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={fieldTextColor}
                    onChange={(e) => handleVisualConfigChange('fieldTextColor', e.target.value)}
                    className="w-full h-8 rounded border border-slate-300 cursor-pointer p-0.5 bg-black"
                  />
                  <button
                    type="button"
                    onClick={() => handleResetColor('fieldTextColor', '#000000')}
                    className="px-3 py-1.5 border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white text-xs rounded transition shrink-0 cursor-pointer"
                  >
                    Cor Padrão
                  </button>
                </div>
              </div>
            </div>

            {/* Linha 3 de Cores (Paleta Macho / Fêmea) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Cor paleta do Macho</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={maleColor}
                    onChange={(e) => handleVisualConfigChange('maleColor', e.target.value)}
                    className="w-full h-8 rounded border border-slate-300 cursor-pointer p-0.5 bg-[#dbeafe]"
                  />
                  <button
                    type="button"
                    onClick={() => handleResetColor('maleColor', '#dbeafe')}
                    className="px-3 py-1.5 border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white text-xs rounded transition shrink-0 cursor-pointer"
                  >
                    Cor Padrão
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Cor paleta da Fêmea</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={femaleColor}
                    onChange={(e) => handleVisualConfigChange('femaleColor', e.target.value)}
                    className="w-full h-8 rounded border border-slate-300 cursor-pointer p-0.5 bg-[#fce7f3]"
                  />
                  <button
                    type="button"
                    onClick={() => handleResetColor('femaleColor', '#fce7f3')}
                    className="px-3 py-1.5 border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white text-xs rounded transition shrink-0 cursor-pointer"
                  >
                    Cor Padrão
                  </button>
                </div>
              </div>
            </div>

            {/* Linha 4 de Cores (Texto Macho / Fêmea) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Cor do texto da paleta do Macho</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={maleTextColor}
                    onChange={(e) => handleVisualConfigChange('maleTextColor', e.target.value)}
                    className="w-full h-8 rounded border border-slate-300 cursor-pointer p-0.5 bg-black"
                  />
                  <button
                    type="button"
                    onClick={() => handleResetColor('maleTextColor', '#000000')}
                    className="px-3 py-1.5 border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white text-xs rounded transition shrink-0 cursor-pointer"
                  >
                    Cor Padrão
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Cor do texto paleta da Fêmea</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={femaleTextColor}
                    onChange={(e) => handleVisualConfigChange('femaleTextColor', e.target.value)}
                    className="w-full h-8 rounded border border-slate-300 cursor-pointer p-0.5 bg-black"
                  />
                  <button
                    type="button"
                    onClick={() => handleResetColor('femaleTextColor', '#000000')}
                    className="px-3 py-1.5 border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white text-xs rounded transition shrink-0 cursor-pointer"
                  >
                    Cor Padrão
                  </button>
                </div>
              </div>
            </div>

            {/* Sliders Roxos de Exibição */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                <span className="text-xs text-slate-700 min-w-[280px]">Nível de exibição das paletas da Árvore Genealógica:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={vc.malePaletteDisplay ?? 100}
                  onChange={(e) => handleVisualConfigChange('malePaletteDisplay', parseInt(e.target.value))}
                  className="w-48 accent-purple-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-xs text-slate-700 min-w-[280px]">Nível de exibição das paletas da Etiqueta:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={vc.femalePaletteDisplay ?? 100}
                  onChange={(e) => handleVisualConfigChange('femalePaletteDisplay', parseInt(e.target.value))}
                  className="w-48 accent-purple-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Toggles Verdes Sim/Não */}
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-xs text-slate-700 mb-1.5">
                  Deseja imprimir no certificado o título "CERTIFICADO Árvore Genealógica"?
                </p>
                <button
                  type="button"
                  onClick={() => handleVisualConfigChange('printCertificateTitle', !vc.printCertificateTitle)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-full transition ${
                    (vc.printCertificateTitle ?? true)
                      ? 'bg-[#4caf50] text-white shadow-xs'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {(vc.printCertificateTitle ?? true) ? 'SIM' : 'NÃO'}
                </button>
              </div>

              <div>
                <p className="text-xs text-slate-700 mb-1.5">
                  Deseja imprimir até a sexta geração da Árvore Genealógica?
                </p>
                <button
                  type="button"
                  onClick={() => handleVisualConfigChange('printUpToSixthGeneration', !vc.printUpToSixthGeneration)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-full transition ${
                    (vc.printUpToSixthGeneration ?? true)
                      ? 'bg-[#4caf50] text-white shadow-xs'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {(vc.printUpToSixthGeneration ?? true) ? 'SIM' : 'NÃO'}
                </button>
              </div>
            </div>

            {/* PRÉVIA EM TEMPO REAL DA PLACA DE GAIOLA (FRENTE E VERSO) */}
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <span>Prévia da Placa de Gaiola (Frente e Verso)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Atualização em Tempo Real
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    As cores das placas e dados selecionados acima aparecem aqui e nas etiquetas impressas de todas as aves do criatório
                  </p>
                </div>
              </div>
              <div className="bg-slate-100 p-3 sm:p-6 rounded-xl border border-slate-200 flex justify-center overflow-x-auto">
                <BadgeFrontAndBack bird={previewBird} tenant={tenant} />
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded transition flex items-center space-x-1"
              >
                <span>&lt; Voltar</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={`px-6 py-2.5 rounded text-xs font-bold shadow-md transition-all duration-200 flex items-center space-x-2 cursor-pointer ${
                  savedSuccess 
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 scale-[1.02]' 
                    : isSaving 
                    ? 'bg-emerald-700 text-white cursor-wait opacity-90' 
                    : 'bg-[#00c853] hover:bg-[#00b84a] text-white'
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Salvando alterações...</span>
                  </>
                ) : savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                    <span>✓ Configurações Salvas com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Salvar Configurações</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Modal Adicionar / Editar Proprietário */}
      {isOwnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-scale-in">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                {editingOwnerIndex !== null ? 'Editar Proprietário' : 'Novo Proprietário'}
              </h3>
              <button
                onClick={() => setIsOwnerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveOwner} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={ownerForm.name}
                  onChange={(e) => setOwnerForm({ ...ownerForm, name: e.target.value })}
                  placeholder="Ex: João da Silva"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:border-[#00c853]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">CPF *</label>
                <input
                  type="text"
                  required
                  value={ownerForm.cpf}
                  onChange={(e) => setOwnerForm({ ...ownerForm, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:border-[#00c853]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={ownerForm.city}
                    onChange={(e) => setOwnerForm({ ...ownerForm, city: e.target.value })}
                    placeholder="Ex: São Paulo"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:border-[#00c853]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">UF</label>
                  <input
                    type="text"
                    value={ownerForm.state}
                    onChange={(e) => setOwnerForm({ ...ownerForm, state: e.target.value.toUpperCase() })}
                    placeholder="SP"
                    maxLength={2}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:border-[#00c853]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOwnerModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-bold rounded shadow-xs transition"
                >
                  Salvar Proprietário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🖼️ MODAL DE IMPORTAÇÃO & SELEÇÃO DE IMAGEM */}
      {isImageModalOpen && activeImageField && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#00c853]/10 text-[#00c853] flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Importar Imagem</h3>
                  <p className="text-[11px] text-slate-500">{activeImageTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100/70 p-1">
              <button
                type="button"
                onClick={() => setImageModalTab('upload')}
                className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition ${
                  imageModalTab === 'upload' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FolderUp className="w-3.5 h-3.5 text-[#00c853]" />
                <span>Upload do Arquivo</span>
              </button>
              <button
                type="button"
                onClick={() => setImageModalTab('presets')}
                className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition ${
                  imageModalTab === 'presets' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Galeria BirdPro</span>
              </button>
              <button
                type="button"
                onClick={() => setImageModalTab('url')}
                className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition ${
                  imageModalTab === 'url' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Link2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Link da Web</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* TAB 1: UPLOAD */}
              {imageModalTab === 'upload' && (
                <div className="space-y-4">
                  <label 
                    htmlFor="modal-file-upload-input"
                    className="border-2 border-dashed border-slate-300 hover:border-[#00c853] bg-slate-50 hover:bg-emerald-50/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition text-center group"
                  >
                    <div className="w-14 h-14 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:border-[#00c853] transition">
                      <UploadCloud className="w-7 h-7 text-[#00c853]" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 mb-1">
                      Clique para escolher imagem do computador ou celular
                    </span>
                    <span className="text-[11px] text-slate-500 max-w-xs">
                      Suporta PNG, JPG, JPEG, WEBP ou SVG (Alta resolução com otimização automática)
                    </span>
                    <input
                      id="modal-file-upload-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0] && activeImageField) {
                          processImageFile(e.target.files[0], activeImageField)
                        }
                      }}
                    />
                  </label>

                  {isProcessingImage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00c853]"></div>
                      <span>Processando e otimizando imagem...</span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PRESETS */}
              {imageModalTab === 'presets' && (
                <div className="space-y-3">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    {activeImageField === 'treeBackgroundUrl' 
                      ? 'Fundos Profissionais para Árvore Genealógica (1150x800px)' 
                      : (activeImageField === 'labelFrontBackgroundUrl' || activeImageField === 'labelBackBackgroundUrl')
                        ? 'Fundos Elegantes para Etiquetas e Crachás (100x60px)'
                        : 'Fotos de Pássaros & Matrizes em Alta Definição'}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* Presets based on field */}
                    {(activeImageField === 'treeBackgroundUrl' ? [
                      { title: 'Aurora Holográfica', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1150&auto=format&fit=crop&q=80' },
                      { title: 'Ouro Real Luxo', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1150&auto=format&fit=crop&q=80' },
                      { title: 'Bosque & Natureza', url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1150&auto=format&fit=crop&q=80' },
                      { title: 'Pergaminho Nobre', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1150&auto=format&fit=crop&q=80' },
                      { title: 'Azul Tecnológico', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1150&auto=format&fit=crop&q=80' },
                      { title: 'Textura Esmeralda', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1150&auto=format&fit=crop&q=80' }
                    ] : (activeImageField === 'labelFrontBackgroundUrl' || activeImageField === 'labelBackBackgroundUrl') ? [
                      { title: 'Pássaro Natureza', url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&auto=format&fit=crop&q=80' },
                      { title: 'Esmeralda & Ouro', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&auto=format&fit=crop&q=80' },
                      { title: 'Abstrato Moderno', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80' },
                      { title: 'Aurora Gradiente', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80' },
                      { title: 'Bosque Suave', url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=400&auto=format&fit=crop&q=80' },
                      { title: 'Minimalista Claro', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80' }
                    ] : [
                      { title: 'Canário da Terra', url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=500&auto=format&fit=crop&q=80' },
                      { title: 'Coleiro / Papa-Capim', url: 'https://images.unsplash.com/photo-1549608276-5786777e6587?w=500&auto=format&fit=crop&q=80' },
                      { title: 'Trinca-Ferro', url: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=500&auto=format&fit=crop&q=80' },
                      { title: 'Azulão', url: 'https://images.unsplash.com/photo-1574063413132-355dbfd83e25?w=500&auto=format&fit=crop&q=80' },
                      { title: 'Curió', url: 'https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=500&auto=format&fit=crop&q=80' },
                      { title: 'Papagaio Verdadeiro', url: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=500&auto=format&fit=crop&q=80' }
                    ]).map((preset, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleApplyPresetOrUrl(preset.url)}
                        className="border border-slate-200 rounded-lg overflow-hidden group cursor-pointer hover:border-[#00c853] hover:shadow-md transition bg-white"
                      >
                        <div className="h-24 bg-slate-100 overflow-hidden relative">
                          <img 
                            src={preset.url} 
                            alt={preset.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200" 
                          />
                        </div>
                        <div className="p-2 text-center bg-slate-50 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-slate-700 block truncate group-hover:text-[#00c853]">
                            {preset.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: URL */}
              {imageModalTab === 'url' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Endereço / URL Direta da Imagem
                    </label>
                    <input
                      type="url"
                      placeholder="https://exemplo.com/minha-imagem.png"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#00c853]"
                    />
                  </div>

                  {customImageUrl && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500">Pré-visualização:</span>
                      <div className="h-36 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center p-2">
                        <img 
                          src={customImageUrl} 
                          alt="Preview" 
                          className="max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (!customImageUrl) return;
                      handleApplyPresetOrUrl(customImageUrl);
                    }}
                    className="w-full py-2.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-bold rounded-lg shadow-xs transition"
                  >
                    Salvar Imagem por URL
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

