'use client'

import { useActionState, useEffect, useState } from 'react'
import { login } from '@/app/actions/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const initialState = { error: '', success: false }

export default function LoginModal() {
  const [state, formAction, isPending] = useActionState(login, initialState)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      router.push('/')
    }
  }, [state, router])

  // Expose open function globally so server-side buttons can trigger it
  useEffect(() => {
    (window as any).__openLoginModal = () => setIsOpen(true)
    return () => { delete (window as any).__openLoginModal }
  }, [])

  return (
    <>
      {/* Trigger buttons rendered client-side to avoid URL navigation */}
      <div id="login-trigger-nav" className="flex items-center gap-6">
        <button
          onClick={() => setIsOpen(true)}
          className="text-nina-dark-200 hover:text-[#f4f0e6] font-medium text-sm transition-colors"
        >
          Entrar
        </button>
        <Link
          href="/cadastro"
          className="border border-[#f4f0e6]/20 hover:bg-[#f4f0e6]/10 text-[#f4f0e6] px-6 py-2.5 rounded-lg text-sm font-bold transition-colors"
        >
          Criar Conta
        </Link>
      </div>

      {/* Hero CTA buttons */}
      <div id="login-trigger-hero" className="flex flex-col sm:flex-row items-center gap-4 w-full">
        <Link
          href="/cadastro"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-nina-red-400 hover:bg-nina-red-500 text-nina-dark-900 font-bold py-3.5 px-8 rounded-lg transition-all duration-300 shadow-md"
        >
          Começar Agora
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 border border-[#f4f0e6]/30 hover:bg-[#f4f0e6]/10 text-[#f4f0e6] font-bold py-3.5 px-8 rounded-lg transition-all duration-300"
        >
          Já tenho conta
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-nina-dark-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="solid-card p-8 md:p-10 w-full max-w-md relative z-10"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-nina-red-400/10 rounded-full blur-2xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-nina-dark-400 hover:text-nina-dark-900 bg-[#f5f3ed] hover:bg-[#e8e6de] p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8 mt-2">
                <div className="w-16 h-16 bg-[#f5f3ed] text-nina-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-[#e8e6de]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                </div>
                <h2 className="text-2xl font-black text-[#2d2f27] tracking-tight">Bem-vindo de volta</h2>
                <p className="text-nina-dark-400 mt-2 font-medium">Faça login para continuar</p>
              </div>

              <form action={formAction} className="space-y-5 relative z-10">
                <div>
                  <label className="block text-sm font-bold text-[#2d2f27] mb-2">Nome de Usuário</label>
                  <input
                    name="username"
                    type="text"
                    required
                    className="appearance-none relative block w-full px-4 py-3 bg-[#fdfcfa] border border-[#e8e6de] placeholder-nina-dark-300 text-[#2d2f27] font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-nina-red-400/50 focus:border-nina-red-400 focus:bg-white transition-all shadow-sm"
                    placeholder="Ex: joao123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2d2f27] mb-2">Senha</label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="appearance-none relative block w-full px-4 py-3 bg-[#fdfcfa] border border-[#e8e6de] placeholder-nina-dark-300 text-[#2d2f27] font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-nina-red-400/50 focus:border-nina-red-400 focus:bg-white transition-all shadow-sm"
                    placeholder="Sua senha"
                  />
                </div>

                {state?.error && (
                  <div className="text-rose-600 text-sm font-medium bg-rose-50 p-3 rounded-lg border border-rose-100 flex items-center justify-center">
                    {state.error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending || state?.success}
                  className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-nina-red-400 text-nina-dark-900 font-bold text-sm uppercase tracking-wide rounded-xl hover:bg-nina-red-500 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nina-red-400 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none mt-2"
                >
                  {isPending || state?.success ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-nina-dark-500 font-medium relative z-10">
                Não tem uma conta?{' '}
                <Link href="/cadastro" className="text-nina-red-600 hover:text-nina-red-700 font-bold underline decoration-2 decoration-nina-red-400/30 underline-offset-4">
                  Cadastre-se
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
