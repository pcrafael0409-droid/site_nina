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

export default function FormularioPedido({ 
  cardapios, 
  descontoPercentual = 0, 
  pontosFidelidade = 0,
  horarioLimitePedido = '08:00:00',
  diasAntecedencia = 1,
  primeiroNome = 'Aluno'
}: { 
  cardapios: Cardapio[], 
  descontoPercentual?: number, 
  pontosFidelidade?: number,
  horarioLimitePedido?: string,
  diasAntecedencia?: number,
  primeiroNome?: string
}) {
  const router = useRouter()
  const [diasSelecionados, setDiasSelecionados] = useState<number[]>([])
  const [proteinasSelecionadas, setProteinasSelecionadas] = useState<Record<number, string>>({})
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')
  const [usarPontos, setUsarPontos] = useState(false)

  // Função para checar se o limite já passou
  const isDiaDisponivel = (diaSemana: number) => {
    const agora = new Date()
    const hoje = agora.getDay()
    const referenceDate = new Date(agora)

    // Se for sábado(6) ou domingo(0), considera como se já estivesse na segunda para calcular "próxima semana"
    if (hoje === 6) {
      referenceDate.setDate(referenceDate.getDate() + 2)
    } else if (hoje === 0) {
      referenceDate.setDate(referenceDate.getDate() + 1)
    }
    
    const diaRef = referenceDate.getDay() // 1 a 5
    const startOfWeek = new Date(referenceDate)
    startOfWeek.setDate(startOfWeek.getDate() - diaRef + 1)
    startOfWeek.setHours(0, 0, 0, 0)

    const dataAlvo = new Date(startOfWeek)
    dataAlvo.setDate(startOfWeek.getDate() + (diaSemana - 1))

    const dataLimite = new Date(dataAlvo)
    dataLimite.setDate(dataAlvo.getDate() - diasAntecedencia)

    const [horas, minutos] = horarioLimitePedido.split(':').map(Number)
    dataLimite.setHours(horas, minutos, 0, 0)

    return agora <= dataLimite
  }

  const toggleDia = (diaId: number) => {
    if (!isDiaDisponivel(diaId)) return;
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
    <div className="relative z-10 w-full max-w-[1000px] mx-auto">
      
      {/* Welcome Card */}
      <div className="bg-white border border-nina-red-200 p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between md:items-center mb-8">
        <div className="relative z-10 mb-4 md:mb-0">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-nina-dark-900">
            Olá, <span className="text-nina-red-500">{primeiroNome}</span>
          </h1>
          <p className="text-nina-dark-500 font-medium">
            Agende suas refeições da semana e evite filas.
          </p>
        </div>

        <div className="relative z-10 text-left md:text-right">
           <span className="text-nina-red-600 font-bold text-[11px] uppercase tracking-widest block mb-1">Total da semana</span>
           <span className="text-3xl font-black text-nina-dark-900">R$ {valorFinal.toFixed(2).replace('.', ',')}</span>
        </div>
      </div>

      <h3 className="text-lg md:text-xl font-bold text-nina-dark-900 mb-6 tracking-tight">Em quais dias você vai comer na cantina?</h3>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-24 relative z-10">
        {diasSemanaNomes.map((dia) => {
          const cardapioDia = cardapios.find(c => c.dia_semana === dia.id)
          const isSelected = diasSelecionados.includes(dia.id)
          const disponivel = isDiaDisponivel(dia.id)
          
          if (!cardapioDia) {
            return (
              <div key={dia.id} className="bg-nina-bg-light rounded-2xl p-4 md:p-5 border border-nina-red-100 opacity-70">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-nina-dark-500 text-base">{dia.label}</span>
                </div>
                <div className="text-xs font-semibold text-nina-dark-300">Sem cardápio definido</div>
              </div>
            )
          }

          const preco = cardapioDia.valor_diario
          const precoComDesconto = descontoPercentual > 0 ? preco * (1 - descontoPercentual / 100) : preco

          return (
            <motion.button
              key={dia.id}
              type="button"
              onClick={() => toggleDia(dia.id)}
              disabled={!disponivel}
              whileHover={disponivel ? { scale: 1.02, y: -2 } : {}}
              whileTap={disponivel ? { scale: 0.98 } : {}}
              className={`w-full text-left rounded-2xl p-4 md:p-5 transition-all duration-300 relative flex flex-col h-full ${
                isSelected 
                  ? 'border-2 border-nina-red-500 bg-white shadow-md' 
                  : disponivel 
                    ? 'border border-nina-red-100 bg-white hover:border-nina-red-300 hover:shadow-sm'
                    : 'bg-nina-bg-light border border-nina-red-100 opacity-60 cursor-not-allowed'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-nina-red-500 text-white flex items-center justify-center shadow-sm z-10">
                  <Check size={14} className="stroke-[3]" />
                </div>
              )}

              <div className="flex-grow flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-bold text-base transition-colors ${
                    isSelected ? 'text-nina-red-500' : 'text-nina-dark-500'
                  }`}>
                    {dia.label}
                  </span>
                  {!disponivel && (
                    <span className="text-[9px] uppercase font-bold tracking-wider bg-nina-dark-100 text-nina-dark-400 px-2 py-0.5 rounded-full">
                      encerrado
                    </span>
                  )}
                </div>
                
                <h3 className={`text-lg font-bold leading-tight mb-2 flex-grow ${
                  isSelected ? 'text-nina-dark-900' : 'text-nina-dark-500'
                }`}>{cardapioDia.prato_principal}</h3>
                
                <div className="mt-auto pt-2">
                  <div className={`font-bold text-sm ${isSelected ? 'text-nina-dark-900' : 'text-nina-dark-400'}`}>
                    {descontoPercentual > 0 ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="line-through text-nina-dark-300 text-xs">R$ {preco.toFixed(2).replace('.', ',')}</span>
                        <span>R$ {precoComDesconto.toFixed(2).replace('.', ',')}</span>
                      </div>
                    ) : (
                      <span>R$ {preco.toFixed(2).replace('.', ',')}</span>
                    )}
                  </div>
                </div>
                
                {isSelected && (cardapioDia?.proteina_1 || cardapioDia?.proteina_2) && (
                  <div className="mt-3 pt-3 border-t border-nina-red-100" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col gap-1.5">
                      {[cardapioDia?.proteina_1, cardapioDia?.proteina_2].filter(Boolean).map(proteina => (
                        <button
                          key={proteina}
                          type="button"
                          onClick={() => setProteinasSelecionadas({ ...proteinasSelecionadas, [dia.id]: proteina as string })}
                          className={`px-2 py-1.5 text-[11px] font-bold rounded-lg transition-all text-left ${
                            proteinasSelecionadas[dia.id] === proteina
                              ? 'bg-nina-red-50 text-nina-red-600 border border-nina-red-200'
                              : 'bg-transparent text-nina-dark-400 border border-nina-red-100 hover:bg-nina-red-50/50'
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
        className="fixed bottom-[4.5rem] md:bottom-8 left-4 right-4 md:static md:left-auto md:right-auto z-40 md:mt-8 max-w-xl mx-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="w-full">
          <div className={`bg-nina-dark-900 p-5 md:p-6 rounded-3xl shadow-[0_10px_40px_-10px_rgba(224,82,82,0.3)] flex flex-row items-center justify-between gap-4 transition-all duration-300 border border-nina-dark-700 ${
            diasSelecionados.length > 0 ? 'ring-2 ring-nina-red-500 ring-offset-4 ring-offset-background' : ''
          }`}>
            
            <div className="flex flex-col">
              {pontosFidelidade >= 100 && diasSelecionados.length > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => setUsarPontos(!usarPontos)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      usarPontos 
                        ? 'bg-nina-red-500 text-white border-nina-red-500' 
                        : 'bg-transparent text-nina-red-400 border-nina-red-400 hover:bg-nina-red-500/10'
                    }`}
                  >
                    <Gift size={14} />
                    {usarPontos ? 'Usando 100 Pontos' : 'Resgatar 1 Refeição (100 pts)'}
                  </button>
                </div>
              )}
              
              <span className="text-nina-dark-300 font-bold text-xs uppercase tracking-wider">
                Total {temDesconto && <span className="text-nina-red-400 ml-1">(-{descontoPercentual}%)</span>}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                  R$ {valorFinal.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-nina-dark-900 font-bold text-xs ml-2 bg-white px-2 py-1 rounded-lg">
                  {diasSelecionados.length} dia{diasSelecionados.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || diasSelecionados.length === 0}
              className="bg-nina-red-500 hover:bg-nina-red-400 text-white font-bold text-sm md:text-base py-3.5 md:py-4 px-6 md:px-8 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:-translate-y-1 flex items-center justify-center gap-2 min-w-[140px]"
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
              <p className="text-red-400 text-sm font-medium mt-2 w-full text-center absolute -top-8 left-0 right-0">{error}</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
