
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { getStatus, getStatusColor } from '../lib/utils'
import { FileSpreadsheet, FileText, Search, Filter } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default function ComplaintTable() {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterText, setFilterText] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')

    useEffect(() => {
        fetchComplaints()
    }, [])

    const fetchComplaints = async () => {
        try {
            const { data, error } = await supabase
                .from('complaints')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) setComplaints(data)
        } catch (error) {
            console.error('Error fetching complaints:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredData = useMemo(() => {
        return complaints.filter(item => {
            const status = getStatus(item)
            const matchesStatus = statusFilter === 'ALL' || status.label === statusFilter
            const text = filterText.toLowerCase()
            const matchesText =
                item.autuado?.toLowerCase().includes(text) ||
                item.logradouro?.toLowerCase().includes(text) ||
                item.numero_atendimento?.toLowerCase().includes(text) ||
                item.cpf_cnpj?.includes(text)

            return matchesStatus && matchesText
        })
    }, [complaints, filterText, statusFilter])

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Denúncias")
        XLSX.writeFile(wb, "denuncias.xlsx")
    }

    const exportPDF = () => {
        const doc = new jsPDF('landscape')
        doc.text("Relatório de Denúncias", 14, 15)

        const tableColumn = ["Data", "Atendimento", "Autuado", "Endereço", "Status", "Prazo"]
        const tableRows = []

        filteredData.forEach(item => {
            const status = getStatus(item)
            const ticketData = [
                item.data_denuncia,
                item.numero_atendimento,
                item.autuado,
                `${item.logradouro}, ${item.numero}`,
                status.label,
                item.data_final
            ]
            tableRows.push(ticketData)
        })

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20
        })

        doc.save("relatorio_denuncias.pdf")
    }

    if (loading) return <div className="text-center p-8 text-zinc-400">Carregando dados...</div>

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1 flex gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 text-zinc-500 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Buscar por autuado, endereço, CPF..."
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Todos Status</option>
                        <option value="AGUARDAR">Aguardar</option>
                        <option value="PRORROGADO">Prorrogado</option>
                        <option value="VENCIDO">Vencido</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2 bg-green-700/20 text-green-400 border border-green-700/50 rounded-lg hover:bg-green-700/30 transition-colors">
                        <FileSpreadsheet size={18} /> Excel
                    </button>
                    <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-red-700/20 text-red-400 border border-red-700/50 rounded-lg hover:bg-red-700/30 transition-colors">
                        <FileText size={18} /> PDF
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-700 shadow-xl bg-zinc-800/50 backdrop-blur-sm">
                <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="bg-zinc-800 text-xs uppercase font-semibold text-zinc-400">
                        <tr>
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Autuado</th>
                            <th className="px-6 py-4">Endereço</th>
                            <th className="px-6 py-4">Atendimento</th>
                            <th className="px-6 py-4">Prazo Final</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-700">
                        {filteredData.map((item) => {
                            const status = getStatus(item)
                            return (
                                <tr key={item.id} className="hover:bg-zinc-700/50 transition-colors">
                                    <td className="px-6 py-4">{item.data_denuncia}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(status.color)}`}>
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">{item.autuado || '-'}</td>
                                    <td className="px-6 py-4">{item.logradouro}, {item.numero}</td>
                                    <td className="px-6 py-4">{item.atendimento}</td>
                                    <td className="px-6 py-4">{item.data_final || '-'}</td>
                                </tr>
                            )
                        })}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-zinc-500">
                                    Nenhum registro encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
