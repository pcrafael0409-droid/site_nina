import { createClient } from '@/lib/supabase/server'
import { UserCircle } from 'lucide-react'
import BuscaUsuarios from './BuscaUsuarios'
import AcoesUsuario from './AcoesUsuario'
import { MotionDiv, staggerContainer, fadeItem } from '@/components/Motion'

export default async function UsuariosPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams
  const query = searchParams?.q || ''
  const supabase = await createClient()

  // Lista todos os usuários
  let dbQuery = supabase.from('usuarios').select('*').order('created_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.or(`nome_completo.ilike.%${query}%,email.ilike.%${query}%`)
  }

  const { data: usuarios } = await dbQuery

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 mb-8 print:mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#383b32] tracking-tight print:text-xl">Usuários e Alunos</h1>
            <p className="text-nina-dark-400 mt-1 print:hidden">Gerencie o acesso e informações dos usuários.</p>
          </div>
          <div className="w-full md:w-auto">
            <BuscaUsuarios />
          </div>
        </div>
      </div>

      <MotionDiv 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#e8e3d5]/30 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none"></div>
        {usuarios && usuarios.length > 0 ? (
          usuarios.map((usuario) => (
            <MotionDiv key={usuario.id} variants={fadeItem}>
              <div 
                className="solid-card p-6 flex flex-col justify-between gap-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 print:border-b print:border-black print:border-dashed print:rounded-none print:shadow-none print:p-2 print:gap-1 relative !overflow-visible group hover:z-50 focus-within:z-50"
              >
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4 print:mb-1">
                    <div className="w-12 h-12 rounded-full bg-[#e8e3d5] text-[#383b32] flex items-center justify-center shrink-0 font-bold text-xl uppercase transition-all duration-300 print:hidden">
                      {(usuario.nome_completo || '?').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#383b32] text-lg print:text-sm uppercase leading-tight line-clamp-1 transition-colors">
                        {usuario.nome_completo}
                      </h3>
                      <p className="text-nina-dark-400 text-xs mt-0.5 print:hidden line-clamp-1">{usuario.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 text-sm text-[#383b32]/70 print:text-xs print:text-black bg-[#e8e3d5]/30 p-4 rounded-xl print:bg-transparent print:p-0 print:gap-0 border border-[#e8e3d5]">
                    <div className="flex justify-between items-center print:justify-start print:gap-2">
                      <span className="font-semibold text-nina-dark-400 print:hidden">Turma</span>
                      <span className="hidden print:inline font-bold">Turma:</span>
                      <span className="font-bold text-[#383b32] bg-[#f4f0e6] shadow-sm px-3 py-1 rounded-lg border border-[#e8e3d5] print:border-none print:bg-transparent print:px-0 print:text-black">
                        {usuario.turma || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center print:hidden mt-2 pt-2 border-t border-[#e8e3d5]">
                      <span className="font-semibold text-nina-dark-400">Tipo</span>
                      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg border shadow-sm ${
                        usuario.role === 'admin' 
                          ? 'bg-nina-red-400 text-nina-dark-900 border-nina-red-500' 
                          : (usuario.turma?.toLowerCase().includes('professor') || usuario.turma?.toLowerCase().includes('funcionário'))
                            ? 'bg-nina-dark-200 text-nina-dark-900 border-nina-dark-300'
                            : 'bg-[#f5f3ed] text-[#2d2f27] border-[#e8e6de]'
                      }`}>
                        {usuario.role === 'admin' ? 'Administrador' : ((usuario.turma?.toLowerCase().includes('professor') || usuario.turma?.toLowerCase().includes('funcionário')) ? 'Professor' : 'Aluno')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#e8e3d5] print:hidden">
                  <AcoesUsuario userId={usuario.id} currentEmail={usuario.email} />
                </div>
              </div>
            </MotionDiv>
          ))
        ) : (
          <div className="col-span-full solid-card p-12 text-center flex flex-col items-center justify-center">
            <UserCircle size={48} className="text-[#383b32]/30 mb-4" />
            <p className="text-xl font-bold text-[#383b32] mb-1">Nenhum usuário encontrado</p>
            <p className="text-[#383b32]/60">Tente ajustar o termo de pesquisa</p>
          </div>
        )}
      </MotionDiv>
    </div>
  )
}
