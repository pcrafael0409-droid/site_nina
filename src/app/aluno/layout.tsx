'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Utensils, ReceiptText, LogOut, UserCircle, Home, Flame } from 'lucide-react'
import { logout } from '@/app/actions/auth'

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const links = [
    { href: '/aluno', label: 'Início', shortLabel: 'Início', icon: Home },
    { href: '/aluno/pedidos', label: 'Meus Pedidos', shortLabel: 'Pedidos', icon: ReceiptText },
    { href: '/aluno/clube', label: 'Clube Nina', shortLabel: 'Clube', icon: Flame },
    { href: '/aluno/perfil', label: 'Meu Perfil', shortLabel: 'Perfil', icon: UserCircle },
  ]

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0 relative text-nina-dark-800">
      
      {/* Desktop/Tablet Header — hidden on mobile (bottom nav handles navigation) */}
      <header className="hidden md:block bg-nina-dark-900 sticky top-0 z-20 shadow-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-white hidden md:flex">
              <div className="bg-nina-red-500 text-white rounded-md p-1">
                <Utensils size={18} />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Cantina Nina
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-6 ml-4">
              {links.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center py-5 transition-all duration-300 font-medium text-sm relative ${
                      isActive 
                        ? 'text-white font-bold' 
                        : 'text-nina-dark-300 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-nina-red-400 rounded-t-sm" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2 text-nina-dark-200 hover:text-white hover:bg-nina-dark-800 px-4 py-1.5 rounded-lg font-medium text-sm transition-all duration-300"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">Sair</span>
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-6 md:py-8 px-4 max-w-4xl mx-auto min-h-[calc(100vh-160px)]">
        {children}
      </main>

      {/* Mobile Navigation (Bottom) */}
      <nav className="md:hidden bg-nina-dark-900 fixed bottom-0 left-0 right-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-around px-2 py-1 pb-safe">
          {links.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 flex-1 transition-all duration-300 rounded-xl ${
                  isActive 
                    ? 'text-white bg-nina-red-500 shadow-sm' 
                    : 'text-nina-dark-300'
                }`}
              >
                <Icon size={22} />
                <span className="text-[9px] font-bold text-center leading-tight whitespace-nowrap">{(link as any).shortLabel}</span>
              </Link>
            )
          })}
          {/* Logout */}
          <form action={logout} className="flex-1">
            <button
              type="submit"
              className="flex flex-col items-center justify-center gap-0.5 w-full py-2 text-nina-dark-300 rounded-xl"
            >
              <LogOut size={22} />
              <span className="text-[9px] font-bold">Sair</span>
            </button>
          </form>
        </div>
      </nav>
    </div>
  )
}
