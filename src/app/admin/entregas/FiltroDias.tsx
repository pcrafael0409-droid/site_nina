'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function FiltroDias({ diaAtual }: { diaAtual: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const diaQuery = searchParams.get('dia')
  const diaSelecionado = diaQuery ? parseInt(diaQuery) : diaAtual

  const dias = [
    { num: 1, nome: 'Segunda' },
    { num: 2, nome: 'Terça' },
    { num: 3, nome: 'Quarta' },
    { num: 4, nome: 'Quinta' },
    { num: 5, nome: 'Sexta' },
  ]

  const handleChange = (num: number) => {
    router.push(`?dia=${num}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 print:hidden">
      {dias.map((d) => (
        <button
          key={d.num}
          onClick={() => handleChange(d.num)}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            diaSelecionado === d.num
              ? 'bg-nina-red-400 text-nina-dark-900 shadow-sm scale-105'
              : 'bg-[#e8e3d5] text-[#383b32] hover:bg-nina-red-400/50'
          }`}
        >
          {d.nome}
        </button>
      ))}
    </div>
  )
}
