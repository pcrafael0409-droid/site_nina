'use client'

import { useState } from 'react'
import { Check, ShoppingBag, Loader2, Utensils, Gift } from 'lucide-react'
import { criarPedido } from '@/app/actions/aluno'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

type Cardapio = {
  id: string
  dia_semana: number
  prato_principal: string
  acompanhamentos: string
  valor_diario: number
  imagem_url?: string
  proteina_1?: string | null
  proteina_2?: string | null
}

const diasSemanaNomes = [
  { id: 1, label: 'Segunda', short: 'Seg' },
  { id: 2, label: 'Terça', short: 'Ter' },
  { id: 3, label: 'Quarta', short: 'Qua' },
  { id: 4, label: 'Quinta', short: 'Qui' },
  { id: 5, label: 'Sexta', short: 'Sex' },
]

export default function FormularioPedido({ cardapios, descontoPercentual = 0, pontosFidelidade = 0 }: { cardapios: Cardapio[], descontoPercentual?: number, pontosFidelidade?: number }) {
  const router = useRouter()
  const [diasSelecionados, setDiasSelecionados] = useState<number[]>([])
  const [proteinasSelecionadas, setProteinasSelecionadas] = useState<Record<number, string>>({})
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')
  const [usarPontos, setUsarPontos] = useState(false)

  const toggleDia = (diaId: number) => {
    if (diasSelecionados.includes(diaId)) {
      setDiasSelecionados(diasSelecionados.filter(d => d !== diaId))
      const newProteinas = { ...proteinasSelecionadas }
      delete newProteinas[diaId]
      setProteinasSelecionadas(newProteinas)
    } else {
      setDiasSelecionados([...diasSelecionados, diaId])
      const cardapioDia = cardapios.find(c => c.dia_semana === diaId)
      if (cardapioDia?.proteina_1) {
        setProteinasSelecionadas({ ...proteinasSelecionadas, [diaId]: cardapioDia.proteina_1 })
      } else if (cardapioDia?.proteina_2) {
        setProteinasSelecionadas({ ...proteinasSelecionadas, [diaId]: cardapioDia.proteina_2 })
      }
    }
  }

  // Calculate total price by summing the valor_diario of each selected day
  const valorOriginal = diasSelecionados.reduce((total, diaId) => {
    const cardapioDia = cardapios.find(c => c.dia_semana === diaId)
    return total + (cardapioDia ? Number(cardapioDia.valor_diario) : 0)
  }, 0)

  const valorComDesconto = valorOriginal * (1 - descontoPercentual / 100)
  
  // Se usar pontos e tiver pelo menos 1 dia selecionado, desconta o valor de 1 refeição do total com desconto
  let valorFinal = valorComDesconto
  if (usarPontos && diasSelecionados.length > 0) {
    // Para simplificar, descontamos o valor da primeira refeição selecionada (que normalmente é igual às outras)
    const primeiroDia = cardapios.find(c => c.dia_semana === diasSelecionados[0])
    const descontoRefeicao = (primeiroDia ? Number(primeiroDia.valor_diario) : 15) * (1 - descontoPercentual / 100)
    valorFinal = Math.max(0, valorComDesconto - descontoRefeicao)
  }

  const temDesconto = descontoPercentual > 0 && diasSelecionados.length > 0

  const handleSubmit = async () => {
    if (diasSelecionados.length === 0) {
      setError('Selecione pelo menos um dia da semana')
      return
    }

    for (const diaId of diasSelecionados) {
      const cardapioDia = cardapios.find(c => c.dia_semana === diaId)
      if (cardapioDia && (cardapioDia.proteina_1 || cardapioDia.proteina_2)) {
        if (!proteinasSelecionadas[diaId]) {
          setError('Selecione a proteína para todos os dias que possuem opções de proteína')
          return
        }
      }
    }

    setIsPending(true)
    setError('')

    const result = await criarPedido(diasSelecionados, proteinasSelecionadas, valorFinal, usarPontos)
    
    if (result.success && result.pedidoId) {
      router.push(`/aluno/pagamento/${result.pedidoId}`)
    } else {
      setError(result.error || 'Erro ao processar o pedido. Tente novamente.')
      setIsPending(false)
    }
  }

  return (
    <div className="mt-8 relative z-10">
      
      <h3 className="text-xl md:text-2xl font-black text-[#383b32] mb-6 tracking-tight">Em quais dias você vai comer na cantina?</h3>

      <div className="grid grid-cols-2 md:grid-cols-1 gap-3 mb-24 relative z-10">
        {diasSemanaNomes.map((dia) => {
          const isSelected = diasSelecionados.includes(dia.id)
          const cardapioDia = cardapios.find(c => c.dia_semana === dia.id)
          const prato = cardapioDia?.prato_principal || 'A definir'
          const preco = cardapioDia ? Number(cardapioDia.valor_diario) : 0
          const precoComDesconto = preco * (1 - descontoPercentual / 100)
          
          return (
            <motion.button
              key={dia.id}
              onClick={() => toggleDia(dia.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`
                relative rounded-2xl border-2 text-left transition-all overflow-hidden flex flex-col p-5
                ${isSelected 
                  ? 'border-nina-gold-400 bg-[#f4f0e6] shadow-sm' 
                  : 'border-[#e8e3d5] bg-[#f4f0e6] hover:border-nina-gold-300'
                }
              `}
            >
              {/* Checkmark animado */}
              <div className={`absolute top-5 right-5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm z-10 ${
                isSelected ? 'bg-nina-gold-500 text-white scale-100' : 'bg-[#e8e3d5] text-[#383b32]/30 scale-90'
              }`}>
                <Check size={14} className="stroke-[3]" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#e8e3d5] text-[#383b32] text-[10px] font-bold uppercase tracking-wider mb-3">
                  {dia.label}
                </span>
                
                <h3 className={`text-xl font-bold leading-tight mb-2 ${
                  isSelected ? 'text-[#383b32]' : 'text-[#383b32]/80'
                }`}>{prato}</h3>
                
                <div className="flex items-center gap-1.5 font-bold text-sm text-nina-olive-600">
                  <Utensils size={14} />
                  {descontoPercentual > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="line-through text-[#383b32]/40 text-xs font-semibold">R$ {preco.toFixed(2).replace('.', ',')}</span>
                      <span className="text-nina-gold-600">R$ {precoComDesconto.toFixed(2).replace('.', ',')}</span>
                      <span className="bg-nina-gold-400/20 text-nina-gold-700 text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-nina-gold-400/30">-{descontoPercentual}%</span>
                    </div>
                  ) : (
                    <span>R$ {preco.toFixed(2).replace('.', ',')}</span>
                  )}
                </div>
                
                {isSelected && (cardapioDia?.proteina_1 || cardapioDia?.proteina_2) && (
                  <div className="mt-4 p-3 bg-white/60 rounded-xl border border-[#e8e3d5] shadow-sm" onClick={(e) => e.stopPropagation()}>
                    <label className="block text-xs font-bold text-[#383b32] mb-2">Escolha sua proteína:</label>
                    <div className="flex flex-wrap gap-2">
                      {[cardapioDia?.proteina_1, cardapioDia?.proteina_2].filter(Boolean).map(proteina => (
                        <button
                          key={proteina}
                          type="button"
                          onClick={() => setProteinasSelecionadas({ ...proteinasSelecionadas, [dia.id]: proteina as string })}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            proteinasSelecionadas[dia.id] === proteina
                              ? 'bg-nina-gold-400 text-nina-olive-900 shadow-sm'
                              : 'bg-white text-[#383b32]/70 border border-[#e8e3d5] hover:border-nina-gold-300'
                          }`}
                        >
                          {proteina}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      <motion.div 
        className="fixed bottom-[4.5rem] md:bottom-8 left-4 right-4 md:static md:left-auto md:right-auto z-40 md:mt-8"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className={`bg-nina-olive-700 p-5 md:p-6 rounded-2xl shadow-lg flex flex-row items-center justify-between gap-4 transition-all duration-300 ${
            diasSelecionados.length > 0 ? 'ring-2 ring-nina-gold-400' : ''
          }`}>
            
            <div className="flex flex-col">
              {pontosFidelidade >= 100 && diasSelecionados.length > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => setUsarPontos(!usarPontos)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      usarPontos 
                        ? 'bg-nina-gold-400 text-nina-olive-900 border-nina-gold-400' 
                        : 'bg-transparent text-nina-gold-400 border-nina-gold-400/50 hover:bg-nina-gold-400/10'
                    }`}
                  >
                    <Gift size={14} />
                    {usarPontos ? 'Usando 100 Pontos' : 'Resgatar 1 Refeição (100 pts)'}
                  </button>
                </div>
              )}
              
              <span className="text-nina-olive-200 font-bold text-sm uppercase tracking-wider">
                Total {temDesconto && <span className="text-nina-gold-400 ml-1">(-{descontoPercentual}%)</span>}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-black text-[#f4f0e6] tracking-tighter">
                  R$ {valorFinal.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-[#383b32] font-bold text-xs ml-2 bg-nina-gold-400 px-2 py-0.5 rounded-md">
                  {diasSelecionados.length} dia{diasSelecionados.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || diasSelecionados.length === 0}
              className="bg-nina-gold-500 hover:bg-nina-gold-400 text-nina-olive-900 font-black text-sm md:text-base py-3 md:py-4 px-6 md:px-10 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:-translate-y-1 flex items-center justify-center gap-2 min-w-[140px]"
            >
              {isPending ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <ShoppingBag size={20} />
                  Confirmar
                </>
              )}
            </button>
            {error && (
              <p className="text-red-400 text-sm font-medium mt-2 w-full text-center">{error}</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
