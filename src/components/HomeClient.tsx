'use client'

import { useActionState, useEffect, useState } from 'react'
import { login } from '@/app/actions/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Utensils, QrCode, Clock, ArrowRight, Sparkles, Star } from 'lucide-react'

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
        window.history.replaceState({}, '', '/home')
      }
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col font-sans text-nina-dark-800 bg-gradient-to-br from-[#fae0d4] via-[#fcfaf6] to-[#fae5d9] relative">
      {/* Subtle Background Pattern */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none z-0"
        style={{ 
          backgroundImage: 'radial-gradient(#d6c0b3 1.5px, transparent 1.5px)', 
          backgroundSize: '28px 28px' 
        }}
      />

      {/* Top Half - Light Theme */}
      <div className="relative pb-16 md:pb-24">

        {/* Navbar */}
        <header className="max-w-6xl mx-auto px-4 h-20 md:h-24 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 text-nina-dark-800 font-bold text-lg md:text-xl">
            <div className="bg-nina-red-500 text-white rounded-md p-1.5 shadow-sm">
              <Utensils size={20} />
            </div>
            <span>Cantina Nina</span>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => setIsOpen(true)}
              className="text-nina-red-700 hover:text-nina-red-500 font-medium text-sm md:text-base transition-colors"
            >
              Entrar
            </button>
            <Link
              href="/cadastro"
              className="bg-nina-red-500 hover:bg-nina-red-600 text-white px-5 py-2 md:px-6 md:py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md"
            >
              Criar conta
            </Link>
          </div>
        </header>

        {/* Hero */}
        <main className="w-full max-w-6xl mx-auto px-4 pt-8 md:pt-12 pb-12 md:pb-20 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* Left Text */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-xl flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-nina-red-200/50 rounded-full border border-nina-red-100 shadow-sm">
              <span className="text-nina-red-700 text-[11px] font-bold uppercase tracking-wider">
                Pedidos online
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-nina-dark-900 tracking-tight leading-[1.1] mb-6">
              Hora do almoço<br className="hidden sm:block" />
              <span className="text-nina-red-500"> sem fila nenhuma.</span>
            </h1>

            <p className="text-base sm:text-lg text-nina-dark-500 mb-8 md:mb-10 font-medium leading-relaxed max-w-lg px-2 sm:px-0">
              Planeje suas refeições da semana, pague pelo Pix e retire seu prato direto no balcão sem perder tempo.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
              <Link
                href="/cadastro"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-nina-red-500 hover:bg-nina-red-600 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1"
              >
                Começar agora <ArrowRight size={18} />
              </Link>
              <button
                onClick={() => setIsOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-nina-red-200 hover:bg-nina-red-50 text-nina-dark-900 font-bold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                Já tenho conta
              </button>
            </div>
          </motion.div>

          {/* Right Card (Decorative) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-sm lg:w-auto relative flex justify-center mt-12 lg:mt-20 lg:translate-x-8 perspective-1000"
          >
            {/* Inner glowing effect behind the card */}
            <div className="absolute inset-0 bg-gradient-to-tr from-nina-red-200 to-white/40 blur-2xl rounded-[3rem] -z-10 scale-[1.2] opacity-60"></div>
            
            <motion.div 
              animate={{ 
                y: [0, -15, 0],
                rotate: [3, 6, 3] 
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="bg-[#fcf9f2] text-nina-dark-800 p-6 sm:p-8 rounded-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-[#e8e3d5] w-[270px] sm:w-[320px] lg:w-[360px] origin-center"
            >
              <div className="flex justify-between items-center mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-dashed border-gray-300">
                <h3 className="font-serif font-bold text-lg sm:text-xl text-nina-dark-900">Cardápio do dia</h3>
              </div>
              
              <div className="space-y-4 text-[13px] sm:text-sm font-mono text-gray-800 pb-5 sm:pb-6 border-b border-gray-200">
                <div className="flex justify-between items-center"><span>Feijoada</span><span className="text-gray-600">R$ 18,00</span></div>
                <div className="flex justify-between items-center"><span>Grelhado</span><span className="text-gray-600">R$ 16,00</span></div>
                <div className="flex justify-between items-center"><span>Vegetariano</span><span className="text-gray-600">R$ 15,00</span></div>
                <div className="flex justify-between items-center"><span>Suco natural</span><span className="text-gray-600">R$ 6,00</span></div>
              </div>

              <div className="flex justify-between items-end mt-4 sm:mt-5 mb-6 sm:mb-8">
                <span className="font-mono text-xs sm:text-sm text-gray-500 tracking-widest uppercase">Total</span>
                <span className="font-mono font-bold text-lg sm:text-xl text-[#9c2b2b]">R$ 18,00</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] sm:text-xs text-gray-500 tracking-wider">PEDIDO Nº 042</span>
                <div className="bg-[#e6f4ea] text-[#137333] font-mono text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl font-bold">
                  pronto às 13h
                </div>
              </div>
            </motion.div>
          </motion.div>

        </main>
      </div>

      {/* Bottom section */}
      <section className="flex-grow relative z-20 pt-8 pb-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-12">
            <span className="text-nina-red-600 font-bold text-[11px] uppercase tracking-widest block mb-3">como funciona</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-nina-dark-900">Do pedido à mesa em três passos</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -5 }} className="bg-white border border-white/60 shadow-[0_15px_40px_-10px_rgba(180,120,110,0.15)] rounded-xl p-6 sm:p-8 transition-all">
              <div className="font-mono text-[#b47a46] text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-5">
                01 <span className="opacity-50 mx-1">•</span> Escolher
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#c33d3d] text-white flex items-center justify-center mb-6 shadow-sm">
                <Utensils size={20} />
              </div>
              <h3 className="text-lg font-serif font-bold text-nina-dark-900 mb-2">Cardápio inteligente</h3>
              <p className="text-nina-dark-600 text-sm leading-relaxed">
                Veja o prato do dia e escolha quando comer.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-white border border-white/60 shadow-[0_15px_40px_-10px_rgba(180,120,110,0.15)] rounded-xl p-6 sm:p-8 transition-all">
              <div className="font-mono text-[#b47a46] text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-5">
                02 <span className="opacity-50 mx-1">•</span> Pagar
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#c33d3d] text-white flex items-center justify-center mb-6 shadow-sm">
                <QrCode size={20} />
              </div>
              <h3 className="text-lg font-serif font-bold text-nina-dark-900 mb-2">Pagamento via Pix</h3>
              <p className="text-nina-dark-600 text-sm leading-relaxed">
                Pague na hora, sem cartão ou dinheiro.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-white border border-white/60 shadow-[0_15px_40px_-10px_rgba(180,120,110,0.15)] rounded-xl p-6 sm:p-8 transition-all">
              <div className="font-mono text-[#b47a46] text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-5">
                03 <span className="opacity-50 mx-1">•</span> Retirar
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#c33d3d] text-white flex items-center justify-center mb-6 shadow-sm">
                <Clock size={20} />
              </div>
              <h3 className="text-lg font-serif font-bold text-nina-dark-900 mb-2">Retirada rápida</h3>
              <p className="text-nina-dark-600 text-sm leading-relaxed">
                Pegue seu prato pronto no balcão.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-nina-dark-400 font-medium text-sm">
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
