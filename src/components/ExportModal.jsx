import { useState } from "react";
import { X, Calendar, FileText, Printer, FileSpreadsheet, CheckSquare, Square } from "lucide-react";
import { EXPORT_SECTIONS, filterDataForExport, generatePDF, generateExcel } from "../lib/exportUtils";
import { useToast } from "../context/ToastContext";

export default function ExportModal({ isOpen, onClose, data }) {
    const toast = useToast();
    const [filterType, setFilterType] = useState("all");
    const [filterValues, setFilterValues] = useState({
        date: "",
        month: new Date().toISOString().slice(0, 7),
        startDate: "",
        endDate: ""
    });

    // Default all sections selected
    const [selectedSections, setSelectedSections] = useState(
        Object.keys(EXPORT_SECTIONS).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    if (!isOpen) return null;

    const handleSectionToggle = (key) => {
        setSelectedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleExport = (type) => {
        try {
            // 1. Filter Data
            const filterConfig = {
                type: filterType,
                ...filterValues
            };

            const filteredData = filterDataForExport(data, filterConfig);

            if (filteredData.length === 0) {
                toast.warning("Nenhum registro encontrado para o período selecionado.");
                return;
            }

            toast.info(`Gerando relatório com ${filteredData.length} registros...`);

            const exportOptions = {
                sections: selectedSections,
                subtitle: getSubtitle(filterConfig),
                print: type === 'print'
            };

            if (type === 'excel') {
                generateExcel(filteredData, exportOptions);
                toast.success("Excel exportado com sucesso!");
            } else {
                // PDF or Print
                generatePDF(filteredData, exportOptions);
                if (type !== 'print') toast.success("PDF exportado com sucesso!");
            }

            // Optional: Close modal after export? Maybe keep open for multiple exports.
            // onClose(); 
        } catch (error) {
            console.error("Erro na exportação:", error);
            toast.error("Erro ao gerar relatório: " + error.message);
        }
    };

    const getSubtitle = (config) => {
        if (config.type === 'date') return `Data: ${new Date(config.date).toLocaleDateString('pt-BR')}`;
        if (config.type === 'month') return `Mês: ${config.month}`;
        if (config.type === 'range') return `Período: ${new Date(config.startDate).toLocaleDateString('pt-BR')} a ${new Date(config.endDate).toLocaleDateString('pt-BR')}`;
        return "Relatório Completo (Todos os registros)";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Printer size={24} className="text-indigo-500" />
                            Relatórios Avançados
                        </h2>
                        <p className="text-zinc-400 text-sm mt-1">Configure o conteúdo e período do seu relatório</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-700 rounded-full transition-colors text-zinc-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">

                    {/* Section 1: Filters */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            <Calendar size={16} /> Período
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Radio Options */}
                            <div className="space-y-3">
                                {[
                                    { id: 'all', label: 'Todos os registros' },
                                    { id: 'date', label: 'Data Específica' },
                                    { id: 'month', label: 'Mês de Referência' },
                                    { id: 'range', label: 'Período Personalizado' }
                                ].map((opt) => (
                                    <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${filterType === opt.id ? 'border-indigo-500' : 'border-zinc-600 group-hover:border-zinc-500'}`}>
                                            {filterType === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                                        </div>
                                        <span className={filterType === opt.id ? 'text-white font-medium' : 'text-zinc-400 group-hover:text-zinc-300'}>
                                            {opt.label}
                                        </span>
                                        <input
                                            type="radio"
                                            name="filterType"
                                            value={opt.id}
                                            checked={filterType === opt.id}
                                            onChange={() => setFilterType(opt.id)}
                                            className="hidden"
                                        />
                                    </label>
                                ))}
                            </div>

                            {/* Dynamic Inputs */}
                            <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50 flex flex-col justify-center">
                                {filterType === 'all' && (
                                    <p className="text-zinc-500 text-center italic">Sem filtros de data aplicados.</p>
                                )}

                                {filterType === 'date' && (
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-400">Selecione a Data</label>
                                        <input
                                            type="date"
                                            value={filterValues.date}
                                            onChange={(e) => setFilterValues(prev => ({ ...prev, date: e.target.value }))}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                )}

                                {filterType === 'month' && (
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-400">Selecione o Mês</label>
                                        <input
                                            type="month"
                                            value={filterValues.month}
                                            onChange={(e) => setFilterValues(prev => ({ ...prev, month: e.target.value }))}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                )}

                                {filterType === 'range' && (
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-xs text-zinc-400">Data Inicial</label>
                                            <input
                                                type="date"
                                                value={filterValues.startDate}
                                                onChange={(e) => setFilterValues(prev => ({ ...prev, startDate: e.target.value }))}
                                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-zinc-400">Data Final</label>
                                            <input
                                                type="date"
                                                value={filterValues.endDate}
                                                onChange={(e) => setFilterValues(prev => ({ ...prev, endDate: e.target.value }))}
                                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <hr className="border-zinc-800" />

                    {/* Section 2: Content Selection */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            <FileText size={16} /> Conteúdo do Relatório
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(EXPORT_SECTIONS).map(([key, section]) => (
                                <button
                                    key={key}
                                    onClick={() => handleSectionToggle(key)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedSections[key]
                                            ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-200'
                                            : 'bg-zinc-800/30 border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                                        }`}
                                >
                                    {selectedSections[key] ? (
                                        <CheckSquare size={20} className="text-indigo-500" />
                                    ) : (
                                        <Square size={20} />
                                    )}
                                    <span className="font-medium text-sm">{section.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-zinc-800 bg-zinc-800/30 flex flex-col sm:flex-row justify-end gap-3">
                    <button
                        onClick={() => handleExport('print')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl font-bold transition-all"
                    >
                        <Printer size={20} />
                        Imprimir
                    </button>

                    <button
                        onClick={() => handleExport('excel')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5"
                    >
                        <FileSpreadsheet size={20} />
                        Excel
                    </button>

                    <button
                        onClick={() => handleExport('pdf')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5"
                    >
                        <FileText size={20} />
                        PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
