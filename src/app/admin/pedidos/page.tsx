import { createClient } from '@/lib/supabase/server'
import { ReceiptText } from 'lucide-react'
import { MotionDiv, staggerContainer, fadeItem } from '@/components/Motion'

export default async function AdminPedidosPage() {
  const supabase = await createClient()

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select(`
      id,
      status,
      valor_total,
      dias_semana,
      proteinas,
      created_at,
      usuarios ( nome_completo, turma )
    `)
    .in('status', ['pago', 'entregue'])
    .order('created_at', { ascending: false })

  const diasNomes: Record<number, string> = {
    1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex'
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#383b32] mb-2">Todos os Pedidos</h1>
          <p className="text-[#383b32]/60">Histórico completo de pedidos realizados na cantina.</p>
        </div>
      </div>

      {!pedidos?.length ? (
        <div className="solid-card p-12 text-center flex flex-col items-center justify-center">
          <ReceiptText size={48} className="text-[#383b32]/20 mb-3" />
          <p className="text-[#383b32]/40 font-medium">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <MotionDiv
          className="flex flex-col gap-3"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {pedidos.map((pedido) => {
            const nome = (pedido.usuarios as any)?.nome_completo || 'Aluno Excluído'
            const turma = (pedido.usuarios as any)?.turma || '-'
            const isEntregue = pedido.status === 'entregue'
            const isPago = pedido.status === 'pago'

            return (
              <MotionDiv key={pedido.id} variants={fadeItem}>
                <div className="solid-card p-4 md:p-5 flex flex-col gap-3">
                  {/* Top row: avatar + name + status */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#f4f0e6] text-[#383b32]/50 flex items-center justify-center shrink-0 font-bold text-sm uppercase border border-[#e8e3d5]">
                        {nome.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#383b32] text-sm truncate">{nome}</p>
                        <p className="text-xs text-[#383b32]/50">{new Date(pedido.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                      isEntregue ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      isPago ? 'bg-nina-gold-400 text-nina-olive-900 border-nina-gold-500' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {pedido.status}
                    </span>
                  </div>

                  {/* Bottom row: turma + dias + valor */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#f4f0e6] text-[#383b32]/70 text-xs px-2.5 py-1 rounded-lg font-bold border border-[#e8e3d5]">
                      {turma}
                    </span>
                    <div className="flex gap-1 flex-wrap flex-1">
                      {pedido.dias_semana?.map((d: number) => {
                        const proteina = pedido.proteinas && pedido.proteinas[d] ? ` (${pedido.proteinas[d]})` : '';
                        return (
                          <span key={d} className="bg-[#f4f0e6] text-[#383b32]/70 text-xs px-2 py-1 rounded-lg font-bold border border-[#e8e3d5]">
                            {diasNomes[d]}{proteina}
                          </span>
                        );
                      })}
                    </div>
                    <span className="ml-auto font-black text-[#383b32] text-sm">
                      R$ {Number(pedido.valor_total).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </MotionDiv>
            )
          })}
        </MotionDiv>
      )}
    </div>
  )
}
