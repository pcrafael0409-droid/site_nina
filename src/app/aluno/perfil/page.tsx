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
    <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Informações do Usuário */}
      <div className="bg-[#fcf9f2] border border-[#e8e3d5] p-8 text-center relative overflow-hidden shadow-sm rounded-sm">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#e8e3d5] text-gray-300">
            <UserCircle size={80} />
          </div>
        </div>
        
        <h2 className="text-2xl font-serif font-bold text-nina-dark-900 mb-8">{userData?.nome_completo}</h2>

        <div className="space-y-4 text-left">
          <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-300">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-400" />
              <span className="font-mono text-xs text-gray-500 tracking-wider">LOGIN</span>
            </div>
            <span className="font-mono font-bold text-gray-800">{userData?.email?.split('@')[0]}</span>
          </div>
          
          <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-300">
            <div className="flex items-center gap-3">
              <GraduationCap size={16} className="text-gray-400" />
              <span className="font-mono text-xs text-gray-500 tracking-wider">TURMA</span>
            </div>
            <span className="font-mono font-bold text-gray-800">{userData?.turma || 'Não informado'}</span>
          </div>
        </div>

        {!showPasswordForm && (
          <button 
            onClick={() => setShowPasswordForm(true)}
            className="w-full mt-8 bg-transparent hover:bg-black/5 text-nina-dark-700 border border-[#d6c0b3] font-serif font-bold py-3 rounded-md transition-colors flex justify-center items-center gap-2"
          >
            <KeyRound size={18} /> Mudar Minha Senha
          </button>
        )}
      </div>

      {/* Formulário de Senha Oculto */}
      {showPasswordForm && (
        <div className="bg-[#fcf9f2] border border-[#e8e3d5] p-8 shadow-sm rounded-sm animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-dashed border-gray-300">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-nina-red-600" />
              <h2 className="text-lg font-serif font-bold text-nina-dark-900">Nova Senha</h2>
            </div>
            <button 
              onClick={() => setShowPasswordForm(false)}
              className="font-mono text-xs text-gray-500 hover:text-nina-dark-800 uppercase tracking-widest transition-colors"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block font-mono text-xs text-gray-500 tracking-wider mb-2">
                SUA NOVA SENHA
              </label>
              <input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#e8e3d5] bg-white font-mono text-sm rounded-md focus:ring-2 focus:ring-[#d6c0b3] focus:border-[#d6c0b3] outline-none transition-all text-nina-dark-800"
                placeholder="No mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-gray-500 tracking-wider mb-2">
                CONFIRMAR SENHA
              </label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#e8e3d5] bg-white font-mono text-sm rounded-md focus:ring-2 focus:ring-[#d6c0b3] focus:border-[#d6c0b3] outline-none transition-all text-nina-dark-800"
                placeholder="Repita a senha"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-mono rounded-md flex items-start gap-2 border border-red-100">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}
            
            {successMsg && (
              <div className="p-3 bg-[#e6f4ea] text-[#137333] text-xs font-mono rounded-md flex items-start gap-2 border border-green-100">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                <p>{successMsg}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-[#1e1e1e] hover:bg-black text-white font-serif font-bold py-3 rounded-md transition-all disabled:opacity-70 flex justify-center items-center gap-2 mt-6 shadow-sm"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><KeyRound size={18} /> Atualizar Senha</>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
