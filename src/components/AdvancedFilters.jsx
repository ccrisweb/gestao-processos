import { useState, useEffect } from 'react'
import { Filter, X, Calendar, MapPin, User, FileText } from 'lucide-react'

export default function AdvancedFilters({ onApply, onClear, initialFilters = {} }) {
    const [isOpen, setIsOpen] = useState(false)
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        categoria: '',
        fiscal: '',
        bairro: '',
        acaoTomada: '',
        ...initialFilters
    })

    const activeFilterCount = Object.values(filters).filter(v => v !== '').length

    const handleApply = () => {
        onApply(filters)
        setIsOpen(false)
    }

    const handleClear = () => {
        const clearedFilters = {
            dateFrom: '',
            dateTo: '',
            categoria: '',
            fiscal: '',
            bairro: '',
            acaoTomada: ''
        }
        setFilters(clearedFilters)
        onClear()
        setIsOpen(false)
    }

    return (
        <div className="relative">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors text-white"
            >
                <Filter size={18} />
                <span className="hidden md:inline">Filtros Avançados</span>
                {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {/* Filter Panel */}
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Filter Content */}
                    <div className="fixed md:absolute top-0 md:top-full right-0 md:right-0 md:mt-2 w-full md:w-96 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl z-50 max-h-screen md:max-h-[600px] overflow-y-auto scrollbar-thin">
                        {/* Header */}
                        <div className="sticky top-0 bg-zinc-800 border-b border-zinc-700 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Filter size={20} className="text-indigo-400" />
                                <h3 className="font-semibold text-white">Filtros Avançados</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-zinc-700 rounded transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="p-4 space-y-4">
                            {/* Date Range */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                                    <Calendar size={16} />
                                    Período
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-zinc-500 mb-1 block">De:</label>
                                        <input
                                            type="date"
                                            value={filters.dateFrom}
                                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 mb-1 block">Até:</label>
                                        <input
                                            type="date"
                                            value={filters.dateTo}
                                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Categoria */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                                    <FileText size={16} />
                                    Categoria
                                </label>
                                <input
                                    type="text"
                                    value={filters.categoria}
                                    onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
                                    placeholder="Ex: Construção irregular"
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Fiscal */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                                    <User size={16} />
                                    Fiscal Responsável
                                </label>
                                <input
                                    type="text"
                                    value={filters.fiscal}
                                    onChange={(e) => setFilters({ ...filters, fiscal: e.target.value })}
                                    placeholder="Nome do fiscal"
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Bairro */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                                    <MapPin size={16} />
                                    Bairro
                                </label>
                                <input
                                    type="text"
                                    value={filters.bairro}
                                    onChange={(e) => setFilters({ ...filters, bairro: e.target.value })}
                                    placeholder="Nome do bairro"
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Ação Tomada */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                                    <FileText size={16} />
                                    Ação Tomada
                                </label>
                                <select
                                    value={filters.acaoTomada}
                                    onChange={(e) => setFilters({ ...filters, acaoTomada: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Todas</option>
                                    <option value="ACI-Multa">ACI-Multa</option>
                                    <option value="Embargado">Embargado</option>
                                    <option value="Intimação">Intimação</option>
                                    <option value="Notificação">Notificação</option>
                                    <option value="Vistoria">Vistoria</option>
                                </select>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="sticky bottom-0 bg-zinc-800 border-t border-zinc-700 p-4 flex gap-2">
                            <button
                                onClick={handleClear}
                                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Limpar
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Aplicar
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
