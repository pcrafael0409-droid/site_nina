'use client'

import { useState, useTransition, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { KeyRound, ShieldCheck, AlertCircle, CheckCircle2, UserCircle, Mail, GraduationCap } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PerfilPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: publicUser } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()

      if (publicUser) {
        setUserData(publicUser)
      }
      setIsLoading(false)
    }

    loadUser()
  }, [router, supabase])

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (newPassword.length < 6) {
      setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.')
      return
    }

    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        setErrorMsg(error.message)
      } else {
        setSuccessMsg('Senha alterada com sucesso!')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setShowPasswordForm(false), 2000)
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-8 h-8 border-4 border-nina-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      
      {/* Informações do Usuário */}
      <div className="solid-card p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-nina-dark-600"></div>
        <div className="relative z-10 flex justify-center mb-4 mt-8">
          <div className="w-28 h-28 bg-[#f4f0e6] rounded-full flex items-center justify-center shadow-md border-4 border-[#f4f0e6] text-[#383b32]/30">
            <UserCircle size={90} />
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-[#383b32] mb-6">{userData?.nome_completo}</h2>

        <div className="space-y-4 text-left">
          <div className="flex items-center gap-4 p-4 bg-[#e8e3d5]/30 rounded-2xl border border-[#e8e3d5] shadow-sm">
            <div className="p-3 bg-[#e8e3d5] text-[#383b32]/70 rounded-xl">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-xs text-[#383b32]/50 font-bold uppercase tracking-wider">Login</p>
              <p className="text-base font-bold text-[#383b32]">{userData?.email?.split('@')[0]}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-[#e8e3d5]/30 rounded-2xl border border-[#e8e3d5] shadow-sm">
            <div className="p-3 bg-[#e8e3d5] text-[#383b32]/70 rounded-xl">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-xs text-[#383b32]/50 font-bold uppercase tracking-wider">Turma/Cargo</p>
              <p className="text-base font-bold text-[#383b32]">{userData?.turma || 'Não informado'}</p>
            </div>
          </div>
        </div>

        {!showPasswordForm && (
          <button 
            onClick={() => setShowPasswordForm(true)}
            className="w-full bg-[#e8e3d5] hover:bg-nina-red-400 text-[#383b32] font-bold py-4 rounded-2xl transition-colors flex justify-center items-center gap-2 mt-8 shadow-sm hover:shadow-md"
          >
            <KeyRound size={20} /> Mudar Minha Senha
          </button>
        )}
      </div>

      {/* Formulário de Senha Oculto */}
      {showPasswordForm && (
        <div className="solid-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#e8e3d5]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-nina-red-400/20 text-nina-red-600 rounded-full flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-lg font-bold text-[#383b32]">Nova Senha</h2>
            </div>
            <button 
              onClick={() => setShowPasswordForm(false)}
              className="text-sm text-[#383b32]/50 hover:text-[#383b32] font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#383b32]/80 mb-1">
                Sua Nova Senha
              </label>
              <input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-[#e8e3d5] bg-white rounded-lg focus:ring-2 focus:ring-nina-red-400 outline-none transition-all text-[#383b32]"
                placeholder="No mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#383b32]/80 mb-1">
                Confirmar Nova Senha
              </label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-[#e8e3d5] bg-white rounded-lg focus:ring-2 focus:ring-nina-red-400 outline-none transition-all text-[#383b32]"
                placeholder="Repita a senha"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 border border-red-100 font-medium">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}
            
            {successMsg && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-start gap-2 border border-green-100 font-medium">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                <p>{successMsg}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-nina-red-400 hover:bg-nina-red-500 text-nina-dark-900 font-bold py-3 rounded-xl transition-all disabled:opacity-70 flex justify-center items-center gap-2 mt-4 shadow-md shadow-nina-red-400/20 hover:shadow-lg hover:-translate-y-0.5"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-nina-dark-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><KeyRound size={20} /> Atualizar Senha</>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
