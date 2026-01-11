import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { getStatus } from "./utils";

// Mapping of sections to fields based on the requested 27-column layout
export const EXPORT_SECTIONS = {
    dados_principais: {
        label: "Dados Principais",
        fields: [
            { header: "DATA", key: "data_denuncia", format: "date" },
            { header: "DILIG", key: "diligencia" },
            { header: "ATENDIMENTO", key: "atendimento" },
            { header: "Nº", key: "numero_atendimento" },
            { header: "DENÚNCIA", key: "descricao" },
        ]
    },
    endereco_completo: {
        label: "Endereço Completo",
        fields: [
            { header: "AV / RUA", key: "rua_tipo" },
            { header: "LOGRADOURO", key: "logradouro" },
            { header: "Nº", key: "numero" },
            { header: "COMPL", key: "complemento" },
            { header: "BAIRRO", key: "bairro" },
        ]
    },
    acao_fiscal: {
        label: "Ação Fiscal",
        fields: [
            { header: "NO LOCAL", key: "no_local" },
            { header: "AÇÃO TOMADA", key: "acao_tomada" },
            { header: "Nº", key: "numero_autuacao" },
            { header: "AUTUADO", key: "autuado" },
            { header: "CPF / CNPJ", key: "cpf_cnpj" },
            { header: "RECEBIDO", key: "recebido_por" },
        ]
    },
    prazos_situacao: {
        label: "Prazos & Situação",
        fields: [
            { header: "PRAZO", key: "prazo_dias" },
            { header: "DATA INICIAL", key: "data_inicial", format: "date" },
            { header: "DATA FINAL", key: "data_final", format: "date" },
            { header: "PRORR", key: "prorrogacao_dias" },
            { header: "PRORR ATÉ", key: "prorrogado_ate", format: "date" },
            { header: "SITUAÇÃO", key: "status", isComputed: true },
        ]
    },
    identificacao_extra: {
        label: "Identificação & Obs",
        fields: [
            { header: "CATEGORIA", key: "categoria" },
            { header: "FISCAIS", key: "fiscais_atuantes" },
            { header: "OBSERVAÇÃO", key: "observacao" },
            { header: "DATA AC", key: "data_aci", format: "date" },
            { header: "Nº ACI", key: "numero_aci" },
        ]
    }
};

// Helper format value
const formatValue = (item, field) => {
    if (field.isComputed && field.key === "status") {
        return getStatus(item).label;
    }

    const val = item[field.key];
    if (val === undefined || val === null) return "";

    if (field.format === "date") {
        try {
            const date = typeof val === 'string' ? parseISO(val) : val;
            return format(date, "dd/MM/yyyy");
        } catch (e) {
            return val;
        }
    }

    return String(val);
};

// Filter Data
export const filterDataForExport = (data, filterConfig) => {
    if (!data) return [];
    if (filterConfig.type === 'all') return data;

    return data.filter(item => {
        const itemDateStr = item.data_denuncia;
        if (!itemDateStr) return false;

        try {
            const itemDate = parseISO(itemDateStr);

            if (filterConfig.type === 'date') {
                if (!filterConfig.date) return true;
                return isSameDay(itemDate, parseISO(filterConfig.date));
            }

            if (filterConfig.type === 'month') {
                if (!filterConfig.month) return true;
                const [year, month] = filterConfig.month.split('-');
                return itemDate.getFullYear() === parseInt(year) && (itemDate.getMonth() + 1) === parseInt(month);
            }

            if (filterConfig.type === 'range') {
                if (!filterConfig.startDate || !filterConfig.endDate) return true;
                const start = parseISO(filterConfig.startDate);
                const end = parseISO(filterConfig.endDate);
                return isWithinInterval(itemDate, { start, end });
            }
        } catch (e) {
            return false;
        }

        return true;
    });
};

export const generatePDF = (data, options) => {
    const orientation = options.orientation || 'landscape';
    const doc = new jsPDF(orientation, 'mm', 'a4');

    // Title
    doc.setFontSize(14);
    doc.text("Relatório de Denúncias", 14, 12);
    doc.setFontSize(8);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 18);

    if (options.subtitle) {
        doc.text(options.subtitle, 14, 23);
    }

    // Build columns
    const selectedFields = [];
    Object.keys(EXPORT_SECTIONS).forEach(sectionKey => {
        if (options.sections[sectionKey]) {
            EXPORT_SECTIONS[sectionKey].fields.forEach(f => selectedFields.push(f));
        }
    });

    const headers = selectedFields.map(f => f.header);
    const rows = data.map(item => selectedFields.map(field => formatValue(item, field)));

    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 28,
        styles: {
            fontSize: 5.5, // Small font for many columns
            cellPadding: 1,
            overflow: 'linebreak',
            lineWidth: 0.1,
            lineColor: [200, 200, 200]
        },
        headStyles: {
            fillColor: [60, 60, 60],
            textColor: [255, 255, 255],
            fontSize: 6,
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            // Auto size columns based on header/content where possible
            // or let autoTable handle 'auto' distribution
        },
        margin: { top: 25, right: 5, bottom: 10, left: 5 },
        theme: 'grid'
    });

    if (options.print) {
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    } else {
        doc.save('relatorio_fiscais.pdf');
    }
};

export const generateExcel = (data, options) => {
    const selectedFields = [];
    Object.keys(EXPORT_SECTIONS).forEach(sectionKey => {
        if (options.sections[sectionKey]) {
            EXPORT_SECTIONS[sectionKey].fields.forEach(f => selectedFields.push(f));
        }
    });

    const wsData = [selectedFields.map(f => f.header)];
    data.forEach(item => {
        wsData.push(selectedFields.map(field => formatValue(item, field)));
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto-width logic for Excel
    const colWidths = selectedFields.map((field, colIndex) => {
        const headerLen = field.header.length;
        const maxContentLen = data.reduce((max, item) => {
            const val = formatValue(item, field);
            return Math.max(max, val ? val.length : 0);
        }, headerLen);
        return { wch: maxContentLen + 2 }; // +2 padding
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    XLSX.writeFile(wb, "relatorio_denuncias.xlsx");
};
