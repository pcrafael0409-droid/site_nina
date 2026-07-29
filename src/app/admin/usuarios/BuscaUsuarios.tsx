'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export default function BuscaUsuarios() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    
    startTransition(() => {
      router.replace(`?${params.toString()}`)
    })
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-nina-dark-400" />
      </div>
      <input
        type="text"
        placeholder="Pesquisar por nome ou turma..."
        defaultValue={searchParams.get('q')?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-4 py-2 w-full md:w-80 border border-[#e8e3d5] rounded-lg focus:ring-2 focus:ring-nina-red-400 focus:border-nina-red-400 outline-none transition-all text-[#383b32] bg-white"
      />
      {isPending && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <div className="w-4 h-4 border-2 border-nina-red-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}
