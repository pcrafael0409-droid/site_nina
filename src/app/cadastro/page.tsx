'use client'

import { useActionState, useEffect, useState } from 'react'
import { register } from '@/app/actions/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { X, Utensils, ArrowRight } from 'lucide-react'

const initialState = { error: '', success: false }

function CustomSelect({ name, label, options, placeholder }: { name: string, label: string, options: string[], placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState('')

  return (
    <div className="flex-1 relative">
      <label className="block text-sm font-bold text-[#2d2f27] mb-2">{label}</label>
      <input type="hidden" name={name} value={selected} required />
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full px-4 py-3 bg-[#fdfcfa] border border-[#e8e6de] text-[#2d2f27] font-medium rounded-xl cursor-pointer hover:border-nina-red-400 transition-all shadow-sm"
      >
        <span className={selected ? 'text-[#2d2f27]' : 'text-nina-dark-300'}>{selected || placeholder}</span>
        <svg className={`w-4 h-4 text-nina-dark-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>
      {isOpen && (
        <>
          <div className="absolute z-50 w-full mt-2 bg-white border border-[#e8e6de] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            {options.map((opt) => (
              <div key={opt} onClick={() => { setSelected(opt); setIsOpen(false) }} className="px-4 py-3 hover:bg-[#f5f3ed] text-[#2d2f27] font-medium cursor-pointer transition-colors border-b border-[#e8e6de]/50 last:border-0">{opt}</div>
            ))}
          </div>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
        </>
      )}
    </div>
  )
}

export default function CadastroPage() {
  const [state, formAction, isPending] = useActionState(register, initialState)
  const [tipoConta, setTipoConta] = useState('aluno')
  const router = useRouter()

  useEffect(() => {
    if (state?.success) router.push('/')
  }, [state, router])

  return (
    /* Simulates the login modal: home page content in bg + dark blur overlay + centered card */
    <div className="min-h-screen relative font-sans overflow-hidden">

      {/* ── Background: same as home page ── */}
      <div className="absolute inset-0 flex flex-col">
        {/* Top olive section */}
        <div className="bg-nina-dark-600 flex-[0_0_55%] relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 h-24 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2 text-nina-red-400 font-bold text-xl">
              <div className="bg-nina-red-400 text-nina-dark-900 rounded-md p-1.5"><Utensils size={20} /></div>
              <span className="text-[#f4f0e6]">Cantina Nina</span>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-4 pt-6 relative z-10">
            <h1 className="text-5xl font-black text-[#f4f0e6] tracking-tight leading-tight">
              Chegou a hora do almoço?<br />
              <span className="text-nina-red-400">Pule a fila.</span>
            </h1>
            <div className="mt-8 flex gap-4">
              <div className="bg-nina-red-400 text-nina-dark-900 font-bold py-3.5 px-8 rounded-lg flex items-center gap-2 opacity-70">
                Começar Agora <ArrowRight size={18} />
              </div>
              <div className="border border-[#f4f0e6]/30 text-[#f4f0e6] font-bold py-3.5 px-8 rounded-lg opacity-70">
                Já tenho conta
              </div>
            </div>
          </div>
        </div>
        {/* Bottom beige section */}
        <div className="bg-[#f4f0e6] flex-1" />
      </div>

      {/* ── Dark blur overlay (identical to login modal backdrop) ── */}
      <div className="absolute inset-0 bg-nina-dark-950/60 backdrop-blur-md z-10" />

      {/* ── Centered card (identical layout to login modal) ── */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
          className="solid-card p-8 md:p-10 w-full max-w-md relative"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-nina-red-400/10 rounded-full blur-2xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />

          {/* X button — same as login modal */}
          <Link
            href="/"
            className="absolute top-6 right-6 text-nina-dark-400 hover:text-nina-dark-900 bg-[#f5f3ed] hover:bg-[#e8e6de] p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </Link>

          <div className="text-center mb-8 mt-2">
            <div className="w-16 h-16 bg-[#f5f3ed] text-nina-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-[#e8e6de]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            </div>
            <h1 className="text-2xl font-black text-[#2d2f27] tracking-tight">Criar Conta</h1>
            <p className="text-nina-dark-400 mt-2 font-medium">
              Já tem uma conta?{' '}
              <Link href="/home?login=true" className="text-nina-red-600 hover:text-nina-red-700 font-bold underline decoration-2 decoration-nina-red-400/30 underline-offset-4">
                Faça login
              </Link>
            </p>
          </div>

          <form action={formAction} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-bold text-[#2d2f27] mb-2">Nome Completo</label>
              <input name="nome" type="text" required className="appearance-none block w-full px-4 py-3 bg-[#fdfcfa] border border-[#e8e6de] placeholder-nina-dark-300 text-[#2d2f27] font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-nina-red-400/50 focus:border-nina-red-400 focus:bg-white transition-all shadow-sm" placeholder="Ex: João da Silva" />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2d2f27] mb-2">Você é aluno ou professor?</label>
              <div className="flex gap-3">
                <label className={`flex-1 border-2 p-3 rounded-xl flex items-center justify-center cursor-pointer transition-all text-sm font-bold ${tipoConta === 'aluno' ? 'border-nina-red-400 bg-nina-red-400/10 text-nina-red-700 shadow-sm' : 'border-[#e8e6de] bg-[#fdfcfa] text-nina-dark-400 hover:bg-white'}`}>
                  <input type="radio" name="tipoConta" value="aluno" className="hidden" checked={tipoConta === 'aluno'} onChange={() => setTipoConta('aluno')} />
                  Sou Aluno
                </label>
                <label className={`flex-1 border-2 p-3 rounded-xl flex items-center justify-center cursor-pointer transition-all text-sm font-bold ${tipoConta === 'professor' ? 'border-nina-red-400 bg-nina-red-400/10 text-nina-red-700 shadow-sm' : 'border-[#e8e6de] bg-[#fdfcfa] text-nina-dark-400 hover:bg-white'}`}>
                  <input type="radio" name="tipoConta" value="professor" className="hidden" checked={tipoConta === 'professor'} onChange={() => setTipoConta('professor')} />
                  Sou Professor
                </label>
              </div>
            </div>

            {tipoConta === 'aluno' && (
              <div className="flex gap-4">
                <CustomSelect name="ano" label="Ano" placeholder="Selecione..." options={['1º Ano', '2º Ano', '3º Ano']} />
                <CustomSelect name="turma_letra" label="Turma" placeholder="Selecione..." options={['A', 'B', 'C', 'D', 'E']} />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-[#2d2f27] mb-2">Nome de Usuário (Para Login)</label>
              <input name="username" type="text" required className="appearance-none block w-full px-4 py-3 bg-[#fdfcfa] border border-[#e8e6de] placeholder-nina-dark-300 text-[#2d2f27] font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-nina-red-400/50 focus:border-nina-red-400 focus:bg-white transition-all shadow-sm" placeholder="Ex: joao123" />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2d2f27] mb-2">Senha</label>
              <input name="password" type="password" required minLength={6} className="appearance-none block w-full px-4 py-3 bg-[#fdfcfa] border border-[#e8e6de] placeholder-nina-dark-300 text-[#2d2f27] font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-nina-red-400/50 focus:border-nina-red-400 focus:bg-white transition-all shadow-sm" placeholder="Mínimo 6 caracteres" />
            </div>

            {state?.error && (
              <div className="text-rose-600 text-sm font-medium bg-rose-50 p-3 rounded-lg border border-rose-100 flex items-center justify-center">{state.error}</div>
            )}

            <button type="submit" disabled={isPending || state?.success} className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-nina-red-400 text-nina-dark-900 font-bold text-sm uppercase tracking-wide rounded-xl hover:bg-nina-red-500 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nina-red-400 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none mt-2">
              {isPending || state?.success ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
