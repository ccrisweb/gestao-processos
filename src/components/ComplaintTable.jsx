
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getStatus, getStatusColor } from '../lib/utils'
import { FileSpreadsheet, FileText, Search, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import ComplaintDetail from './ComplaintDetail'
import ConfirmDialog from './ConfirmDialog'
import { TableSkeleton } from './Skeleton'
import { MobileCard, MobileCardSkeleton } from './MobileCard'
import AdvancedFilters from './AdvancedFilters'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default function ComplaintTable() {
    const navigate = useNavigate()
    const { role } = useAuth()
    const toast = useToast()
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterText, setFilterText] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const [showDetail, setShowDetail] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, complaint: null })

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    // Sorting state
    const [sortField, setSortField] = useState('created_at')
    const [sortDirection, setSortDirection] = useState('desc')

    // Mobile detection
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    // Advanced filters
    const [advancedFilters, setAdvancedFilters] = useState(() => {
        const saved = localStorage.getItem('complaintFilters')
        return saved ? JSON.parse(saved) : {
            dateFrom: '',
            dateTo: '',
            categoria: '',
            fiscal: '',
            bairro: '',
            acaoTomada: ''
        }
    })

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        fetchComplaints()
    }, [])

    const fetchComplaints = async () => {
        try {
            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout ao carregar dados')), 15000)
            )

            const fetchPromise = supabase
                .from('complaints')
                .select('*')
                .order('created_at', { ascending: false })

            const { data, error } = await Promise.race([fetchPromise, timeoutPromise])

            if (error) {
                console.error('Error fetching complaints:', error)
                toast.error('Erro ao carregar denúncias')
                setComplaints([])
            } else if (data) {
                setComplaints(data)
                toast.success(`${data.length} registros carregados`)
            }
        } catch (error) {
            console.error('Error fetching complaints:', error)
            toast.error('Erro ao carregar dados')
            setComplaints([])
        } finally {
            setLoading(false)
        }
    }

    const handleView = (complaint) => {
        setSelectedComplaint(complaint)
        setShowDetail(true)
    }

    const handleEdit = (complaint) => {
        // Navigate to edit page (we'll create this route)
        navigate(`/edit/${complaint.id}`, { state: { complaint } })
    }

    const handleDeleteClick = (complaint) => {
        if (role !== 'admin') {
            toast.warning('Apenas administradores podem excluir registros')
            return
        }
        setDeleteDialog({ isOpen: true, complaint })
    }

    const handleDeleteConfirm = async () => {
        const complaint = deleteDialog.complaint
        if (!complaint) return

        try {
            const { error } = await supabase
                .from('complaints')
                .delete()
                .eq('id', complaint.id)

            if (error) throw error

            toast.success('Registro excluído com sucesso')
            fetchComplaints() // Refresh list
        } catch (error) {
            console.error('Error deleting:', error)
            toast.error('Erro ao excluir registro: ' + error.message)
        }
    }

    const handleSort = (field) => {
        if (sortField === field) {
            // Toggle direction if same field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            // New field, default to ascending
            setSortField(field)
            setSortDirection('asc')
        }
        // Reset to first page when sorting changes
        setCurrentPage(1)
    }

    const handleApplyFilters = (filters) => {
        setAdvancedFilters(filters)
        localStorage.setItem('complaintFilters', JSON.stringify(filters))
        setCurrentPage(1) // Reset to first page
        toast.success('Filtros aplicados')
    }

    const handleClearFilters = () => {
        const emptyFilters = {
            dateFrom: '',
            dateTo: '',
            categoria: '',
            fiscal: '',
            bairro: '',
            acaoTomada: ''
        }
        setAdvancedFilters(emptyFilters)
        localStorage.removeItem('complaintFilters')
        setCurrentPage(1)
        toast.info('Filtros removidos')
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

            // Advanced filters
            const matchesDateFrom = !advancedFilters.dateFrom || item.data_denuncia >= advancedFilters.dateFrom
            const matchesDateTo = !advancedFilters.dateTo || item.data_denuncia <= advancedFilters.dateTo
            const matchesCategoria = !advancedFilters.categoria || item.descricao?.toLowerCase().includes(advancedFilters.categoria.toLowerCase())
            const matchesFiscal = !advancedFilters.fiscal || item.fiscal?.toLowerCase().includes(advancedFilters.fiscal.toLowerCase())
            const matchesBairro = !advancedFilters.bairro || item.bairro?.toLowerCase().includes(advancedFilters.bairro.toLowerCase())
            const matchesAcao = !advancedFilters.acaoTomada || item.acao_tomada === advancedFilters.acaoTomada

            return matchesStatus && matchesText && matchesDateFrom && matchesDateTo &&
                matchesCategoria && matchesFiscal && matchesBairro && matchesAcao
        })
    }, [complaints, filterText, statusFilter, advancedFilters])

    // Sorted data
    const sortedData = useMemo(() => {
        const sorted = [...filteredData].sort((a, b) => {
            let aValue = a[sortField]
            let bValue = b[sortField]

            // Handle null/undefined values
            if (aValue === null || aValue === undefined) aValue = ''
            if (bValue === null || bValue === undefined) bValue = ''

            // String comparison
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase()
                bValue = bValue.toLowerCase()
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
            return 0
        })
        return sorted
    }, [filteredData, sortField, sortDirection])

    // Paginated data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return sortedData.slice(startIndex, endIndex)
    }, [sortedData, currentPage, itemsPerPage])

    const totalPages = Math.ceil(sortedData.length / itemsPerPage)

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [filterText, statusFilter])

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Denúncias")
        XLSX.writeFile(wb, "denuncias.xlsx")
        toast.success('Arquivo Excel exportado')
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
        toast.success('Arquivo PDF exportado')
    }

    if (loading) return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1 flex gap-2">
                    <div className="relative flex-1 max-w-md">
                        <div className="h-10 bg-zinc-800 border border-zinc-700 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="h-10 w-40 bg-zinc-800 border border-zinc-700 rounded-lg animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-24 bg-zinc-800 border border-zinc-700 rounded-lg animate-pulse"></div>
                    <div className="h-10 w-24 bg-zinc-800 border border-zinc-700 rounded-lg animate-pulse"></div>
                </div>
            </div>
            <TableSkeleton rows={10} />
        </div>
    )

    return (
        <>
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
                                <SortableHeader field="data_denuncia" label="Data" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                <th className="px-6 py-4">Status</th>
                                <SortableHeader field="autuado" label="Autuado" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                <SortableHeader field="logradouro" label="Endereço" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                <SortableHeader field="atendimento" label="Atendimento" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                <SortableHeader field="data_final" label="Prazo Final" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-700">
                            {paginatedData.map((item) => {
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
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleView(item)}
                                                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                    title="Visualizar"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(item)}
                                                    className={`p-2 rounded-lg transition-colors ${role === 'admin'
                                                        ? 'text-red-400 hover:bg-red-500/20'
                                                        : 'text-zinc-600 cursor-not-allowed'
                                                        }`}
                                                    title={role === 'admin' ? 'Excluir' : 'Apenas Admin'}
                                                    disabled={role !== 'admin'}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-zinc-500">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
                        <div className="text-sm text-zinc-400">
                            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, sortedData.length)} de {sortedData.length} registros
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Primeira página"
                            >
                                <ChevronsLeft size={18} />
                            </button>
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Página anterior"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, index) => {
                                    const page = index + 1
                                    // Show first, last, current, and adjacent pages
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => goToPage(page)}
                                                className={`px-3 py-1 rounded-lg font-medium transition-colors ${currentPage === page
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    } else if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
                                        return <span key={page} className="text-zinc-600">...</span>
                                    }
                                    return null
                                })}
                            </div>

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Próxima página"
                            >
                                <ChevronRight size={18} />
                            </button>
                            <button
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Última página"
                            >
                                <ChevronsRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetail && (
                <ComplaintDetail
                    complaint={selectedComplaint}
                    onClose={() => {
                        setShowDetail(false)
                        setSelectedComplaint(null)
                    }}
                    onEdit={(complaint) => {
                        setShowDetail(false)
                        handleEdit(complaint)
                    }}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, complaint: null })}
                onConfirm={handleDeleteConfirm}
                title="Excluir Registro"
                message={`Tem certeza que deseja excluir a denúncia de ${deleteDialog.complaint?.autuado || 'este registro'}? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                cancelText="Cancelar"
                type="danger"
            />
        </>
    )
}

// Sortable Header Component
const SortableHeader = ({ field, label, sortField, sortDirection, onSort }) => {
    const isActive = sortField === field

    return (
        <th
            className="px-6 py-4 cursor-pointer hover:bg-zinc-700/50 transition-colors select-none"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center gap-2">
                <span>{label}</span>
                {isActive ? (
                    sortDirection === 'asc' ? (
                        <ArrowUp size={14} className="text-indigo-400" />
                    ) : (
                        <ArrowDown size={14} className="text-indigo-400" />
                    )
                ) : (
                    <ArrowUpDown size={14} className="text-zinc-600" />
                )}
            </div>
        </th>
    )
}
