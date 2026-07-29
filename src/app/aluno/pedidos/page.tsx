import { createClient } from '@/lib/supabase/server'
import { Receipt, Clock, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import BotaoCancelarPedido from './BotaoCancelarPedido'

export default async function MeusPedidosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select(`
      *
    `)
    .eq('usuario_id', user?.id)
    .neq('status', 'cancelado')
    .order('created_at', { ascending: false })

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pendente': return { color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock, label: 'Aguardando Pagamento' }
      case 'pago': return { color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle2, label: 'Pago' }
      case 'cancelado': return { color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle, label: 'Cancelado' }
      case 'entregue': return { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: CheckCircle2, label: 'Entregue' }
      default: return { color: 'text-slate-600 bg-slate-50 border-slate-200', icon: Clock, label: status }
    }
  }

  const getDiasTexto = (dias: number[], proteinas: Record<string, string> | null) => {
    const nomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    return dias.map(d => {
      const p = proteinas && proteinas[d] ? ` (${proteinas[d]})` : ''
      return nomes[d] + p
    }).join(', ')
  }

  // Calculate Loyalty Points
  const pedidosPagos = pedidos?.filter(p => p.status === 'pago' || p.status === 'entregue') || []
  const pontos = pedidosPagos.length * 10
  const pontosParaRecompensa = 100
  const progresso = Math.min(100, (pontos / pontosParaRecompensa) * 100)

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-black text-[#383b32] mb-6 flex items-center gap-3 tracking-tight">
        <Receipt className="text-nina-red-500 w-8 h-8" />
        Meus Pedidos
      </h1>

      {(!pedidos || pedidos.length === 0) ? (
        <div className="solid-card p-10 flex flex-col items-center justify-center min-h-[300px]">
          <Receipt className="text-nina-dark-300 w-16 h-16 mb-4" />
          <p className="text-xl font-semibold text-nina-dark-400">Você ainda não fez nenhum pedido.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => {
            const statusConfig = getStatusConfig(pedido.status)
            const StatusIcon = statusConfig.icon
            
            const cardContent = (
                <div className="w-full relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-[#383b32] text-lg tracking-tight">Refeições da Cantina</h3>
                    {pedido.status === 'pendente' && (
                      <BotaoCancelarPedido pedidoId={pedido.id} />
                    )}
                  </div>
                  <div className="text-sm font-medium text-nina-dark-400 mb-3 bg-[#e8e3d5]/50 inline-block px-3 py-1.5 rounded-lg border border-[#e8e3d5]">
                    <span className="text-nina-dark-400">Dias:</span> <span className="text-[#383b32]">{getDiasTexto(pedido.dias_semana, pedido.proteinas)}</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2 pt-4 border-t border-[#e8e3d5]">
                    <div className="text-xs font-semibold text-nina-dark-300 uppercase tracking-wider">
                      Criado em {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
                        pedido.status === 'pendente' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                        pedido.status === 'pago' ? 'text-nina-dark-800 bg-nina-red-400 border-nina-red-500' :
                        pedido.status === 'entregue' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                        'text-nina-dark-500 bg-[#e8e3d5] border-[#c9cebf]'
                      }`}>
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </div>
                      <span className="font-black text-xl text-[#383b32]">
                        R$ {pedido.valor_total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>
              )
              
              if (pedido.status === 'pendente') {
                return (
                  <Link 
                    href={`/aluno/pagamento/${pedido.id}`}
                    key={pedido.id} 
                    className="block solid-card p-6 flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden group border-nina-red-400 hover:-translate-y-1"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-nina-red-400"></div>
                    {cardContent}
                  </Link>
                )
              }

              return (
                <div key={pedido.id} className="solid-card p-6 flex flex-col justify-between gap-4 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${pedido.status === 'pago' || pedido.status === 'entregue' ? 'bg-nina-dark-600' : 'bg-[#c9cebf]'}`}></div>
                  {cardContent}
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
