import { createClient } from '@/lib/supabase/server'
import { Calendar, AlertCircle } from 'lucide-react'
import BotaoEntregar from './BotaoEntregar'
import BotaoImprimir from './BotaoImprimir'
import FiltroDias from './FiltroDias'

export default async function FuncionarioDashboard(
  props: { searchParams: Promise<{ dia?: string }> }
) {
  const searchParams = await props.searchParams;
  const supabase = await createClient()

  const agoraBRT = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
  const diaSemanaAtual = agoraBRT.getDay()
  
  const diaQuery = searchParams.dia
  let diaSemana = diaQuery ? parseInt(diaQuery) : diaSemanaAtual
  
  if (!diaQuery && (diaSemana === 0 || diaSemana === 6)) {
    diaSemana = 1
  }

  const nomesDias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

  const startOfWeek = new Date(agoraBRT)
  const diaSemAtual = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - diaSemAtual + (diaSemAtual === 0 ? -6 : 1)
  startOfWeek.setDate(diff)
  startOfWeek.setHours(0, 0, 0, 0)

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select(`
      id,
      status,
      proteinas,
      usuarios ( nome_completo, turma, turno )
    `)
    .contains('dias_semana', [diaSemana])
    .eq('status', 'pago')
    .gte('created_at', startOfWeek.toISOString())
    .order('created_at', { ascending: true })

  const { data: cardapioHoje } = await supabase
    .from('cardapios')
    .select('prato_principal')
    .eq('dia_semana', diaSemana)
    .single()
    
  const pratoHoje = cardapioHoje?.prato_principal || 'Prato não definido'

  return (
    <div className="print:bg-white print:p-0 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Screen header (hidden on print) ── */}
      <div className="flex flex-col gap-6 mb-8 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#383b32] mb-1">Lista de Entregas</h1>
            <p className="text-stone-500">Acompanhe os alunos que devem retirar refeições na cantina.</p>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
            <BotaoImprimir />
          </div>
        </div>
        <FiltroDias diaAtual={diaSemanaAtual === 0 || diaSemanaAtual === 6 ? 1 : diaSemanaAtual} />
      </div>

      {/* ── THERMAL PRINT layout (hidden on screen) ── */}
      <div
        className="hidden print:block"
        style={{ fontFamily: 'monospace', fontSize: '11px', width: '72mm', margin: '0 auto', color: '#000' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '6px' }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', letterSpacing: '2px' }}>CANTINA NINA</div>
          <div style={{ fontSize: '10px' }}>Lista de Entregas</div>
          <div style={{ fontSize: '10px', marginTop: '2px' }}>
            {nomesDias[diaSemana]} &mdash; {agoraBRT.toLocaleDateString('pt-BR')}
          </div>
          <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '2px' }}>
            Prato: {pratoHoje}
          </div>
          <div style={{ fontSize: '10px', marginTop: '2px' }}>
            Total: {pedidos?.length ?? 0} pedido(s)
          </div>
        </div>

        {/* Numbered list */}
        {pedidos && pedidos.length > 0 ? (
          pedidos.map((pedido, idx) => (
            <div
              key={pedido.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '4px',
                borderBottom: '1px dashed #999',
                paddingTop: '5px',
                paddingBottom: '5px',
              }}
            >
              <span style={{ minWidth: '18px', fontWeight: 'bold' }}>{idx + 1}.</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11px' }}>
                  {(pedido.usuarios as any)?.nome_completo || 'Aluno Excluído'}
                </div>
                <div style={{ fontSize: '9px', color: '#444' }}>
                  {(pedido.usuarios as any)?.turma || '-'}
                  {pedido.proteinas && pedido.proteinas[diaSemana] ? ` • Proteína: ${pedido.proteinas[diaSemana]}` : ''}
                </div>
              </div>
              {/* Manual check box */}
              <div style={{ width: '13px', height: '13px', border: '1px solid #000', marginTop: '1px', flexShrink: 0 }}></div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '10px 0', fontSize: '10px' }}>
            Nenhum pedido para este dia.
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '2px solid #000', marginTop: '8px', paddingTop: '4px', textAlign: 'center', fontSize: '9px' }}>
          Impresso: {agoraBRT.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* ── Normal screen list (hidden on print) ── */}
      <div className="print:hidden">
        {diaSemana === 0 || diaSemana === 6 ? (
          <div className="solid-card p-10 text-center flex flex-col items-center justify-center text-nina-olive-400">
            <Calendar size={48} className="text-nina-olive-300 mb-4" />
            <h2 className="text-xl font-bold text-[#383b32] mb-2">Fim de Semana</h2>
            <p className="text-nina-olive-400">A cantina não opera aos fins de semana.</p>
          </div>
        ) : !pedidos || pedidos.length === 0 ? (
          <div className="solid-card p-12 text-center flex flex-col items-center justify-center">
            <AlertCircle size={48} className="text-nina-olive-300 mb-4" />
            <h2 className="text-xl font-bold text-[#383b32] mb-2">Nenhuma entrega pendente</h2>
            <p className="text-nina-olive-400 max-w-sm">Nenhum aluno agendou refeição para este dia ou todas já foram entregues.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-nina-gold-400/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="solid-card p-6 flex flex-col justify-between gap-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#e8e3d5] text-[#383b32] flex items-center justify-center shrink-0 font-bold text-xl uppercase group-hover:bg-nina-gold-400 transition-all duration-300">
                      {((pedido.usuarios as any)?.nome_completo || '?').charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-bold text-[#383b32] text-lg uppercase">
                      {(pedido.usuarios as any)?.nome_completo || 'Aluno Excluído'}
                    </h3>
                  </div>
                  
                  <div className="flex flex-col gap-2 text-sm text-[#383b32]/70 bg-[#e8e3d5]/30 p-4 rounded-xl border border-[#e8e3d5]">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-nina-olive-400">Turma</span>
                      <span className="font-bold text-[#383b32] bg-[#f4f0e6] shadow-sm px-3 py-1 rounded-lg border border-[#e8e3d5]">
                        {(pedido.usuarios as any)?.turma || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-nina-olive-400">Prato</span>
                      <span className="text-[#383b32] font-medium line-clamp-1 text-right ml-4">{pratoHoje}</span>
                    </div>
                    {pedido.proteinas && pedido.proteinas[diaSemana] && (
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-nina-olive-400">Proteína</span>
                        <span className="font-bold text-[#383b32] bg-[#f4f0e6] shadow-sm px-3 py-1 rounded-lg border border-[#e8e3d5]">
                          {pedido.proteinas[diaSemana]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-auto relative z-10">
                  <BotaoEntregar pedidoId={pedido.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
