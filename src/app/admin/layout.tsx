'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Utensils, ReceiptText, Settings, LogOut, CheckSquare, User, Users } from 'lucide-react'
import { logout } from '@/app/actions/auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const links = [
    { href: '/admin', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/entregas', label: 'Entregas de Hoje', shortLabel: 'Entregas', icon: CheckSquare },
    { href: '/admin/cardapios', label: 'Gerenciar Cardápios', shortLabel: 'Cardápios', icon: Utensils },
    { href: '/admin/usuarios', label: 'Todos os Usuários', shortLabel: 'Usuários', icon: Users },
    { href: '/admin/pedidos', label: 'Todos os Pedidos', shortLabel: 'Pedidos', icon: ReceiptText },
    { href: '/admin/configuracoes', label: 'Configurações', shortLabel: 'Config', icon: Settings },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f4f0e6] relative">
      {/* Sidebar (Desktop only) */}
      <aside className="hidden md:flex w-72 bg-nina-dark-700 p-6 flex-col print:hidden sticky top-0 h-screen overflow-y-auto custom-scrollbar shadow-xl z-20">
        <div className="mb-10 px-2 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-nina-red-400 mb-1">
            <div className="bg-nina-red-400 text-nina-dark-900 rounded-md p-1">
              <Utensils size={20} />
            </div>
            <h2 className="text-2xl font-black text-[#f4f0e6] tracking-tight">Cantina Nina</h2>
          </div>
          <p className="text-[10px] font-bold text-nina-dark-300 uppercase tracking-widest pl-10">Painel de Gestão</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                  isActive 
                    ? 'bg-nina-red-400 text-nina-dark-900 shadow-sm' 
                    : 'text-nina-dark-200 hover:bg-nina-dark-600 hover:text-[#f4f0e6]'
                }`}
              >
                <Icon size={18} className={`${isActive ? 'text-nina-dark-900' : 'text-nina-dark-300'}`} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 border-t border-nina-dark-600 pt-4">
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-nina-dark-200 hover:bg-nina-dark-600 hover:text-[#f4f0e6] transition-all duration-300 font-medium"
            >
              <LogOut size={18} />
              Sair do Sistema
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 pb-28 md:pb-10 print:p-0 min-h-screen text-[#383b32] relative z-10 w-full overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Navigation (Bottom) */}
      <nav className="md:hidden bg-nina-dark-700 fixed bottom-0 left-0 right-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] print:hidden">
        <div className="grid grid-cols-4 gap-0 px-1 pt-1 pb-safe">
          {/* Row 1: first 4 items */}
          {links.slice(0, 4).map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 transition-all duration-200 rounded-xl ${
                  isActive 
                    ? 'text-nina-dark-900 bg-nina-red-400' 
                    : 'text-nina-dark-200'
                }`}
              >
                <Icon size={19} />
                <span className="text-[9px] font-bold text-center leading-tight">{(link as any).shortLabel}</span>
              </Link>
            )
          })}
        </div>
        <div className="grid grid-cols-4 gap-0 px-1 pb-2">
          {/* Row 2: last 2 items + logout */}
          {links.slice(4).map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 transition-all duration-200 rounded-xl ${
                  isActive 
                    ? 'text-nina-dark-900 bg-nina-red-400' 
                    : 'text-nina-dark-200'
                }`}
              >
                <Icon size={19} />
                <span className="text-[9px] font-bold text-center leading-tight">{(link as any).shortLabel}</span>
              </Link>
            )
          })}
          <form action={logout}>
            <button
              type="submit"
              className="flex flex-col items-center justify-center gap-0.5 w-full py-2 text-nina-dark-200 rounded-xl"
            >
              <LogOut size={19} />
              <span className="text-[9px] font-bold">Sair</span>
            </button>
          </form>
          {/* spacer to keep last row balanced */}
          <div />
        </div>
      </nav>
    </div>
  )
}
