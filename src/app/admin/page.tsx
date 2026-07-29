import { createClient } from '@/lib/supabase/server'
import { DollarSign, Users } from 'lucide-react'
import Link from 'next/link'
import { MotionDiv, staggerContainer, slideUpItem } from '@/components/Motion'

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

  // Obter o início da semana (Segunda-feira)
  const agora = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
  const startOfWeek = new Date(agora)
  const diaSemana = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1) // ajusta se for domingo
  startOfWeek.setDate(diff)
  startOfWeek.setHours(0, 0, 0, 0)

  // Calcular pedidos da semana por dia
  const chartData = [0, 0, 0, 0, 0] // Seg, Ter, Qua, Qui, Sex
  pedidosData?.forEach(p => {
    if ((p.status === 'pago' || p.status === 'entregue') && new Date(p.created_at) >= startOfWeek) {
      if (Array.isArray(p.dias_semana)) {
        p.dias_semana.forEach(dia => {
          if (dia >= 1 && dia <= 5) {
            chartData[dia - 1]++
          }
        })
      }
    }
  })

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
        <div className="solid-card p-6 md:p-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-xl font-bold text-[#383b32] tracking-tight">Vendas da Semana</h2>
            <div className="flex items-center gap-2 bg-[#e8e3d5] px-4 py-2 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-nina-red-500"></span>
              <span className="text-xs font-bold text-[#383b32]">Refeições Agendadas</span>
            </div>
          </div>
          
          <div className="h-48 flex items-end justify-between gap-2 md:gap-6 relative">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between border-b border-[#e8e3d5] z-0">
              <div className="w-full h-full border-b border-[#e8e3d5] opacity-0"></div>
            </div>

            {/* Bars */}
            {[1, 2, 3, 4, 5].map((dia, idx) => {
              const maxVal = Math.max(...chartData, 1) // Prevent division by 0
              const heightPercentage = (chartData[idx] / maxVal) * 100
              const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
              
              return (
                <div key={dia} className="relative z-10 flex flex-col items-center flex-1 h-full justify-end group">
                  <div className="w-full max-w-[4rem] relative flex items-end justify-center h-full">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-nina-dark-700 text-[#f4f0e6] text-xs font-bold px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                      {chartData[idx]} refeições
                    </div>
                    {/* Bar Fill */}
                    <div 
                      className="w-full bg-nina-red-400 rounded-sm transition-all duration-700 ease-out group-hover:bg-nina-red-500" 
                      style={{ height: `${Math.max(heightPercentage, 2)}%`, minHeight: '4px' }}
                    ></div>
                  </div>
                  <span className="text-[#383b32]/60 font-bold mt-4 text-xs uppercase tracking-wider">{dias[idx]}</span>
                </div>
              )
            })}
          </div>
        </div>
      </MotionDiv>
    </div>
  )
}
