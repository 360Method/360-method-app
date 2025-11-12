import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

function Calendar({ mode = "single", selected, onSelect, className = "", ...props }) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date())

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - monthStart.getDay())

  const days = []
  const date = new Date(startDate)
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const isSelected = (day) => {
    if (!selected) return false
    return day.toDateString() === selected.toDateString()
  }

  const isCurrentMonth = (day) => {
    return day.getMonth() === currentMonth.getMonth()
  }

  const isToday = (day) => {
    const today = new Date()
    return day.toDateString() === today.toDateString()
  }

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]
  
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  return (
    <div className={`p-3 ${className}`} {...props}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={previousMonth}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-semibold text-sm">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={nextMonth}
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 h-8 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect && onSelect(day)}
            disabled={!isCurrentMonth(day)}
            className={`h-8 w-full text-sm rounded-md transition-colors
              ${isSelected(day) ? 'bg-gray-900 text-white font-semibold hover:bg-gray-800' : ''}
              ${isToday(day) && !isSelected(day) ? 'bg-gray-100 font-semibold' : ''}
              ${!isCurrentMonth(day) ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
              ${isCurrentMonth(day) && !isSelected(day) && !isToday(day) ? 'text-gray-900' : ''}
            `}
          >
            {day.getDate()}
          </button>
        ))}
      </div>
    </div>
  )
}

export { Calendar }