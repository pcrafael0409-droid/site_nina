'use client'

import { useEffect, useRef } from 'react'

export default function VendasChart({ chartData }: { chartData: { label: string, dateStr: string, count: number }[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Rolar para o final (semana atual) ao montar o componente
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [chartData])

  const maxVal = Math.max(...chartData.map(d => d.count), 1)

  return (
    <div className="relative w-full">
      <div 
        ref={scrollRef}
        className="h-56 flex items-end justify-start gap-3 md:gap-6 overflow-x-auto pb-4 pt-10 scroll-smooth snap-x snap-mandatory"
      >
        {/* Background line that spans the whole scrollable area */}
        <div 
          className="absolute bottom-[1.8rem] left-0 border-b border-[#e8e3d5] z-0"
          style={{ width: `${Math.max(100, chartData.length * 15)}%` }}
        ></div>

        {chartData.map((data, idx) => {
          const heightPercentage = (data.count / maxVal) * 100
          
          return (
            <div key={idx} className="relative z-10 flex flex-col items-center flex-shrink-0 h-full justify-end group snap-end w-12 md:w-16">
              <div className="w-full relative flex items-end justify-center h-full mb-3">
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-nina-dark-900 text-white text-xs font-bold px-2 py-1 rounded pointer-events-none whitespace-nowrap z-20">
                  {data.count} ref.
                </div>
                <div 
                  className="w-full max-w-[3rem] bg-nina-red-400 rounded-t-md transition-all duration-700 ease-out group-hover:bg-nina-red-500" 
                  style={{ height: `${Math.max(heightPercentage, 2)}%`, minHeight: '4px' }}
                ></div>
              </div>
              <span className="text-nina-dark-400 font-bold mt-1 text-[10px] md:text-xs whitespace-nowrap">{data.label}</span>
            </div>
          )
        })}
      </div>
      
      {/* Sombras laterais para indicar que tem scroll */}
      <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-20"></div>
      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-20"></div>
    </div>
  )
}
