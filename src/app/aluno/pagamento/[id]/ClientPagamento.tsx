'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, CheckCircle2, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { verificarPagamento } from '@/app/actions/pagamento'
import { cancelarPedido } from '@/app/actions/aluno'

type Props = {
  pedidoId: string
  transacaoId: string
  qrCode: string
  qrCodeBase64: string
  valor: number
}

export default function ClientPagamento({ pedidoId, transacaoId, qrCode, qrCodeBase64, valor }: Props) {
  const router = useRouter()
  const [copiado, setCopiado] = useState(false)
  const [isVerificando, setIsVerificando] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isCancelando, setIsCancelando] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(qrCode)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const executarCancelamento = async () => {
    setShowConfirmModal(false)
    setIsCancelando(true)
    setStatusMsg('Cancelando pedido...')
    
    const result = await cancelarPedido(pedidoId)
    
    if (result.success) {
      setStatusMsg('Pedido cancelado com sucesso.')
      setTimeout(() => router.push('/aluno/pedidos'), 1500)
    } else {
      setStatusMsg(result.error || 'Erro ao cancelar pedido.')
      setIsCancelando(false)
    }
  }

  const handleCancelarClick = () => {
    setShowConfirmModal(true)
  }

  const handleVerificar = async () => {
    setIsVerificando(true)
    setStatusMsg('Verificando com o Mercado Pago...')
    
    const result = await verificarPagamento(transacaoId, pedidoId)
    
    if (result.success) {
      if (result.status === 'pago') {
        setStatusMsg('Pagamento aprovado! Redirecionando...')
        setTimeout(() => router.push('/aluno/pedidos'), 1500)
      } else {
        setStatusMsg(`Pagamento ainda não aprovado (Status: ${result.status}). Tente novamente em instantes.`)
        setIsVerificando(false)
      }
    } else {
      setStatusMsg(result.error || 'Erro ao verificar pagamento.')
      setIsVerificando(false)
    }
  }

  return (
    <>
      <div className="max-w-md mx-auto relative z-10 font-sans mt-8">
        <div className="solid-card bg-white p-8 md:p-10 shadow-xl relative overflow-hidden">
          {/* Enfeite de fundo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-nina-red-400/10 rounded-full blur-3xl opacity-60 -z-10 -translate-y-1/2 translate-x-1/4"></div>

          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-nina-red-400/20 to-nina-red-400/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-nina-red-400/30">
              <CheckCircle2 size={36} className="text-nina-red-600" />
            </div>
            <h2 className="text-2xl font-black text-[#2d2f27] tracking-tight">Pedido Recebido!</h2>
            <p className="text-nina-dark-400 font-medium mt-2">Realize o pagamento via Pix para confirmar seu pedido.</p>
          </div>

          <div className="bg-[#f5f3ed] rounded-3xl p-6 border border-[#e8e6de] shadow-inner mb-6 flex flex-col items-center justify-center group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-nina-red-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {qrCodeBase64 ? (
              <img 
                src={`data:image/png;base64,${qrCodeBase64}`} 
                alt="QR Code Pix" 
                className="w-48 h-48 rounded-xl shadow-sm border border-[#e8e6de] relative z-10 group-hover:scale-105 transition-transform duration-300" 
              />
            ) : (
              <div className="w-48 h-48 bg-[#f5f3ed] rounded-xl flex items-center justify-center border border-[#e8e6de]">
                <span className="text-nina-dark-300 font-medium">QR Code indisponível</span>
              </div>
            )}
          </div>

          <div className="mb-8 relative">
            <label className="block text-xs font-bold text-[#2d2f27] mb-2 uppercase tracking-wider ml-1">Código Pix Copia e Cola</label>
            <div className="flex flex-col bg-[#fdfcfa] border border-[#e8e6de] rounded-2xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-nina-red-400/30 focus-within:border-nina-red-400 transition-all">
              <input
                type="text"
                readOnly
                value={qrCode}
                className="flex-1 p-4 bg-transparent text-xs text-[#2d2f27] outline-none font-mono font-medium break-all"
              />
              <button
                onClick={handleCopy}
                className={`w-full py-3 px-5 font-bold flex items-center justify-center gap-2 border-t border-[#e8e6de] transition-colors text-sm ${
                  copiado
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-[#e8e6de]/50 hover:bg-[#e8e6de] text-nina-dark-600 hover:text-nina-red-700'
                }`}
              >
                <Copy size={16} />
                {copiado ? '✓ Copiado!' : 'Copiar Código'}
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-[#e8e6de]/60 space-y-3">
            <button
              onClick={handleVerificar}
              disabled={isVerificando || isCancelando}
              className="w-full bg-nina-red-400 hover:bg-nina-red-500 text-nina-dark-900 font-bold py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 shadow-md shadow-nina-red-400/20 hover:shadow-nina-red-400/40 hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-wide text-sm"
            >
              {isVerificando ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
              Já paguei / Verificar Pagamento
            </button>

            <button
              onClick={handleCancelarClick}
              disabled={isVerificando || isCancelando}
              className="w-full bg-[#fdfcfa] hover:bg-rose-50 text-nina-dark-500 hover:text-rose-600 font-bold py-4 px-6 rounded-2xl border border-[#e8e6de] hover:border-rose-200 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              {isCancelando ? <Loader2 size={20} className="animate-spin" /> : <XCircle size={20} />}
              Cancelar Pedido
            </button>

            {statusMsg && (
              <div className={`p-4 rounded-xl text-sm font-bold text-center mt-4 transition-all animate-in fade-in slide-in-from-bottom-2 ${
                statusMsg.includes('sucesso') || (statusMsg.includes('aprovado') && !statusMsg.includes('não')) 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {statusMsg}
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-nina-dark-950/60 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)}></div>
          <div className="bg-[#fdfcfa] rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl border border-[#e8e6de] animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-[#2d2f27] mb-2">Cancelar Pedido</h3>
            <p className="text-nina-dark-500 font-medium text-sm mb-8">
              Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-[#e8e6de] bg-[#f5f3ed] text-nina-dark-600 font-bold hover:bg-[#e8e6de] transition-colors"
              >
                Voltar
              </button>
              <button 
                onClick={executarCancelamento}
                className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all"
              >
                Sim, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
