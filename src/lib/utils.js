
import { isBefore, isAfter, parseISO, startOfDay } from 'date-fns'

export const getStatus = (complaint) => {
    const today = startOfDay(new Date())

    // Parse dates
    const dataFinal = complaint.data_final ? parseISO(complaint.data_final) : null
    const prorrogadoAte = complaint.prorrogado_ate ? parseISO(complaint.prorrogado_ate) : null

    // 1. Data Final vencida
    if (dataFinal && isBefore(dataFinal, today)) {
        // Check if there is a valid extension
        if (prorrogadoAte && isAfter(prorrogadoAte, today)) {
            return { label: 'PRORROGADO', color: 'orange' }
        }
        return { label: 'VENCIDO', color: 'red' }
    }

    // 2. Aguardando (Data Final futura)
    if (dataFinal && (isAfter(dataFinal, today) || dataFinal.getTime() === today.getTime())) {
        return { label: 'AGUARDAR', color: 'green' }
    }

    // Fallback or specific logic for empty dates
    return { label: 'EM ANDAMENTO', color: 'gray' }
}

export const getStatusColor = (color) => {
    switch (color) {
        case 'green': return 'bg-green-100 text-green-800 border-green-200'
        case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200'
        case 'red': return 'bg-red-600 text-white border-red-700' // User requested white text on red bg
        default: return 'bg-zinc-700 text-zinc-300 border-zinc-600'
    }
}
