// Mobile-optimized Table Component
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export const MobileCard = ({ complaint, onView, onEdit, onDelete, role, getStatus, getStatusColor }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const status = getStatus(complaint)

    return (
        <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-xl p-4 space-y-3 hover:border-indigo-500/30 transition-all hover-lift">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border transition-all ${getStatusColor(status.color)}`}>
                            {status.label}
                        </span>
                        <span className="text-xs text-zinc-500">{complaint.data_denuncia}</span>
                    </div>
                    <h3 className="font-semibold text-white">{complaint.autuado || 'Sem nome'}</h3>
                    <p className="text-sm text-zinc-400">{complaint.logradouro}, {complaint.numero}</p>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 hover:bg-zinc-700 rounded-lg transition-all ripple-container"
                >
                    {isExpanded ? <ChevronUp size={20} className="transition-transform" /> : <ChevronDown size={20} className="transition-transform" />}
                </button>
            </div>

            {/* Expanded Details */}
            <div
                className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="pt-3 border-t border-zinc-700 space-y-2 text-sm animate-fade-in">
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Atendimento:</span>
                        <span className="text-zinc-300">{complaint.atendimento}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Nº Atendimento:</span>
                        <span className="text-zinc-300">{complaint.numero_atendimento}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Prazo Final:</span>
                        <span className="text-zinc-300">{complaint.data_final || '-'}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
                <button
                    onClick={() => onView(complaint)}
                    className="flex-1 py-2 px-3 bg-blue-600/20 text-blue-400 border border-blue-600/50 rounded-lg text-sm font-medium hover:bg-blue-600/30 transition-all ripple-container hover-lift"
                >
                    Visualizar
                </button>
                <button
                    onClick={() => onEdit(complaint)}
                    className="flex-1 py-2 px-3 bg-indigo-600/20 text-indigo-400 border border-indigo-600/50 rounded-lg text-sm font-medium hover:bg-indigo-600/30 transition-all ripple-container hover-lift"
                >
                    Editar
                </button>
                {role === 'admin' && (
                    <button
                        onClick={() => onDelete(complaint)}
                        className="py-2 px-3 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-all ripple-container hover-lift"
                    >
                        Excluir
                    </button>
                )}
            </div>
        </div>
    )
}

export const MobileCardSkeleton = () => {
    return (
        <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-xl p-4 space-y-3 animate-pulse">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-20 bg-zinc-700 rounded-full"></div>
                        <div className="h-4 w-24 bg-zinc-700 rounded"></div>
                    </div>
                    <div className="h-5 w-40 bg-zinc-700 rounded"></div>
                    <div className="h-4 w-48 bg-zinc-700 rounded"></div>
                </div>
                <div className="h-8 w-8 bg-zinc-700 rounded-lg"></div>
            </div>
            <div className="flex gap-2 pt-2">
                <div className="flex-1 h-9 bg-zinc-700 rounded-lg"></div>
                <div className="flex-1 h-9 bg-zinc-700 rounded-lg"></div>
                <div className="h-9 w-20 bg-zinc-700 rounded-lg"></div>
            </div>
        </div>
    )
}
