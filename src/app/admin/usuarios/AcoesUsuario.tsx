'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { MoreVertical, Trash2, KeyRound, UserCog, AlertCircle, CheckCircle2 } from 'lucide-react'
import { deleteUserAccount, updateUsuarioAuth } from '@/app/actions/admin-users'

import { createPortal } from 'react-dom'

export default function AcoesUsuario({ userId, currentEmail }: { userId: string, currentEmail: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalType, setModalType] = useState<'none' | 'delete' | 'password' | 'login'>('none')
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form states
  const [newPassword, setNewPassword] = useState('')
  const [newLogin, setNewLogin] = useState(currentEmail.split('@')[0])
  
  const menuRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  function fecharModal() {
    setModalType('none')
    setErrorMsg('')
    setSuccessMsg('')
    setNewPassword('')
    setIsOpen(false)
  }

  function handleDelete() {
    setErrorMsg('')
    startTransition(async () => {
      const res = await deleteUserAccount(userId)
      if (!res.success) {
        setErrorMsg(res.error || 'Erro ao deletar')
      } else {
        setSuccessMsg('Usuário excluído com sucesso!')
        setTimeout(fecharModal, 1500)
      }
    })
  }

  function handleUpdatePassword() {
    if (newPassword.length < 6) {
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    setErrorMsg('')
    startTransition(async () => {
      const res = await updateUsuarioAuth(userId, { password: newPassword })
      if (!res.success) {
        setErrorMsg(res.error || 'Erro ao alterar senha')
      } else {
        setSuccessMsg('Senha alterada com sucesso!')
        setTimeout(fecharModal, 1500)
      }
    })
  }

  function handleUpdateLogin() {
    if (newLogin.length < 3) {
      setErrorMsg('O login deve ter no mínimo 3 caracteres.')
      return
    }
    setErrorMsg('')
    startTransition(async () => {
      const emailFormated = `${newLogin.trim().toLowerCase()}@cantinanina.com`
      const res = await updateUsuarioAuth(userId, { email: emailFormated })
      if (!res.success) {
        setErrorMsg(res.error || 'Erro ao alterar login')
      } else {
        setSuccessMsg('Login alterado com sucesso!')
        setTimeout(fecharModal, 1500)
      }
    })
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-nina-dark-400 hover:text-[#383b32] hover:bg-[#e8e3d5]/30 rounded-lg transition-colors"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-[#e8e3d5] rounded-xl shadow-lg z-10 py-2">
          <button onClick={() => setModalType('login')} className="w-full text-left px-4 py-2 text-sm text-[#383b32] hover:bg-[#e8e3d5]/30 flex items-center gap-2">
            <UserCog size={16} /> Mudar Login
          </button>
          <button onClick={() => setModalType('password')} className="w-full text-left px-4 py-2 text-sm text-[#383b32] hover:bg-[#e8e3d5]/30 flex items-center gap-2">
            <KeyRound size={16} /> Mudar Senha
          </button>
          <div className="border-t border-[#e8e3d5] my-1"></div>
          <button onClick={() => setModalType('delete')} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
            <Trash2 size={16} /> Excluir Conta
          </button>
        </div>
      )}

      {/* MODALS */}
      {mounted && modalType !== 'none' && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-[#383b32] mb-4">
              {modalType === 'delete' && 'Excluir Usuário'}
              {modalType === 'password' && 'Alterar Senha do Usuário'}
              {modalType === 'login' && 'Alterar Login do Usuário'}
            </h3>

            {modalType === 'delete' && (
              <p className="text-[#383b32]/60 mb-6">
                Tem certeza que deseja excluir esta conta? Esta ação apagará o usuário e todos os seus pedidos de forma irreversível.
              </p>
            )}

            {modalType === 'password' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#383b32] mb-2">Nova Senha</label>
                <input 
                  type="text" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-[#e8e3d5] rounded-lg focus:ring-2 focus:ring-nina-red-400 outline-none"
                  placeholder="No mínimo 6 caracteres"
                />
              </div>
            )}

            {modalType === 'login' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#383b32] mb-2">Novo Login (Username)</label>
                <input 
                  type="text" 
                  value={newLogin}
                  onChange={(e) => setNewLogin(e.target.value)}
                  className="w-full px-4 py-2 border border-[#e8e3d5] rounded-lg focus:ring-2 focus:ring-nina-red-400 outline-none"
                  placeholder="Ex: joao.silva"
                />
                <p className="text-xs text-[#383b32]/50 mt-2">O sistema adicionará @cantinanina.com automaticamente.</p>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 border border-red-100">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}
            
            {successMsg && (
              <div className="mb-6 p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-start gap-2 border border-green-100">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                <p>{successMsg}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={fecharModal}
                disabled={isPending}
                className="px-4 py-2 text-[#383b32] font-medium hover:bg-[#e8e3d5]/30 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <button 
                onClick={
                  modalType === 'delete' ? handleDelete : 
                  modalType === 'password' ? handleUpdatePassword : 
                  handleUpdateLogin
                }
                disabled={isPending || !!successMsg}
                className={`px-4 py-2 text-nina-dark-900 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2
                  ${modalType === 'delete' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-nina-red-400 hover:bg-nina-red-500'}
                `}
              >
                {isPending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                Confirmar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
