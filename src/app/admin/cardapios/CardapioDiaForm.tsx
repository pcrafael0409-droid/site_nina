'use client'

import { useState } from 'react'
import { atualizarCardapioDia } from '@/app/actions/cardapio'
import { Loader2, Save, Edit2 } from 'lucide-react'

type Cardapio = {
  dia_semana: number
  prato_principal: string
  acompanhamentos: string
  valor_diario: number
  proteina_1?: string | null
  proteina_2?: string | null
}

export default function CardapioDiaForm({ cardapio, nomeDia }: { cardapio: Cardapio, nomeDia: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, setIsPending] = useState(false)
  
  const [prato, setPrato] = useState(cardapio.prato_principal)
  const [acompanhamentos, setAcompanhamentos] = useState(cardapio.acompanhamentos || '')
  const [valor, setValor] = useState(cardapio.valor_diario.toString())
  const [proteina1, setProteina1] = useState(cardapio.proteina_1 || '')
  const [proteina2, setProteina2] = useState(cardapio.proteina_2 || '')

  const handleSave = async () => {
    setIsPending(true)
    const result = await atualizarCardapioDia(
      cardapio.dia_semana,
      prato,
      acompanhamentos,
      parseFloat(valor),
      proteina1,
      proteina2
    )
    setIsPending(false)
    if (result.success) {
      setIsEditing(false)
    } else {
      alert(result.error)
    }
  }

  return (
    <div className={`p-6 md:p-8 transition-all relative ${isEditing ? 'solid-card shadow-lg ring-4 ring-nina-red-400/20' : 'solid-card hover:shadow-lg hover:-translate-y-1'}`}>
      {!isEditing && <div className="absolute top-0 right-0 w-32 h-32 bg-nina-red-400/10 rounded-full blur-2xl -z-10 translate-x-1/2 -translate-y-1/2"></div>}
      <div className="flex justify-between items-center mb-4 border-b border-[#e8e3d5] pb-3">
        <h3 className="text-lg font-bold text-[#383b32]">{nomeDia}</h3>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-nina-red-600 hover:bg-nina-red-400/20 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
          >
            <Edit2 size={16} /> Editar
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-nina-dark-400 uppercase tracking-wider mb-1">Prato Principal</label>
          {isEditing ? (
            <input 
              value={prato}
              onChange={(e) => setPrato(e.target.value)}
              className="w-full px-3 py-2 border border-[#e8e3d5] rounded-lg focus:ring-2 focus:ring-nina-red-400 outline-none text-[#383b32] bg-white" 
            />
          ) : (
            <p className="text-[#383b32] font-medium">{cardapio.prato_principal}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-nina-dark-400 uppercase tracking-wider mb-1">Acompanhamentos</label>
          {isEditing ? (
            <input 
              value={acompanhamentos}
              onChange={(e) => setAcompanhamentos(e.target.value)}
              className="w-full px-3 py-2 border border-[#e8e3d5] rounded-lg focus:ring-2 focus:ring-nina-red-400 outline-none text-sm text-[#383b32] bg-white" 
              placeholder="Ex: Arroz, Feijão, Salada"
            />
          ) : (
            <p className="text-nina-dark-400 text-sm">{cardapio.acompanhamentos || 'Nenhum'}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-nina-dark-400 uppercase tracking-wider mb-1">Proteína 1</label>
            {isEditing ? (
              <input 
                value={proteina1}
                onChange={(e) => setProteina1(e.target.value)}
                className="w-full px-3 py-2 border border-[#e8e3d5] rounded-lg focus:ring-2 focus:ring-nina-red-400 outline-none text-sm text-[#383b32] bg-white" 
                placeholder="Ex: Frango Assado"
              />
            ) : (
              <p className="text-[#383b32] text-sm font-medium">{cardapio.proteina_1 || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-nina-dark-400 uppercase tracking-wider mb-1">Proteína 2</label>
            {isEditing ? (
              <input 
                value={proteina2}
                onChange={(e) => setProteina2(e.target.value)}
                className="w-full px-3 py-2 border border-[#e8e3d5] rounded-lg focus:ring-2 focus:ring-nina-red-400 outline-none text-sm text-[#383b32] bg-white" 
                placeholder="Ex: Omelete"
              />
            ) : (
              <p className="text-[#383b32] text-sm font-medium">{cardapio.proteina_2 || '-'}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-nina-dark-400 uppercase tracking-wider mb-1">Valor (R$)</label>
          {isEditing ? (
            <input 
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-32 px-3 py-2 border border-[#e8e3d5] rounded-lg focus:ring-2 focus:ring-nina-red-400 outline-none text-[#383b32] bg-white" 
            />
          ) : (
            <p className="text-[#383b32] font-bold text-lg">
              R$ {Number(cardapio.valor_diario).toFixed(2).replace('.', ',')}
            </p>
          )}
        </div>
        
        {isEditing && (
          <div className="pt-2 flex gap-2">
            <button 
              onClick={handleSave}
              disabled={isPending}
              className="flex-1 bg-nina-red-400 hover:bg-nina-red-500 text-nina-dark-900 font-medium py-2 rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Dia
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 bg-[#e8e3d5] hover:bg-[#e8e3d5]/80 text-[#383b32] font-medium py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
