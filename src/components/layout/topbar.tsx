import { useRouter } from 'next/navigation'
import { 
  Menu, 
  Moon, 
  Sun, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  ChevronDown,
  Building2,
  Check,
  Search,
  Bird as BirdIcon,
  X
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { db } from '@/lib/db'
import { InstallAppButton } from '@/components/pwa/pwa-installer'

interface TopbarProps {
  onOpenSidebar: () => void;
  onOpenGlobalSearch?: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const router = useRouter()
  const { user, tenant, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  // Quick Ring Search
  const [ringQuery, setRingQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const notifications = db.getNotifications(tenant?.id)
  const unreadCount = notifications.filter(n => !n.read).length

  const birds = db.getBirds(tenant?.id)
  const ringSuggestions = ringQuery.trim()
    ? birds.filter(b => {
        if (!b.ringNumber) return false
        const q = ringQuery.toLowerCase().trim()
        const qAlpha = q.replace(/[^a-z0-9]/g, '')
        const r = b.ringNumber.toLowerCase()
        const rAlpha = r.replace(/[^a-z0-9]/g, '')
        const n = (b.name || '').toLowerCase()
        return r.includes(q) || (qAlpha && rAlpha.includes(qAlpha)) || n.includes(q)
      }).slice(0, 5)
    : []

  const handleSelectRing = (ring: string) => {
    setShowSuggestions(false)
    setRingQuery('')
    router.push(`/dashboard/genealogia?anilha=${encodeURIComponent(ring)}`)
  }

  return (
    <header className="sticky top-0 z-30 h-14 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs transition-colors duration-200">
      {/* Left side: Hamburger toggle button */}
      <div className="flex items-center space-x-3 shrink-0">
        <button
          onClick={onOpenSidebar}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center: Quick Ring Search Bar */}
      <div className="flex-1 max-w-sm sm:max-w-md mx-2 sm:mx-6 relative">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar anilha (ex: 041738, 2024)..."
            value={ringQuery}
            onChange={(e) => {
              setRingQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && ringQuery.trim()) {
                e.preventDefault()
                handleSelectRing(ringQuery.trim())
              }
            }}
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#00c853] focus:bg-white dark:focus:bg-slate-900 font-mono transition"
          />
          {ringQuery && (
            <button
              type="button"
              onClick={() => {
                setRingQuery('')
                setShowSuggestions(false)
              }}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Floating Ring Suggestions */}
        {showSuggestions && ringSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Anilhas Encontradas:</span>
              <span className="text-[9px] text-emerald-600 font-bold">Enter para ver Árvore</span>
            </div>
            {ringSuggestions.map((sug) => (
              <div
                key={sug.id}
                onClick={() => handleSelectRing(sug.ringNumber)}
                className="px-3 py-2 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 cursor-pointer flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600">
                    {sug.ringNumber}
                  </span>
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px]">
                    {sug.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {sug.sex === 'MALE' ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">♂</span>
                  ) : sug.sex === 'FEMALE' ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">♀</span>
                  ) : null}
                  <span className="text-[10px] font-bold text-emerald-600 group-hover:underline">Ver Árvore →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right side: Dark Mode toggle & User Avatar Profile */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Criar App Button (iOS & Android) */}
        <InstallAppButton variant="topbar" />

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          title={theme === 'dark' ? "Ativar Modo Claro (Dia)" : "Ativar Modo Escuro (Noite)"}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded relative transition cursor-pointer"
            title="Notificações"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs overflow-hidden">
              <div className="px-4 py-2 font-bold text-slate-800 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="flex items-center gap-1.5 font-black text-slate-900">
                  <Bell className="w-3.5 h-3.5 text-emerald-600" />
                  Alertas & Avisos
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {notifications.filter(n => n.status !== 'COMPLETED').length} ativos
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.slice(0, 4).map((n) => (
                  <Link 
                    key={n.id} 
                    href="/dashboard/alertas"
                    onClick={() => setIsNotifOpen(false)}
                    className="p-3 hover:bg-slate-50 transition block"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 truncate pr-2">{n.title}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {n.dueTime || n.dueDate || 'Aviso'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                  </Link>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 bg-slate-50/80 text-center">
                <Link
                  href="/dashboard/alertas"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 block py-1"
                >
                  Central de Push Notificações & Alertas →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 overflow-hidden shadow-2xs">
              <User className="w-4 h-4" />
            </div>
          </button>

          {isProfileOpen && (
            <>
              {/* Backdrop to close on outside click */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsProfileOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                    {user?.role === 'SUPER_ADMIN' ? 'Administrador Master' : user?.role === 'SELLER' ? 'Portal do Vendedor' : tenant?.name || user?.name || 'Criatório'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@birdpro.com.br'}</p>
                </div>
                {user?.role === 'SUPER_ADMIN' ? (
                  <>
                    <Link
                      href="/dashboard/admin/configuracoes"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <Settings className="w-3.5 h-3.5 text-amber-500" />
                      <span>Configurações do Sistema</span>
                    </Link>
                    <Link
                      href="/dashboard/admin/chamados"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <Building2 className="w-3.5 h-3.5 text-amber-500" />
                      <span>Central de Chamados</span>
                    </Link>
                  </>
                ) : user?.role === 'SELLER' ? (
                  <Link
                    href="/dashboard/vendedor"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <Settings className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Painel do Afiliado</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/dashboard/configuracoes/criatorio"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Dados do Criatório</span>
                    </Link>
                    <Link
                      href="/dashboard/configuracoes"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Configurações</span>
                    </Link>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false)
                    logout()
                  }}
                  className="w-full text-left flex items-center space-x-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition border-t border-slate-100 dark:border-slate-800 font-bold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Sair da Conta (Logout)</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
