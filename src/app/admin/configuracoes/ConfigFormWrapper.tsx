'use client'

import { useState } from 'react'
import { salvarConfiguracoes } from '@/app/actions/admin'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function ConfigFormWrapper({ config }: { config: any }) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      const result = await salvarConfiguracoes(formData)
      
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Configurações salvas com sucesso!')
        router.refresh()
      }
    } catch (error) {
      toast.error('Erro inesperado ao salvar.')
    } finally {
      setIsPending(false)
    }
  }

  const inputClasses = "appearance-none relative block w-full px-4 py-3 bg-[#fdfcfa] border border-[#e8e3d5] placeholder-[#383b32]/30 text-[#383b32] font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-nina-red-400/50 focus:border-nina-red-400 focus:bg-white transition-all shadow-sm sm:text-sm"

  return (
    <form onSubmit={handleSubmit} className="space-y-8 solid-card p-8 md:p-10 mt-4 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-nina-red-400/5 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      <input type="hidden" name="id" value={config?.id || 1} />
      

      <div>
        <label htmlFor="horario_limite_pedido" className="block text-sm font-bold text-[#383b32] mb-2">
          Horário Limite para Pedidos
        </label>
        <input
          type="time"
          id="horario_limite_pedido"
          name="horario_limite_pedido"
          required
          defaultValue={config?.horario_limite_pedido ? config.horario_limite_pedido.substring(0, 5) : '08:00'}
          className={inputClasses}
        />
        <p className="text-xs text-[#383b32]/50 mt-2 font-medium">Até que horas do dia anterior ou do próprio dia o aluno pode fazer/cancelar o pedido.</p>
      </div>

      <div>
        <label htmlFor="dias_antecedencia" className="block text-sm font-bold text-[#383b32] mb-2">
          Dias de Antecedência
        </label>
        <input
          type="number"
          id="dias_antecedencia"
          name="dias_antecedencia"
          min="0"
          required
          defaultValue={config?.dias_antecedencia || 1}
          className={inputClasses}
        />
        <p className="text-xs text-[#383b32]/50 mt-2 font-medium">Quantos dias de antecedência para o limite de horário. (1 = dia anterior, 0 = no mesmo dia).</p>
      </div>


      <div className="pt-6 border-t border-[#e8e3d5]/50"></div>

      <div>
        <label htmlFor="desconto_professor_percentual" className="block text-sm font-bold text-[#383b32] mb-2">
          Desconto para Professores e Funcionários (%)
        </label>
        <input
          type="number"
          id="desconto_professor_percentual"
          name="desconto_professor_percentual"
          step="0.01"
          min="0"
          max="100"
          required
          defaultValue={config?.desconto_professor_percentual || 0}
          className={inputClasses}
        />
        <p className="text-xs text-[#383b32]/50 mt-2 font-medium">Porcentagem de desconto aplicada automaticamente nos pedidos de professores.</p>
      </div>

      <div className="pt-8 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-8 py-3.5 bg-nina-red-400 text-nina-dark-900 font-bold text-sm uppercase tracking-wide rounded-xl hover:bg-nina-red-500 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nina-red-400 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isPending ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </form>
  )
}
