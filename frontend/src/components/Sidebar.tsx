import React from 'react'
import {
  LayoutDashboard, Wallet, Users, Truck, BarChart2,
  LogOut, HardHat, ChevronRight, CalendarCheck, UserCog, MapPin,
  Building, Sun, Moon, X, ReceiptText
} from 'lucide-react'

export type Page =
  | 'dashboard' | 'tracker' | 'billing' | 'attendance' | 'admin-attendance'
  | 'user-management' | 'customers' | 'vendors' | 'reports' | 'organisation'

interface NavLink { id: Page; label: string; Icon: any; roles: string[] }

const ALL_LINKS: NavLink[] = [
  { id: 'dashboard',        label: 'Dashboard',           Icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'CUSTOMER'] },
  { id: 'tracker',          label: 'Expense Tracker',     Icon: Wallet,          roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { id: 'billing',          label: 'Billing',             Icon: ReceiptText,     roles: ['ADMIN', 'MANAGER'] },
  { id: 'attendance',       label: 'My Attendance',       Icon: CalendarCheck,   roles: ['MANAGER', 'EMPLOYEE', 'CUSTOMER'] },
  { id: 'admin-attendance', label: 'All Attendance',      Icon: MapPin,          roles: ['ADMIN'] },
  { id: 'customers',        label: 'Customers',           Icon: Users,           roles: ['ADMIN', 'MANAGER'] },
  { id: 'vendors',          label: 'Vendors',             Icon: Truck,           roles: ['ADMIN', 'MANAGER'] },
  { id: 'reports',          label: 'Reports',             Icon: BarChart2,       roles: ['ADMIN'] },
  { id: 'user-management',  label: 'User Management',     Icon: UserCog,         roles: ['ADMIN'] },
  { id: 'organisation',     label: 'Organisation Master', Icon: Building,        roles: ['ADMIN'] },
]

const ROLE_COLORS: Record<string, string> = {
  ADMIN:    'bg-rose-500',
  MANAGER:  'bg-purple-500',
  EMPLOYEE: 'bg-blue-500',
  CUSTOMER: 'bg-emerald-500',
}

interface Props {
  page: Page
  setPage: (p: Page) => void
  onLogout: () => void
  user: any
  theme: 'light' | 'dark'
  setTheme: (t: 'light' | 'dark') => void
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ page, setPage, onLogout, user, theme, setTheme, isOpen, onClose }: Props) {
  const role = user?.role || 'EMPLOYEE'
  const links = ALL_LINKS.filter(l => l.roles.includes(role))

  function navigate(id: Page) {
    setPage(id)
    onClose()
  }

  return (
    <aside className={`
      fixed left-0 top-0 h-full w-64
      bg-gradient-to-b from-slate-900 to-slate-800
      flex flex-col z-30
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0
    `}>
      {/* Logo + mobile close button */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
          <HardHat size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">We Work</p>
          <p className="text-slate-400 text-xs">Constructions</p>
        </div>
        <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
          <X size={18} />
        </button>
      </div>

      {/* User info */}
      <div className="mx-3 mt-3 mb-1 bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${ROLE_COLORS[role] || 'bg-slate-600'}`}>
          {(user?.name || user?.email || 'U')[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold truncate">{user?.name || 'User'}</p>
          <p className="text-slate-400 text-xs">{role}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {links.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => navigate(id)}
            className={`sidebar-link w-full ${page === id ? 'active' : ''}`}>
            <Icon size={17} />
            <span className="truncate">{label}</span>
            {page === id && <ChevronRight size={13} className="ml-auto opacity-60 shrink-0" />}
          </button>
        ))}
      </nav>

      {/* Theme toggle */}
      <div className="px-3 pb-2 border-t border-white/10 pt-3">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-1 mb-2">Appearance</p>
        <div className="grid grid-cols-2 gap-1.5">
          <button onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              theme === 'light' ? 'bg-white text-slate-800 shadow-md' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}>
            <Sun size={14} /> Light
          </button>
          <button onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              theme === 'dark' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}>
            <Moon size={14} /> Dark
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 pb-4 pt-2">
        <button onClick={onLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
