
import { isBefore, isAfter, parseISO, startOfDay } from 'date-fns'

export const getStatus = (complaint) => {
    const today = startOfDay(new Date())

    // Parse dates
    const dataFinal = complaint.data_final ? parseISO(complaint.data_final) : null
    const prorrogadoAte = complaint.prorrogado_ate ? parseISO(complaint.prorrogado_ate) : null

    // PRORROGADO: Tem data de prorrogação e ela é futura
    if (prorrogadoAte && (isAfter(prorrogadoAte, today) || prorrogadoAte.getTime() === today.getTime())) {
        return { label: 'PRORROGADO', color: 'orange' }
    }

    // AGUARDAR: Data Final futura (e sem prorrogação válida anterior)
    if (dataFinal && (isAfter(dataFinal, today) || dataFinal.getTime() === today.getTime())) {
        return { label: 'AGUARDAR', color: 'green' }
    }

    // VENCIDO: Se chegou aqui, não é futuro. Se tiver data final, é passado.
    if (dataFinal) {
        return { label: 'VENCIDO', color: 'red' }
    }

    // Fallback
    return { label: 'PENDENTE', color: 'gray' }
}

export const getStatusColor = (color) => {
    switch (color) {
        // AGUARDAR: texto em negrito e cor verde-escuro, background cor verde-claro
        case 'green': return 'bg-green-200 text-green-900 border-green-300 font-bold'

        // PRORROGADO: texto em negrito e cor laranja escuro, background cor laranja claro
        case 'orange': return 'bg-orange-200 text-orange-900 border-orange-300 font-bold'

        // VENCIDO: texto em negrito e cor branca, background cor vermelha
        case 'red': return 'bg-red-600 text-white border-red-700 font-bold'

        default: return 'bg-zinc-700 text-zinc-300 border-zinc-600'
    }
}
