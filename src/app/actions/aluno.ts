'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function criarPedido(diasSemana: number[], proteinas: Record<number, string>, valorTotal: number, usarPontos: boolean = false) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Usuário não autenticado', success: false }
    }

    if (!diasSemana.length || valorTotal <= 0) {
      return { error: 'Dados do pedido inválidos', success: false }
    }

    // Verifica pontos se usarPontos for true
    let pontosDescontados = 0;
    if (usarPontos) {
      const { data: usuarioData } = await supabase
        .from('usuarios')
        .select('pontos_fidelidade')
        .eq('id', user.id)
        .single()
        
      if (usuarioData && usuarioData.pontos_fidelidade >= 100) {
        pontosDescontados = 100;
        
        // Desconta os pontos do usuário via admin client (RLS pode bloquear update direto pelo aluno se não configurado)
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const adminClient = createAdminClient()
        
        await adminClient
          .from('usuarios')
          .update({ pontos_fidelidade: usuarioData.pontos_fidelidade - 100 })
          .eq('id', user.id)
      } else {
        return { error: 'Pontos insuficientes para resgate', success: false }
      }
    }

    const { data: novoPedido, error } = await supabase
      .from('pedidos')
      .insert({
        usuario_id: user.id,
        dias_semana: diasSemana,
        valor_total: valorTotal,
        status: 'pendente',
        pontos_usados: pontosDescontados,
        proteinas: proteinas
      })
      .select('id')
      .single()

    if (error || !novoPedido) {
      // Rollback dos pontos se falhou
      if (pontosDescontados > 0) {
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const adminClient = createAdminClient()
        const { data: currentUsr } = await adminClient.from('usuarios').select('pontos_fidelidade').eq('id', user.id).single()
        if (currentUsr) {
           await adminClient.from('usuarios').update({ pontos_fidelidade: currentUsr.pontos_fidelidade + 100 }).eq('id', user.id)
        }
      }
      console.error('Erro ao criar pedido:', error)
      return { error: `Erro no DB: ${error?.message || 'Desconhecido'}`, success: false }
    }

    revalidatePath('/aluno')
    revalidatePath('/aluno/pedidos')
    return { success: true, error: '', pedidoId: novoPedido.id }
  } catch (err: any) {
    console.error('Erro inesperado em criarPedido:', err)
    return { error: `Erro Inesperado: ${err?.message || 'Erro desconhecido'}`, success: false }
  }
}

export async function cancelarPedido(pedidoId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Usuário não autenticado', success: false }

    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()

    // Antes de deletar, pega os pontos_usados
    const { data: pedidoData } = await adminClient
      .from('pedidos')
      .select('pontos_usados')
      .eq('id', pedidoId)
      .eq('usuario_id', user.id)
      .eq('status', 'pendente')
      .single()

    if (!pedidoData) {
      return { error: 'Pedido não encontrado ou não pode ser cancelado', success: false }
    }

    const { error } = await adminClient
      .from('pedidos')
      .delete()
      .eq('id', pedidoId)
      .eq('usuario_id', user.id)
      .eq('status', 'pendente')

    if (error) {
      console.error('Erro ao cancelar pedido:', error)
      return { error: 'Falha ao cancelar o pedido', success: false }
    }

    // Devolve os pontos se usou
    if (pedidoData.pontos_usados > 0) {
      const { data: usr } = await adminClient.from('usuarios').select('pontos_fidelidade').eq('id', user.id).single()
      if (usr) {
        await adminClient.from('usuarios').update({ pontos_fidelidade: usr.pontos_fidelidade + pedidoData.pontos_usados }).eq('id', user.id)
      }
    }

    revalidatePath('/aluno/pedidos')
    return { success: true }
  } catch (err) {
    console.error('Erro ao cancelar pedido:', err)
    return { error: 'Erro inesperado', success: false }
  }
}
