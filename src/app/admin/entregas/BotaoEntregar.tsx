'use client'

import { useState } from 'react'
import { marcarComoEntregue } from '@/app/actions/funcionario'
import { Loader2, CheckCircle2 } from 'lucide-react'

export default function BotaoEntregar({ pedidoId }: { pedidoId: string }) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')

  const handleConfirmar = async () => {
    setIsPending(true)
    setError('')
    
    const result = await marcarComoEntregue(pedidoId)
    
    setIsPending(false)
    if (!result.success) {
      setError(result.error || 'Erro ao entregar')
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleConfirmar}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 bg-nina-red-400 hover:bg-nina-red-500 text-nina-dark-900 text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
        Dar Baixa
      </button>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  )
}
