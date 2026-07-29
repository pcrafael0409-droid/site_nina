'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function VendasChart({ chartData }: { chartData: { dateStr: string, count: number }[] }) {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  // Convert chartData array into a Map for fast lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, number>()
    chartData.forEach(d => map.set(d.dateStr, d.count))
    return map
  }, [chartData])

  // Get weeks for the selected month
  const weeks = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() // 0-indexed
    
    // First day of the month
    const firstDayOfMonth = new Date(year, month, 1)
    
    // Find the Monday of the week that contains the first day of the month
    // getDay() -> 0: Sun, 1: Mon, ..., 6: Sat
    const firstDayDow = firstDayOfMonth.getDay()
    // Difference to get to Monday. If Sunday (0), we need to subtract 6 days.
    const diff = firstDayDow === 0 ? -6 : 1 - firstDayDow
    
    let currentDay = new Date(firstDayOfMonth)
    currentDay.setDate(firstDayOfMonth.getDate() + diff)
    
    const monthWeeks = []
    
    // Generate up to 6 weeks. A month fits in max 6 weeks.
    // Stop when we reach a Monday that is in the next month.
    while (currentDay.getMonth() === month || monthWeeks.length === 0 || (currentDay.getMonth() !== month && currentDay < new Date(year, month + 1, 1))) {
      // Create a week containing Monday-Friday
      const weekDays = []
      let weekTotal = 0
      
      // A full week goes Mon to Sun, but we only care about Mon to Fri (5 days)
      for (let i = 0; i < 5; i++) {
        const d = new Date(currentDay)
        d.setDate(currentDay.getDate() + i)
        
        // dateStr formatted as YYYY-MM-DD local logic to avoid UTC shifts
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const dateStr = `${y}-${m}-${day}`
        
        const count = dataMap.get(dateStr) || 0
        weekTotal += count
        
        weekDays.push({
          date: new Date(d),
          dateStr,
          label: `${day}/${m}`,
          count,
          isCurrentMonth: d.getMonth() === month
        })
      }
      
      monthWeeks.push({
        weekDays,
        total: weekTotal
      })
      
      // Advance to next Monday
      currentDay.setDate(currentDay.getDate() + 7)
      
      // Stop condition: if the new Monday is in the next month, we break
      if (currentDay.getMonth() !== month && currentDay >= new Date(year, month + 1, 1)) {
        break
      }
    }
    
    return monthWeeks
  }, [currentDate, dataMap])

  // Get max daily count to scale bars correctly across the visible month
  const maxDailyCount = useMemo(() => {
    let max = 1
    weeks.forEach(w => w.weekDays.forEach(d => {
      if (d.count > max) max = d.count
    }))
    return max
  }, [weeks])

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' })
  const yearStr = currentDate.getFullYear()
  const displayTitle = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${yearStr}`

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']

  return (
    <div className="w-full flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#e8e3d5] pb-4">
        <button 
          onClick={prevMonth}
          className="p-2 hover:bg-[#e8e3d5] rounded-full transition-colors text-nina-dark-300 hover:text-nina-dark-600"
        >
          <ChevronLeft size={24} />
        </button>
        <h3 className="text-lg font-black text-[#383b32]">{displayTitle}</h3>
        <button 
          onClick={nextMonth}
          className="p-2 hover:bg-[#e8e3d5] rounded-full transition-colors text-nina-dark-300 hover:text-nina-dark-600"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* WEEKS LIST */}
      <div className="flex flex-col gap-5 overflow-y-auto max-h-[600px] pr-1 pb-4 hide-scrollbar">
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="bg-[#f5f3ed]/60 border border-[#e8e3d5] p-5 rounded-3xl flex flex-col md:flex-row gap-6 items-center shadow-sm">
            {/* Week Summary */}
            <div className="w-full md:w-32 flex flex-col items-center md:items-start md:border-r border-[#e8e3d5] md:pr-4">
              <span className="text-xs font-bold text-nina-dark-300 uppercase tracking-wider mb-1">
                Semana {wIdx + 1}
              </span>
              <div className="flex items-baseline gap-1 text-[#383b32]">
                <span className="text-3xl font-black">{week.total}</span>
                <span className="text-xs font-medium text-nina-dark-400">ref.</span>
              </div>
            </div>

            {/* Week Chart */}
            <div className="flex-1 w-full h-32 flex items-end justify-between gap-2 md:gap-4 relative">
              {/* Background grid line */}
              <div className="absolute bottom-[2.5rem] left-0 right-0 border-b border-[#e8e3d5] z-0"></div>

              {week.weekDays.map((day, dIdx) => {
                const heightPercentage = (day.count / maxDailyCount) * 100
                const isFaded = !day.isCurrentMonth
                
                return (
                  <div key={dIdx} className={`relative z-10 flex flex-col items-center flex-1 h-full justify-end group ${isFaded ? 'opacity-40 grayscale-[50%]' : ''}`}>
                    <div className="w-full max-w-[2.5rem] md:max-w-[3rem] relative flex items-end justify-center h-full mb-3">
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-nina-dark-900 text-white text-xs font-bold px-2 py-1 rounded pointer-events-none whitespace-nowrap z-20">
                        {day.count} ref.
                      </div>
                      {/* Bar Fill */}
                      <div 
                        className="w-full bg-nina-red-400 rounded-t-md transition-all duration-500 ease-out group-hover:bg-nina-red-500" 
                        style={{ height: `${Math.max(heightPercentage, 2)}%`, minHeight: '4px' }}
                      ></div>
                    </div>
                    {/* Labels */}
                    <div className="flex flex-col items-center mt-1">
                      <span className="text-nina-dark-400 font-bold text-[9px] md:text-[10px] uppercase tracking-wider">{dayNames[dIdx]}</span>
                      <span className="text-[#383b32] font-medium text-[10px] md:text-xs mt-0.5">{day.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
