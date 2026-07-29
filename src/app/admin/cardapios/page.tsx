import { createClient } from '@/lib/supabase/server'
import CardapioDiaForm from './CardapioDiaForm'

export default async function AdminCardapiosPage() {
  const supabase = await createClient()

  const { data: cardapios } = await supabase
    .from('cardapios')
    .select('*')
    .order('dia_semana', { ascending: true })

  const dias = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira']

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold text-[#383b32] mb-2">Cardápio Fixo da Cantina</h1>
      <p className="text-nina-dark-400 mb-8">
        Defina o prato principal para cada dia da semana. Este cardápio se repetirá automaticamente todas as semanas.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {cardapios?.map((cardapio) => (
          <CardapioDiaForm 
            key={cardapio.id} 
            cardapio={cardapio} 
            nomeDia={dias[cardapio.dia_semana - 1]} 
          />
        ))}
      </div>
    </div>
  )
}
