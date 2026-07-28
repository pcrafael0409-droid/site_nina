import { createClient } from '@/lib/supabase/server'
import FormularioPedido from './FormularioPedido'
import { UtensilsCrossed, Sparkles } from 'lucide-react'

export default async function AlunoDashboard() {
  const supabase = await createClient()

  // Busca o usuário logado primeiro para usar o ID
  const { data: { user } } = await supabase.auth.getUser()

  // Executar todas as queries em paralelo para melhorar muito a velocidade (Performance fix)
  const [
    { data: cardapios },
    { data: usuario },
    { data: config }
  ] = await Promise.all([
    supabase.from('cardapios').select('*').order('dia_semana', { ascending: true }),
    supabase.from('usuarios').select('nome_completo, turma, pontos_fidelidade').eq('id', user?.id).single(),
    supabase.from('configuracoes').select('desconto_professor_percentual').single()
  ])

  const primeiroNome = usuario?.nome_completo?.split(' ')[0] || 'Aluno'
  const isProfessor = usuario?.turma?.toLowerCase().includes('professor') || usuario?.turma?.toLowerCase().includes('funcionário')
  const pontosFidelidade = usuario?.pontos_fidelidade || 0
    
  const descontoPercentual = isProfessor ? (config?.desconto_professor_percentual || 0) : 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-nina-olive-600 p-8 md:p-10 rounded-[2rem] shadow-md relative overflow-hidden text-[#f4f0e6]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-nina-olive-500 rounded-full blur-3xl opacity-50 -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
            Olá, <span className="text-nina-gold-400">{primeiroNome}</span>! 👋
          </h1>
          <p className="text-nina-olive-100 text-lg font-medium max-w-xl">
            O que vamos comer hoje? Agende suas refeições da semana e evite filas.
          </p>
        </div>
      </div>

      {!cardapios || cardapios.length === 0 ? (
        <div className="bg-white/80 p-12 rounded-[2rem] shadow-sm border border-stone-100 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <UtensilsCrossed className="text-stone-400" size={40} />
          </div>
          <h2 className="text-2xl font-black text-stone-800 mb-2">Cardápio em construção</h2>
          <p className="text-stone-500 font-medium max-w-sm">
            Nossa equipe ainda está preparando as delícias desta semana. Volte daqui a pouco!
          </p>
        </div>
      ) : (
        <FormularioPedido cardapios={cardapios} descontoPercentual={descontoPercentual} pontosFidelidade={pontosFidelidade} />
      )}
    </div>
  )
}
