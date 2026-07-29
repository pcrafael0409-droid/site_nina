import { createClient } from '@/lib/supabase/server'
import { Flame, Star, Gift, Trophy } from 'lucide-react'

export default async function ClubeNinaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: usuarioData } = await supabase
    .from('usuarios')
    .select('pontos_fidelidade')
    .eq('id', user?.id)
    .single()

  // Calculate Loyalty Points from database
  const pontos = usuarioData?.pontos_fidelidade || 0
  const pontosParaRecompensa = 100
  const progresso = Math.min(100, (pontos / pontosParaRecompensa) * 100)
  const nivel = Math.floor(pontos / 50) + 1

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-nina-dark-900 tracking-tight flex items-center justify-center gap-3">
          Clube Nina <Flame className="text-nina-red-600 w-8 h-8 md:w-10 md:h-10" />
        </h1>
        <p className="text-gray-500 font-medium text-lg">Seu programa de fidelidade. Coma bem e ganhe recompensas!</p>
      </div>

      <div className="bg-[#fcf9f2] border border-[#e8e3d5] rounded-sm p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-nina-red-400/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-nina-red-400/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-[#e8e3d5]">
            <Trophy className="w-10 h-10 text-nina-red-500 drop-shadow-sm" />
          </div>
          
          <h2 className="text-3xl font-serif font-bold text-nina-dark-900 mb-1">Nível {nivel}</h2>


          <div className="w-full bg-[#e8e3d5] rounded-full h-4 overflow-hidden mb-4 relative">
            <div 
              className="bg-nina-red-500 h-full rounded-full transition-all duration-1000 ease-out relative" 
              style={{ width: `${progresso}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
            </div>
          </div>

          <div className="w-full flex justify-between items-center text-xs font-mono font-bold text-gray-500 tracking-widest">
            <span>{pontos} PTS</span>
            <span>{pontosParaRecompensa} PTS</span>
          </div>

          <div className="mt-8 pt-8 border-t border-dashed border-[#d6c0b3] w-full flex flex-col items-center">
            {pontos >= pontosParaRecompensa ? (
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#e6f4ea] text-[#137333] mb-2 border border-green-100">
                  <Gift size={32} />
                </div>
                <h3 className="text-xl font-serif font-bold text-nina-dark-900">Recompensa Desbloqueada!</h3>
                <p className="text-gray-600 font-sans">Apresente-se na cantina para retirar sua refeição grátis. Aproveite!</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-700 font-serif font-bold mb-1 text-lg">
                  Faltam apenas <span className="text-nina-red-600 font-bold text-2xl">{pontosParaRecompensa - pontos}</span> pontos!
                </p>
                <p className="text-gray-500 text-sm">Cada refeição comprada vale 2 pontos.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#fcf9f2] border border-[#e8e3d5] rounded-sm p-6 flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-sm shrink-0 border border-blue-100">
            <Star size={24} />
          </div>
          <div>
            <h4 className="font-serif font-bold text-nina-dark-900 mb-1">Como Funciona?</h4>
            <p className="text-sm text-gray-500">Ao realizar qualquer pedido e ter o pagamento confirmado, você acumula automaticamente 2 pontos na sua conta.</p>
          </div>
        </div>
        <div className="bg-[#fcf9f2] border border-[#e8e3d5] rounded-sm p-6 flex items-start gap-4">
          <div className="p-3 bg-[#fdf2f8] text-[#db2777] rounded-sm shrink-0 border border-[#fbcfe8]">
            <Gift size={24} />
          </div>
          <div>
            <h4 className="font-serif font-bold text-nina-dark-900 mb-1">A Recompensa</h4>
            <p className="text-sm text-gray-500">Acumule 100 pontos e ganhe uma refeição totalmente de graça em qualquer dia da semana na Cantina Nina!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
