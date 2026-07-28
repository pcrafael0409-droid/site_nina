'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function atualizarCardapioDia(
  dia_semana: number,
  prato_principal: string,
  acompanhamentos: string,
  valor_diario: number,
  proteina_1?: string,
  proteina_2?: string
) {
  try {
    const supabase = await createClient()

    // Validação de segurança: apenas admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autenticado', success: false }

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!usuario || usuario.role !== 'admin') {
      return { error: 'Acesso negado', success: false }
    }

    // Atualiza o dia correspondente
    const { error } = await supabase
      .from('cardapios')
      .update({
        prato_principal,
        acompanhamentos,
        valor_diario,
        proteina_1,
        proteina_2,
      })
      .eq('dia_semana', dia_semana)

    if (error) {
      console.error('Erro ao atualizar cardápio:', error)
      return { error: 'Falha ao atualizar no banco de dados', success: false }
    }

    revalidatePath('/admin/cardapios')
    revalidatePath('/aluno')
    return { success: true, error: '' }
  } catch (err) {
    console.error('Erro inesperado:', err)
    return { error: 'Erro inesperado ao atualizar cardápio', success: false }
  }
}
