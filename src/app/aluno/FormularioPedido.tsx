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
  primeiroNome = 'Aluno',
  gastoSemanal = 0
}: { 
  cardapios: Cardapio[], 
  descontoPercentual?: number, 
  pontosFidelidade?: number,
  horarioLimitePedido?: string,
  diasAntecedencia?: number,
  primeiroNome?: string,
  gastoSemanal?: number
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
      <div className="bg-transparent border-b border-dashed border-[#d6c0b3] pb-6 mb-8 flex flex-col md:flex-row justify-between md:items-end gap-6 relative z-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-2 text-nina-dark-900">
            Olá, <span className="text-nina-red-600">{primeiroNome}</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg">
            Agende suas refeições da semana e evite filas.
          </p>
        </div>

        <div className="text-left md:text-right bg-[#fcf9f2] border border-[#e8e3d5] p-4 rounded-sm shadow-sm min-w-[200px]">
           <span className="font-mono text-gray-500 font-bold text-[11px] uppercase tracking-widest block mb-1">Gastos na semana</span>
           <span className="text-3xl font-mono font-bold text-nina-dark-900">R$ {gastoSemanal.toFixed(2).replace('.', ',')}</span>
        </div>
      </div>

      <h3 className="text-xl font-serif font-bold text-nina-dark-900 mb-6 tracking-tight">Em quais dias você vai comer na cantina?</h3>

      <div className="flex flex-col gap-4 mb-24 relative z-10">
        {diasSemanaNomes.map((dia) => {
          const cardapioDia = cardapios.find(c => c.dia_semana === dia.id)
          const isSelected = diasSelecionados.includes(dia.id)
          const disponivel = isDiaDisponivel(dia.id)
          
          if (!cardapioDia) {
            return (
              <div key={dia.id} className="bg-nina-bg-light rounded-sm p-6 border border-nina-red-100 opacity-70">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-nina-dark-500 text-base">{dia.label}</span>
                </div>
                <div className="text-sm font-semibold text-nina-dark-300">Sem cardápio definido</div>
              </div>
            )
          }

          const preco = cardapioDia.valor_diario
          const precoComDesconto = descontoPercentual > 0 ? preco * (1 - descontoPercentual / 100) : preco

          return (
            <motion.div
              key={dia.id}
              whileHover={disponivel ? { y: -2 } : {}}
              className={`w-full text-left rounded-sm p-6 transition-all duration-300 relative flex flex-col ${
                isSelected 
                  ? 'border border-nina-red-500 bg-white shadow-[0_10px_30px_-10px_rgba(224,82,82,0.2)]' 
                  : disponivel 
                    ? 'border border-[#e8e3d5] bg-[#fcf9f2] hover:border-[#d6c0b3] hover:shadow-sm'
                    : 'bg-[#f4f0e6] border border-[#e8e3d5] opacity-60'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-nina-red-600 text-white flex items-center justify-center shadow-sm z-10 border-[3px] border-white">
                  <Check size={16} className="stroke-[3]" />
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer" onClick={() => disponivel && toggleDia(dia.id)}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`font-mono text-sm font-bold tracking-widest uppercase ${
                      isSelected ? 'text-nina-red-600' : 'text-gray-500'
                    }`}>
                      {dia.label}
                    </span>
                    {!disponivel && (
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-gray-200 text-gray-500 px-2 py-0.5 rounded-sm">
                        encerrado
                      </span>
                    )}
                  </div>
                  
                  <h3 className={`text-2xl md:text-3xl font-serif font-bold leading-tight mb-2 ${
                    isSelected ? 'text-nina-dark-900' : 'text-gray-700'
                  }`}>{cardapioDia.prato_principal}</h3>
                  <p className="text-sm md:text-base text-gray-500">{cardapioDia.acompanhamentos}</p>
                </div>
                
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 md:border-l border-dashed border-gray-300 pt-4 md:pt-0 md:pl-6 min-w-[120px]">
                  <div className={`font-mono font-bold text-xl md:text-2xl ${isSelected ? 'text-nina-dark-900' : 'text-gray-600'}`}>
                    {descontoPercentual > 0 ? (
                      <div className="flex flex-col md:items-end">
                        <span className="text-[9px] text-nina-red-600 bg-nina-red-50 border border-nina-red-100 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider mb-1">
                          Desconto Prof.
                        </span>
                        <span className="line-through text-gray-400 text-sm">R$ {preco.toFixed(2).replace('.', ',')}</span>
                        <span>R$ {precoComDesconto.toFixed(2).replace('.', ',')}</span>
                      </div>
                    ) : (
                      <span>R$ {preco.toFixed(2).replace('.', ',')}</span>
                    )}
                  </div>
                </div>
              </div>
              
              {(cardapioDia?.proteina_1 || cardapioDia?.proteina_2) && (
                <div className={`mt-5 pt-4 border-t border-dashed ${isSelected ? 'border-gray-300' : 'border-[#e8e3d5]'}`}>
                  <span className={`font-mono text-[11px] font-bold tracking-widest uppercase mb-3 block ${isSelected ? 'text-gray-500' : 'text-gray-400'}`}>
                    {isSelected ? 'ESCOLHA SUA OPÇÃO DE PROTEÍNA:' : 'OPÇÕES DE PROTEÍNA DESTE DIA:'}
                  </span>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {[cardapioDia?.proteina_1, cardapioDia?.proteina_2].filter(Boolean).map(proteina => (
                      <button
                        key={proteina}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!disponivel) return;
                          
                          if (!isSelected) {
                            setDiasSelecionados([...diasSelecionados, dia.id]);
                          }
                          setProteinasSelecionadas({ ...proteinasSelecionadas, [dia.id]: proteina as string });
                        }}
                        className={`flex-1 px-4 py-3 text-sm font-bold rounded-sm transition-all border ${
                          proteinasSelecionadas[dia.id] === proteina && isSelected
                            ? 'bg-nina-red-50 text-nina-red-600 border-nina-red-200 shadow-[inset_0_0_0_1px_rgba(224,82,82,0.2)]'
                            : 'bg-white text-gray-600 border-[#e8e3d5] hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        {proteina}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
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
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mt-4 flex items-center justify-center w-full">
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
