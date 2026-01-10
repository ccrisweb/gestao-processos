import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getStatus, getStatusColor } from "../lib/utils";
import {
  FileSpreadsheet,
  FileText,
  Search,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import ComplaintDetail from "./ComplaintDetail";
import ConfirmDialog from "./ConfirmDialog";
import { TableSkeleton } from "./Skeleton";
import { MobileCard, MobileCardSkeleton } from "./MobileCard";
import AdvancedFilters from "./AdvancedFilters";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ComplaintTable() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    complaint: null,
  });
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sorting state
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Retry tracking
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  // Advanced filters - with validation
  const [advancedFilters, setAdvancedFilters] = useState(() => {
    const defaultFilters = {
      dateFrom: "",
      dateTo: "",
      categoria: "",
      fiscal: "",
      bairro: "",
      acaoTomada: "",
    };

    try {
      const saved = localStorage.getItem("complaintFilters");
      if (!saved) return defaultFilters;

      const parsed = JSON.parse(saved);
      // Validate that parsed object has expected structure
      if (parsed && typeof parsed === "object") {
        return { ...defaultFilters, ...parsed };
      }
      return defaultFilters;
    } catch (e) {
      // If corrupted, remove and use defaults
      try {
        localStorage.removeItem("complaintFilters");
      } catch (err) {
        console.warn("Could not remove corrupted filters");
      }
      return defaultFilters;
    }
  });

  useEffect(() => {
    isMountedRef.current = true;
    const resizeController = new AbortController();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize, {
      signal: resizeController.signal,
    });

    return () => {
      isMountedRef.current = false;
      resizeController.abort();
    };
  }, []);

  // Clear localStorage cache on mount to prevent stale data issues
  useEffect(() => {
    try {
      const saved = localStorage.getItem("complaintFilters");
      if (saved) {
        try {
          JSON.parse(saved); // Validate JSON
        } catch (e) {
          // If filters are corrupted, remove them
          localStorage.removeItem("complaintFilters");
          console.log("[ComplaintTable] Removed corrupted filters from cache");
        }
      }
    } catch (e) {
      console.warn("[ComplaintTable] Error validating cache:", e);
    }
  }, []);

  useEffect(() => {
    retryCountRef.current = 0;
    fetchComplaints();
  }, []);

  const fetchComplaints = async (retryCount = 0) => {
    if (!isMountedRef.current) return;

    try {
      console.log(
        "[ComplaintTable] Iniciando busca de registros... (tentativa " +
        (retryCount + 1) +
        ")"
      );
      console.log(
        "[ComplaintTable] Supabase URL:",
        import.meta.env.VITE_SUPABASE_URL
      );

      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        console.error(
          "[ComplaintTable] Variáveis de ambiente Supabase não configuradas!"
        );
        toast.error(
          "Erro: Variáveis Supabase não configuradas. Verifique .env."
        );
        if (isMountedRef.current) setLoading(false);
        return;
      }

      // Timeout promise: 120 seconds for slow connections
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout na busca")), 120000)
      );

      const fetchPromise = supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("[ComplaintTable] Executando query...");
      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise,
      ]);

      if (error) {
        console.error("[ComplaintTable] Erro do Supabase:", error);
        console.error("[ComplaintTable] Código do erro:", error.code);
        console.error("[ComplaintTable] Mensagem:", error.message);

        // Retry logic for transient errors
        if (
          retryCount < 3 &&
          (error.message.includes("timeout") ||
            error.message.includes("network") ||
            error.message.includes("ECONNREFUSED") ||
            error.code === "503" ||
            error.code === "PGRST000")
        ) {
          console.log(
            "[ComplaintTable] Retentando... (" + (retryCount + 1) + "/3)"
          );
          setTimeout(() => {
            if (isMountedRef.current) {
              fetchComplaints(retryCount + 1);
            }
          }, 2000 * (retryCount + 1)); // Exponential backoff
          return;
        }

        // Mensagens específicas por tipo de erro
        if (error.code === "PGRST116") {
          toast.error(
            "Erro: Tabela não encontrada. Verifique o schema do banco."
          );
        } else if (error.message.includes("JWT")) {
          toast.error("Erro de autenticação. Faça login novamente.");
        } else if (
          error.message.includes("permission") ||
          error.message.includes("policy")
        ) {
          toast.error("Erro de permissão. Verifique as políticas RLS.");
        } else {
          toast.error(`Erro ao carregar: ${error.message}`);
        }

        if (isMountedRef.current) {
          setComplaints([]);
          setLoading(false);
        }
      } else if (data) {
        console.log("[ComplaintTable] Registros carregados:", data.length);
        if (isMountedRef.current) {
          setComplaints(data);
          toast.success(`${data.length} registros carregados`);
          setLoading(false);
        }
      } else {
        console.warn("[ComplaintTable] Nenhum dado retornado");
        if (isMountedRef.current) {
          setComplaints([]);
          toast.info("Nenhum registro encontrado");
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("[ComplaintTable] Erro na busca:", error);

      if (error.message === "Timeout na busca" || error.message === "Timeout") {
        // Retry on timeout
        if (retryCount < 3) {
          console.log(
            "[ComplaintTable] Timeout - Retentando... (" +
            (retryCount + 1) +
            "/3)"
          );
          setTimeout(() => {
            if (isMountedRef.current) {
              fetchComplaints(retryCount + 1);
            }
          }, 2000 * (retryCount + 1));
          return;
        }
        console.error("[ComplaintTable] Timeout após 120 segundos");
        toast.error(
          "Timeout: A conexão com o Supabase está muito lenta. Verifique sua internet ou se o projeto está ativo."
        );
      } else if (error.message.includes("fetch")) {
        console.error("[ComplaintTable] Erro de rede");
        toast.error(
          "Erro de rede: Não foi possível conectar ao Supabase. Verifique sua conexão."
        );
      } else {
        toast.error("Erro ao carregar dados: " + error.message);
      }

      if (isMountedRef.current) {
        setComplaints([]);
        setLoading(false);
      }
    }
    console.log("[ComplaintTable] Busca finalizada");
  };

  const handleView = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetail(true);
  };

  const handleEdit = (complaint) => {
    // Navigate to edit page (we'll create this route)
    navigate(`/edit/${complaint.id}`, { state: { complaint } });
  };

  const handleDeleteClick = (complaint) => {
    if (role !== "admin") {
      toast.warning("Apenas administradores podem excluir registros");
      return;
    }
    setDeleteDialog({ isOpen: true, complaint });
  };

  const handleDeleteConfirm = async () => {
    const complaint = deleteDialog.complaint;
    if (!complaint) return;

    try {
      const { error } = await supabase
        .from("complaints")
        .delete()
        .eq("id", complaint.id);

      if (error) throw error;

      toast.success("Registro excluído com sucesso");
      fetchComplaints(); // Refresh list
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Erro ao excluir registro: " + error.message);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  const handleApplyFilters = (filters) => {
    setAdvancedFilters(filters);
    localStorage.setItem("complaintFilters", JSON.stringify(filters));
    setCurrentPage(1); // Reset to first page
    toast.success("Filtros aplicados");
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      dateFrom: "",
      dateTo: "",
      categoria: "",
      fiscal: "",
      bairro: "",
      acaoTomada: "",
    };
    setAdvancedFilters(emptyFilters);
    localStorage.removeItem("complaintFilters");
    setCurrentPage(1);
    toast.info("Filtros removidos");
  };

  const filteredData = useMemo(() => {
    return complaints.filter((item) => {
      const status = getStatus(item);
      const matchesStatus =
        statusFilter === "ALL" || status.label === statusFilter;
      const text = filterText.toLowerCase();
      const matchesText =
        item.autuado?.toLowerCase().includes(text) ||
        item.logradouro?.toLowerCase().includes(text) ||
        item.numero_atendimento?.toLowerCase().includes(text) ||
        item.cpf_cnpj?.includes(text);

      // Advanced filters
      const matchesDateFrom =
        !advancedFilters.dateFrom ||
        item.data_denuncia >= advancedFilters.dateFrom;
      const matchesDateTo =
        !advancedFilters.dateTo || item.data_denuncia <= advancedFilters.dateTo;
      const matchesCategoria =
        !advancedFilters.categoria ||
        item.descricao
          ?.toLowerCase()
          .includes(advancedFilters.categoria.toLowerCase());
      const matchesFiscal =
        !advancedFilters.fiscal ||
        item.fiscal
          ?.toLowerCase()
          .includes(advancedFilters.fiscal.toLowerCase());
      const matchesBairro =
        !advancedFilters.bairro ||
        item.bairro
          ?.toLowerCase()
          .includes(advancedFilters.bairro.toLowerCase());
      const matchesAcao =
        !advancedFilters.acaoTomada ||
        item.acao_tomada === advancedFilters.acaoTomada;

      return (
        matchesStatus &&
        matchesText &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesCategoria &&
        matchesFiscal &&
        matchesBairro &&
        matchesAcao
      );
    });
  }, [complaints, filterText, statusFilter, advancedFilters]);

  // Sorted data
  const sortedData = useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = "";
      if (bValue === null || bValue === undefined) bValue = "";

      // String comparison
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortField, sortDirection]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, statusFilter]);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Denúncias");
    XLSX.writeFile(wb, "denuncias.xlsx");
    toast.success("Arquivo Excel exportado");
  };

  const exportPDF = (orientation = "landscape") => {
    try {
      // Check if there's data to export
      if (!filteredData || filteredData.length === 0) {
        toast.warning("Nenhum dado para exportar");
        return;
      }

      toast.info("Gerando PDF...");

      const doc = new jsPDF(orientation);
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Header with styling
      doc.setFillColor(79, 70, 229); // Indigo
      doc.rect(0, 0, pageWidth, 25, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      doc.text("Relatório de Denúncias", 14, 16);

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      const now = new Date();
      const dateStr = `Gerado em: ${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR")}`;
      doc.text(dateStr, pageWidth - 14, 16, { align: "right" });

      // Summary info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Total de registros: ${filteredData.length}`, 14, 32);

      // Define columns based on orientation
      const tableColumn = orientation === "landscape"
        ? ["Data", "Atendimento", "Autuado", "Endereço", "Bairro", "Status", "Prazo Final"]
        : ["Data", "Autuado", "Status", "Prazo"];

      const tableRows = [];

      // Prepare data with status colors
      filteredData.forEach((item) => {
        const status = getStatus(item);

        const rowData = orientation === "landscape"
          ? [
            item.data_denuncia || "-",
            item.numero_atendimento || "-",
            item.autuado || "-",
            `${item.logradouro || ""}, ${item.numero || ""}`,
            item.bairro || "-",
            status.label,
            item.data_final || "-",
          ]
          : [
            item.data_denuncia || "-",
            item.autuado || "-",
            status.label,
            item.data_final || "-",
          ];

        tableRows.push({ data: rowData, status: status.color });
      });

      // Generate table with conditional formatting
      doc.autoTable({
        head: [tableColumn],
        body: tableRows.map(row => row.data),
        startY: 38,
        theme: "grid",
        headStyles: {
          fillColor: [79, 70, 229], // Indigo
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
          halign: "center",
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: orientation === "landscape" ? {
          0: { cellWidth: 25, halign: "center" }, // Data
          1: { cellWidth: 30, halign: "center" }, // Atendimento
          2: { cellWidth: 40 }, // Autuado
          3: { cellWidth: 60 }, // Endereço
          4: { cellWidth: 35 }, // Bairro
          5: { cellWidth: 30, halign: "center" }, // Status
          6: { cellWidth: 25, halign: "center" }, // Prazo Final
        } : {
          0: { cellWidth: 30, halign: "center" }, // Data
          1: { cellWidth: 60 }, // Autuado
          2: { cellWidth: 35, halign: "center" }, // Status
          3: { cellWidth: 30, halign: "center" }, // Prazo Final
        },
        didParseCell: function (data) {
          // Apply conditional formatting to Status column
          const statusColIndex = orientation === "landscape" ? 5 : 2;

          if (data.column.index === statusColIndex && data.section === "body") {
            const rowIndex = data.row.index;
            const statusColor = tableRows[rowIndex].status;

            // Set background color based on status
            if (statusColor === "green") {
              data.cell.styles.fillColor = [220, 252, 231]; // Light green
              data.cell.styles.textColor = [22, 101, 52]; // Dark green
              data.cell.styles.fontStyle = "bold";
            } else if (statusColor === "orange") {
              data.cell.styles.fillColor = [255, 237, 213]; // Light orange
              data.cell.styles.textColor = [154, 52, 18]; // Dark orange
              data.cell.styles.fontStyle = "bold";
            } else if (statusColor === "red") {
              data.cell.styles.fillColor = [254, 226, 226]; // Light red
              data.cell.styles.textColor = [153, 27, 27]; // Dark red
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
        margin: { top: 38, left: 14, right: 14 },
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      doc.save(`relatorio_denuncias_${orientation}.pdf`);
      toast.success("Arquivo PDF exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF: " + error.message);
    }
  };

  if (loading)
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1 flex flex-col md:flex-row gap-2">
            <div className="relative flex-1 max-w-md">
              <div className="h-10 bg-zinc-800 border border-zinc-700 rounded-lg shimmer"></div>
            </div>
            <div className="h-10 w-full md:w-40 bg-zinc-800 border border-zinc-700 rounded-lg shimmer"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 flex-1 md:flex-none md:w-24 bg-zinc-800 border border-zinc-700 rounded-lg shimmer"></div>
            <div className="h-10 flex-1 md:flex-none md:w-24 bg-zinc-800 border border-zinc-700 rounded-lg shimmer"></div>
          </div>
        </div>
        {isMobile ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <MobileCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <TableSkeleton rows={10} />
        )}
      </div>
    );

  return (
    <>
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1 flex flex-col md:flex-row gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 text-zinc-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por autuado, endereço, CPF..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            <select
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Todos Status</option>
              <option value="AGUARDAR">Aguardar</option>
              <option value="PRORROGADO">Prorrogado</option>
              <option value="VENCIDO">Vencido</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportExcel}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-700/20 text-green-400 border border-green-700/50 rounded-lg hover:bg-green-700/30 transition-all hover-lift"
            >
              <FileSpreadsheet size={18} />{" "}
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={() => setShowPdfModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-700/20 text-red-400 border border-red-700/50 rounded-lg hover:bg-red-700/30 transition-all hover-lift"
            >
              <FileText size={18} />{" "}
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* Mobile View - Cards */}
        {isMobile ? (
          <div className="space-y-3">
            {paginatedData.map((item, index) => (
              <div
                key={item.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MobileCard
                  complaint={item}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  role={role}
                  getStatus={getStatus}
                  getStatusColor={getStatusColor}
                />
              </div>
            ))}
            {paginatedData.length === 0 && (
              <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-xl p-8 text-center text-zinc-500">
                Nenhum registro encontrado.
              </div>
            )}
          </div>
        ) : (
          /* Desktop View - Table */
          <div className="overflow-x-auto rounded-xl border border-zinc-700 shadow-xl bg-zinc-800/50 backdrop-blur-sm custom-scrollbar">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-800 text-xs uppercase font-semibold text-zinc-400">
                <tr>
                  <SortableHeader
                    field="data_denuncia"
                    label="Data"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <th className="px-6 py-4">Status</th>
                  <SortableHeader
                    field="autuado"
                    label="Autuado"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="logradouro"
                    label="Endereço"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="atendimento"
                    label="Atendimento"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="data_final"
                    label="Prazo Final"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700">
                {paginatedData.map((item, index) => {
                  const status = getStatus(item);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-700/50 transition-all animate-fade-in hover-lift"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-6 py-4">{item.data_denuncia}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold border transition-all ${getStatusColor(
                            status.color
                          )}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {item.autuado || "-"}
                      </td>
                      <td className="px-6 py-4">
                        {item.logradouro}, {item.numero}
                      </td>
                      <td className="px-6 py-4">{item.atendimento}</td>
                      <td className="px-6 py-4">{item.data_final || "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(item)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all ripple-container"
                            title="Visualizar"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-all ripple-container"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className={`p-2 rounded-lg transition-all ripple-container ${role === "admin"
                              ? "text-red-400 hover:bg-red-500/20"
                              : "text-zinc-600 cursor-not-allowed"
                              }`}
                            title={
                              role === "admin" ? "Excluir" : "Apenas Admin"
                            }
                            disabled={role !== "admin"}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-zinc-500"
                    >
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 animate-slide-up">
            <div className="text-sm text-zinc-400">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
              {Math.min(currentPage * itemsPerPage, sortedData.length)} de{" "}
              {sortedData.length} registros
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover-lift"
                title="Primeira página"
              >
                <ChevronsLeft size={18} />
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover-lift"
                title="Página anterior"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
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
                        className={`px-3 py-1 rounded-lg font-medium transition-all hover-lift ${currentPage === page
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                          : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                          }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="text-zinc-600">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover-lift"
                title="Próxima página"
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover-lift"
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
            setShowDetail(false);
            setSelectedComplaint(null);
          }}
          onEdit={(complaint) => {
            setShowDetail(false);
            handleEdit(complaint);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, complaint: null })}
        onConfirm={handleDeleteConfirm}
        title="Excluir Registro"
        message={`Tem certeza que deseja excluir a denúncia de ${deleteDialog.complaint?.autuado || "este registro"
          }? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* PDF Export Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-zinc-800 rounded-2xl border border-zinc-700 shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-zinc-700">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="text-red-400" />
                Exportar Relatório PDF
              </h3>
              <p className="text-zinc-400 text-sm mt-1">
                Escolha a orientação do documento
              </p>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  exportPDF("portrait");
                  setShowPdfModal(false);
                }}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-zinc-700 bg-zinc-800/50 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300 group"
              >
                <div className="w-12 h-16 border-2 border-zinc-500 rounded flex items-center justify-center group-hover:border-red-400 transition-colors bg-zinc-900">
                  <div className="w-8 h-1 bg-zinc-600 rounded-full group-hover:bg-red-400/50"></div>
                </div>
                <span className="font-bold text-zinc-300 group-hover:text-white">Retrato</span>
                <span className="text-xs text-zinc-500 text-center">Melhor para listas simples</span>
              </button>

              <button
                onClick={() => {
                  exportPDF("landscape");
                  setShowPdfModal(false);
                }}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-zinc-700 bg-zinc-800/50 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300 group"
              >
                <div className="w-16 h-12 border-2 border-zinc-500 rounded flex items-center justify-center group-hover:border-red-400 transition-colors bg-zinc-900">
                  <div className="w-12 h-1 bg-zinc-600 rounded-full group-hover:bg-red-400/50"></div>
                </div>
                <span className="font-bold text-zinc-300 group-hover:text-white">Paisagem</span>
                <span className="text-xs text-zinc-500 text-center">Melhor para muitas colunas</span>
              </button>
            </div>

            <div className="p-4 bg-zinc-900/50 border-t border-zinc-700 flex justify-end">
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Sortable Header Component
const SortableHeader = ({ field, label, sortField, sortDirection, onSort }) => {
  const isActive = sortField === field;

  return (
    <th
      className="px-6 py-4 cursor-pointer hover:bg-zinc-700/50 transition-colors select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {isActive ? (
          sortDirection === "asc" ? (
            <ArrowUp size={14} className="text-indigo-400" />
          ) : (
            <ArrowDown size={14} className="text-indigo-400" />
          )
        ) : (
          <ArrowUpDown size={14} className="text-zinc-600" />
        )}
      </div>
    </th>
  );
};
