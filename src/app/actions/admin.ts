'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function criarCardapio(prevState: any, formData: FormData) {
  const supabase = await createClient()
  
  const data_inicio_semana = formData.get('data_inicio_semana') as string
  const prato_principal = formData.get('prato_principal') as string
  const acompanhamentos = formData.get('acompanhamentos') as string
  const valor_diario = parseFloat(formData.get('valor_diario') as string)
  const imagem_url = formData.get('imagem_url') as string

  if (!data_inicio_semana || !prato_principal || isNaN(valor_diario)) {
    return { error: 'Preencha os campos obrigatórios corretamente.' }
  }

  // Verifica se o usuário é admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: userData } = await supabase.from('usuarios').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') return { error: 'Não autorizado' }

  const { error } = await supabase.from('cardapios').insert({
    data_inicio_semana,
    prato_principal,
    acompanhamentos,
    valor_diario,
    imagem_url: imagem_url || null,
    ativo: true
  })

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { error: 'Já existe um cardápio cadastrado para esta semana.' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/cardapios')
  redirect('/admin/cardapios')
}

export async function excluirCardapio(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('cardapios').delete().eq('id', id)
  
  if (error) {
    throw new Error(error.message)
  }
  
  revalidatePath('/admin/cardapios')
}

export async function salvarConfiguracoes(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const horario_limite_pedido = formData.get('horario_limite_pedido') as string
  const dias_antecedencia = parseInt(formData.get('dias_antecedencia') as string, 10)
  const desconto_professor_percentual = parseFloat(formData.get('desconto_professor_percentual') as string) || 0

  // Verifica se o usuário é admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const { data: userData } = await supabase.from('usuarios').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') throw new Error('Não autorizado')

  const { error } = await supabase.from('configuracoes').upsert({
    id: parseInt(id, 10) || 1,
    horario_limite_pedido,
    dias_antecedencia,
    desconto_professor_percentual
  })

  if (error) {
    return { error: error.message, success: false }
  }

  return { success: true }
}
