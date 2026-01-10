import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { getStatus } from "./utils";

// Mapping of sections to fields
export const EXPORT_SECTIONS = {
    dados: {
        label: "Dados da Denúncia",
        fields: [
            { header: "Data", key: "data_denuncia", format: "date" },
            { header: "Diligência", key: "diligencia" },
            { header: "Atendimento", key: "atendimento" },
            { header: "Nº Atend.", key: "numero_atendimento" },
            { header: "Descrição", key: "descricao" },
        ]
    },
    endereco: {
        label: "Endereço",
        fields: [
            { header: "Tipo", key: "rua_tipo" },
            { header: "Logradouro", key: "logradouro" },
            { header: "Número", key: "numero" },
            { header: "Bairro", key: "bairro" },
            { header: "Comp.", key: "complemento" },
        ]
    },
    acao: {
        label: "Ação Fiscal",
        fields: [
            { header: "No Local", key: "no_local" },
            { header: "Ação", key: "acao_tomada" },
            { header: "Autuado", key: "autuado" },
            { header: "CPF/CNPJ", key: "cpf_cnpj" },
            { header: "Nº Auto", key: "numero_autuacao" },
            { header: "Recebido Por", key: "recebido_por" },
        ]
    },
    prazos: {
        label: "Prazos & Situação",
        fields: [
            { header: "Prazo (Dias)", key: "prazo_dias" },
            { header: "Data Inicial", key: "data_inicial", format: "date" },
            { header: "Data Final", key: "data_final", format: "date" },
            { header: "Prorr. (Dias)", key: "prorrogacao_dias" },
            { header: "Prorrogado Até", key: "prorrogado_ate", format: "date" },
            { header: "Status", key: "status", isComputed: true },
        ]
    },
    identificacao: {
        label: "Identificação & Multa",
        fields: [
            { header: "Categoria", key: "categoria" },
            { header: "Fiscais", key: "fiscais_atuantes" },
            { header: "Nº ACI", key: "numero_aci" },
            { header: "Data ACI", key: "data_aci", format: "date" },
            { header: "Obs", key: "observacao" },
        ]
    }
};

// Helper format value
const formatValue = (item, field) => {
    if (field.isComputed && field.key === "status") {
        return getStatus(item).label;
    }

    const val = item[field.key];
    if (!val) return "";

    if (field.format === "date") {
        try {
            // Handle both date object and string
            const date = typeof val === 'string' ? parseISO(val) : val;
            return format(date, "dd/mm/yyyy");
        } catch (e) {
            return val;
        }
    }

    return val;
};

// Filter Data
export const filterDataForExport = (data, filterConfig) => {
    if (filterConfig.type === 'all') return data;

    return data.filter(item => {
        // Filter by data_denuncia usually
        const itemDateStr = item.data_denuncia;
        if (!itemDateStr) return false;
        const itemDate = parseISO(itemDateStr);

        if (filterConfig.type === 'date') {
            if (!filterConfig.date) return true;
            return isSameDay(itemDate, parseISO(filterConfig.date));
        }

        if (filterConfig.type === 'month') {
            if (!filterConfig.month) return true; // expected 'yyyy-MM'
            const [year, month] = filterConfig.month.split('-');
            return itemDate.getFullYear() === parseInt(year) && (itemDate.getMonth() + 1) === parseInt(month);
        }

        if (filterConfig.type === 'range') {
            if (!filterConfig.startDate || !filterConfig.endDate) return true;
            const start = parseISO(filterConfig.startDate);
            const end = parseISO(filterConfig.endDate);
            return isWithinInterval(itemDate, { start, end });
        }

        return true;
    });
};

export const generatePDF = (data, options) => {
    const orientation = options.orientation || 'landscape';
    const doc = new jsPDF(orientation);

    // Title
    doc.setFontSize(16);
    doc.text("Relatório de Denúncias", 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22);

    if (options.subtitle) {
        doc.text(options.subtitle, 14, 28);
    }

    // Build columns
    const columns = [];
    const rows = [];

    // Flatten selected sections
    const selectedFields = [];
    Object.keys(EXPORT_SECTIONS).forEach(sectionKey => {
        if (options.sections[sectionKey]) {
            EXPORT_SECTIONS[sectionKey].fields.forEach(f => selectedFields.push(f));
        }
    });

    const headers = selectedFields.map(f => f.header);

    // Prepare rows
    data.forEach(item => {
        const row = selectedFields.map(field => formatValue(item, field));
        rows.push(row);
    });

    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 35,
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [79, 70, 229] },
        theme: 'grid'
    });

    // Open print view or save
    if (options.print) {
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    } else {
        doc.save('relatorio_completo.pdf');
    }
};

export const generateExcel = (data, options) => {
    // Flatten selected sections
    const selectedFields = [];
    Object.keys(EXPORT_SECTIONS).forEach(sectionKey => {
        if (options.sections[sectionKey]) {
            EXPORT_SECTIONS[sectionKey].fields.forEach(f => selectedFields.push(f));
        }
    });

    // Create worksheet data with headers
    const wsData = [
        selectedFields.map(f => f.header)
    ];

    data.forEach(item => {
        const row = selectedFields.map(field => formatValue(item, field));
        wsData.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");

    XLSX.writeFile(wb, "relatorio_completo.xlsx");
};
