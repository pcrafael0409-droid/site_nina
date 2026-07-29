'use client'

import { useActionState, useEffect, useState } from 'react'
import { login } from '@/app/actions/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Utensils, QrCode, Clock, ArrowRight } from 'lucide-react'

const initialState = { error: '', success: false }

export default function HomeClient() {
  const [state, formAction, isPending] = useActionState(login, initialState)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      router.push('/')
    }
  }, [state, router])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('login') === 'true') {
        setIsOpen(true)
        window.history.replaceState({}, '', '/')
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-nina-dark-800">
      
      {/* Top Half - Light Theme */}
      <div className="relative overflow-hidden pb-32">
        {/* Navbar */}
        <header className="max-w-6xl mx-auto px-4 h-24 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 text-nina-dark-800 font-bold text-xl">
            <div className="bg-nina-red-500 text-white rounded-md p-1.5 shadow-sm">
              <Utensils size={20} />
            </div>
            <span>Cantina Nina</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsOpen(true)}
              className="text-nina-red-700 hover:text-nina-red-500 font-medium text-sm transition-colors"
            >
              Entrar
            </button>
            <Link
              href="/cadastro"
              className="bg-nina-red-500 hover:bg-nina-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md"
            >
              Criar conta
            </Link>
          </div>
        </header>

        {/* Hero */}
        <main className="w-full max-w-6xl mx-auto px-4 pt-12 pb-20 relative z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-nina-red-200/50 rounded-full">
              <span className="text-nina-red-700 text-[11px] font-bold uppercase tracking-wider">
                Pedidos online
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-nina-dark-900 tracking-tight leading-[1.1] mb-6">
              Hora do almoço<br />
              <span className="text-nina-red-500">sem fila nenhuma.</span>
            </h1>

            <p className="text-lg text-nina-dark-500 mb-10 font-medium leading-relaxed max-w-lg">
              Planeje suas refeições da semana, pague pelo Pix e retire seu prato direto no balcão.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/cadastro"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-nina-red-500 hover:bg-nina-red-600 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Começar agora <ArrowRight size={18} />
              </Link>
              <button
                onClick={() => setIsOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 border border-nina-red-200 hover:bg-nina-red-50 text-nina-dark-900 font-bold py-3.5 px-8 rounded-xl transition-all duration-300"
              >
                Já tenho conta
              </button>
            </div>
          </div>
        </main>

        {/* Floating card */}
        <div className="absolute right-[10%] top-[25%] hidden lg:block shadow-2xl animate-float transition-all duration-500 hover:scale-105 z-20">
          <div className="bg-white text-nina-dark-800 p-8 rounded-3xl border border-nina-red-200 w-80 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-nina-dark-900">Cardápio do dia</h3>
              <div className="text-nina-red-500"><Utensils size={18} /></div>
            </div>
            
            <div className="space-y-4 text-sm font-medium pb-6 mb-4">
              <div className="flex justify-between items-center text-nina-dark-500"><span>Feijoada</span><span className="font-bold text-nina-dark-800">R$ 18</span></div>
              <div className="flex justify-between items-center text-nina-dark-500"><span>Grelhado</span><span className="font-bold text-nina-dark-800">R$ 16</span></div>
              <div className="flex justify-between items-center text-nina-dark-500"><span>Vegetariano</span><span className="font-bold text-nina-dark-800">R$ 15</span></div>
              <div className="flex justify-between items-center text-nina-dark-500"><span>Suco natural</span><span className="font-bold text-nina-dark-800">R$ 6</span></div>
            </div>
            <div className="text-xs bg-nina-red-50 text-nina-red-700 py-3 rounded-xl font-medium text-center">
              Pedido nº 042 · pronto às 12h20
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <section className="bg-white flex-grow relative z-20 pt-16 pb-24 mt-8 rounded-t-[3rem] shadow-[0_-10px_40px_-15px_rgba(224,82,82,0.1)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-12">
            <span className="text-nina-red-600 font-bold text-[11px] uppercase tracking-widest block mb-3">como funciona</span>
            <h2 className="text-3xl md:text-4xl font-bold text-nina-dark-900">Do pedido à mesa em três passos</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -5 }} className="bg-nina-bg-light border border-nina-red-200 rounded-3xl p-8 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-nina-red-200/60 text-nina-red-600 flex items-center justify-center mb-6">
                <Utensils size={24} />
              </div>
              <h3 className="text-xl font-bold text-nina-dark-900 mb-3">Cardápio inteligente</h3>
              <p className="text-nina-dark-500 text-sm leading-relaxed">
                Veja o prato do dia e escolha quando comer.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-nina-bg-light border border-nina-red-200 rounded-3xl p-8 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-nina-red-200/60 text-nina-red-600 flex items-center justify-center mb-6">
                <QrCode size={24} />
              </div>
              <h3 className="text-xl font-bold text-nina-dark-900 mb-3">Pagamento via Pix</h3>
              <p className="text-nina-dark-500 text-sm leading-relaxed">
                Pague na hora, sem cartão ou dinheiro.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-nina-bg-light border border-nina-red-200 rounded-3xl p-8 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-nina-red-200/60 text-nina-red-600 flex items-center justify-center mb-6">
                <Clock size={24} />
              </div>
              <h3 className="text-xl font-bold text-nina-dark-900 mb-3">Retirada rápida</h3>
              <p className="text-nina-dark-500 text-sm leading-relaxed">
                Pegue seu prato pronto no balcão.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-nina-dark-400 font-medium text-sm bg-white">
        &copy; {new Date().getFullYear()} Cantina Nina. Todos os direitos reservados.
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-nina-dark-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="bg-white border border-nina-red-200 p-8 md:p-10 w-full max-w-md relative z-10 rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-nina-red-100 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-nina-dark-400 hover:text-nina-dark-900 bg-nina-bg-light hover:bg-nina-red-50 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8 mt-2">
                <div className="w-16 h-16 bg-nina-red-50 text-nina-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-nina-red-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                </div>
                <h2 className="text-2xl font-bold text-nina-dark-900 tracking-tight">Bem-vindo de volta</h2>
                <p className="text-nina-dark-500 mt-2 font-medium">Faça login para continuar</p>
              </div>

              <form action={formAction} className="space-y-5 relative z-10">
                <div>
                  <label className="block text-sm font-bold text-nina-dark-800 mb-2">Nome de Usuário</label>
                  <input name="username" type="text" required className="appearance-none relative block w-full px-4 py-3.5 bg-nina-bg-light border border-nina-red-100 placeholder-nina-dark-300 text-nina-dark-900 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-nina-red-300 focus:border-nina-red-400 focus:bg-white transition-all" placeholder="Ex: joao123" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-nina-dark-800 mb-2">Senha</label>
                  <input name="password" type="password" required className="appearance-none relative block w-full px-4 py-3.5 bg-nina-bg-light border border-nina-red-100 placeholder-nina-dark-300 text-nina-dark-900 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-nina-red-300 focus:border-nina-red-400 focus:bg-white transition-all" placeholder="Sua senha" />
                </div>
                {state?.error && (
                  <div className="text-rose-600 text-sm font-medium bg-rose-50 p-3 rounded-lg border border-rose-100 flex items-center justify-center">{state.error}</div>
                )}
                <button type="submit" disabled={isPending || state?.success} className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-nina-red-500 text-white font-bold text-sm rounded-xl hover:bg-nina-red-600 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nina-red-400 transition-all disabled:opacity-50 mt-4">
                  {isPending || state?.success ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-nina-dark-500 font-medium relative z-10">
                Não tem uma conta?{' '}
                <Link href="/cadastro" className="text-nina-red-600 hover:text-nina-red-700 font-bold underline decoration-2 decoration-nina-red-200 underline-offset-4">
                  Cadastre-se
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
