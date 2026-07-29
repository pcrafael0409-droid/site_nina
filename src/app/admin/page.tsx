import { createClient } from '@/lib/supabase/server'
import { DollarSign, Users } from 'lucide-react'
import Link from 'next/link'
import { MotionDiv, staggerContainer, slideUpItem } from '@/components/Motion'
import VendasChart from './VendasChart'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Buscar estatísticas básicas
  const { count: usuariosCount } = await supabase
    .from('usuarios')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'aluno')

  const { data: pedidosData } = await supabase
    .from('pedidos')
    .select('valor_total, status, dias_semana, created_at')

  const faturamento = pedidosData
    ?.filter((p) => p.status === 'pago' || p.status === 'entregue')
    .reduce((acc, curr) => acc + Number(curr.valor_total), 0) || 0

  // CALCULAR DADOS DO GRÁFICO (Histórico de Refeições)
  const diasMap = new Map<string, number>()

  pedidosData?.forEach(p => {
    if (p.status === 'pago' || p.status === 'entregue') {
      const createdAt = new Date(p.created_at)
      const referenceDate = new Date(createdAt)
      const dia = referenceDate.getDay()
      if (dia === 6) referenceDate.setDate(referenceDate.getDate() + 2)
      else if (dia === 0) referenceDate.setDate(referenceDate.getDate() + 1)
      
      const refDia = referenceDate.getDay()
      const startOfWeek = new Date(referenceDate)
      startOfWeek.setDate(startOfWeek.getDate() - refDia + (refDia === 0 ? -6 : 1))
      startOfWeek.setHours(0, 0, 0, 0)

      if (Array.isArray(p.dias_semana)) {
        p.dias_semana.forEach(d => {
          if (d >= 1 && d <= 5) {
            const mealDate = new Date(startOfWeek)
            mealDate.setDate(mealDate.getDate() + (d - 1))
            
            const dateStr = mealDate.toISOString().split('T')[0]
            diasMap.set(dateStr, (diasMap.get(dateStr) || 0) + 1)
          }
        })
      }
    }
  })

  const chartData = Array.from(diasMap.entries()).map(([dateStr, count]) => ({
    dateStr,
    count
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[#383b32] tracking-tight">Visão Geral</h1>
        <p className="text-nina-dark-300 mt-1">Bem-vindo ao centro de comando da cantina.</p>
      </div>
      
      <MotionDiv 
        className="flex flex-col gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <MotionDiv variants={slideUpItem}>
          <Link href="/admin/usuarios" className="block cursor-pointer">
            <div className="solid-card p-6 md:p-8 flex items-center justify-between group">
              <div>
                <p className="text-nina-dark-300 font-bold tracking-wider text-xs uppercase mb-2">Total de Alunos</p>
                <p className="text-4xl md:text-5xl font-black tracking-tighter text-[#383b32]">{usuariosCount || 0}</p>
              </div>
              <div className="bg-[#e8e3d5] p-4 rounded-xl text-[#383b32] group-hover:bg-nina-red-400 transition-colors">
                <Users size={28} />
              </div>
            </div>
          </Link>
        </MotionDiv>

        <MotionDiv variants={slideUpItem}>
          <Link href="/admin/pedidos" className="block cursor-pointer">
            <div className="solid-card p-6 md:p-8 flex items-center justify-between group">
              <div>
                <p className="text-nina-dark-300 font-bold tracking-wider text-xs uppercase mb-2">Faturamento (Geral)</p>
                <p className="text-4xl md:text-5xl font-black tracking-tighter text-nina-red-500">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(faturamento)}
                </p>
              </div>
              <div className="bg-[#e8e3d5] p-4 rounded-xl text-[#383b32] group-hover:bg-nina-red-400 transition-colors hidden sm:block">
                <DollarSign size={28} />
              </div>
            </div>
          </Link>
        </MotionDiv>
      </MotionDiv>

      <MotionDiv variants={slideUpItem} initial="hidden" animate="show" className="pt-2">
        <div className="solid-card p-6 md:p-8 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#383b32] tracking-tight">Vendas da Semana</h2>
            <div className="flex items-center gap-2 bg-[#e8e3d5] px-4 py-2 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-nina-red-500"></span>
              <span className="text-xs font-bold text-[#383b32]">Refeições Agendadas</span>
            </div>
          </div>
          
          <VendasChart chartData={chartData} />
        </div>
      </MotionDiv>
    </div>
  )
}
