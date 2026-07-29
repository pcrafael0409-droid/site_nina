import { createClient } from '@/lib/supabase/server'
import ConfigFormWrapper from './ConfigFormWrapper'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()

  // Buscar configurações atuais
  const { data: config } = await supabase
    .from('configuracoes')
    .select('*')
    .limit(1)
    .single()

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#383b32]">Configurações do Sistema</h1>
        <p className="text-nina-dark-400">Ajuste os parâmetros gerais da cantina.</p>
      </div>

      <div className="solid-card rounded-xl p-6 max-w-2xl shadow-sm">
        <ConfigFormWrapper config={config} />
      </div>
    </div>
  )
}
