import { createClient } from '@/lib/supabase/server'
import FormularioPedido from './FormularioPedido'
import { UtensilsCrossed, Sparkles } from 'lucide-react'

export default async function AlunoDashboard() {
  const supabase = await createClient()

  // Busca o usuário logado primeiro para usar o ID
  const { data: { user } } = await supabase.auth.getUser()

  const hoje = new Date()
  const day = hoje.getDay() || 7 // 1-7 (segunda a domingo)
  const startOfWeek = new Date(hoje)
  startOfWeek.setHours(0,0,0,0)
  startOfWeek.setDate(hoje.getDate() - day + 1)

  // Executar todas as queries em paralelo para melhorar muito a velocidade (Performance fix)
  const [
    { data: cardapios },
    { data: usuario },
    { data: config },
    { data: pedidosSemana }
  ] = await Promise.all([
    supabase.from('cardapios').select('*').order('dia_semana', { ascending: true }),
    supabase.from('usuarios').select('nome_completo, turma, pontos_fidelidade').eq('id', user?.id).single(),
    supabase.from('configuracoes').select('desconto_professor_percentual, horario_limite_pedido, dias_antecedencia').single(),
    supabase.from('pedidos')
      .select('valor_total')
      .eq('usuario_id', user?.id)
      .in('status', ['pago', 'entregue'])
      .gte('created_at', startOfWeek.toISOString())
  ])

  const primeiroNome = usuario?.nome_completo?.split(' ')[0] || 'Aluno'
  const isProfessor = usuario?.turma?.toLowerCase().includes('professor') || usuario?.turma?.toLowerCase().includes('funcionário')
  const pontosFidelidade = usuario?.pontos_fidelidade || 0
    
  const descontoPercentual = isProfessor ? (config?.desconto_professor_percentual || 0) : 0
  
  const gastoSemanal = pedidosSemana?.reduce((acc, pedido) => acc + Number(pedido.valor_total), 0) || 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!cardapios || cardapios.length === 0 ? (
        <div className="bg-white/80 p-12 rounded-[2rem] shadow-sm border border-stone-100 text-center flex flex-col items-center justify-center mt-8">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <UtensilsCrossed className="text-stone-400" size={40} />
          </div>
          <h2 className="text-2xl font-black text-stone-800 mb-2">Cardápio em construção</h2>
          <p className="text-stone-500 font-medium max-w-sm">
            Nossa equipe ainda está preparando as delícias desta semana. Volte daqui a pouco!
          </p>
        </div>
      ) : (
        <FormularioPedido 
          cardapios={cardapios} 
          descontoPercentual={descontoPercentual} 
          pontosFidelidade={pontosFidelidade}
          horarioLimitePedido={config?.horario_limite_pedido || '08:00:00'}
          diasAntecedencia={config?.dias_antecedencia ?? 1}
          primeiroNome={primeiroNome}
          gastoSemanal={gastoSemanal}
        />
      )}
    </div>
  )
}
