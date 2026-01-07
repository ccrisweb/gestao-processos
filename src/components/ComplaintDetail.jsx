import { X, Calendar, MapPin, FileText, User, Clock, AlertCircle } from 'lucide-react'
import { getStatus, getStatusColor } from '../lib/utils'
import { format } from 'date-fns'

export default function ComplaintDetail({ complaint, onClose, onEdit }) {
    if (!complaint) return null

    const status = getStatus(complaint)
    const statusColorClass = getStatusColor(status.color)

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        try {
            return format(new Date(dateString), 'dd/MM/yyyy')
        } catch {
            return dateString
        }
    }

    const Section = ({ title, icon: Icon, children }) => (
        <div className="mb-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4 border-b border-zinc-700 pb-2">
                {Icon && <Icon size={20} className="text-indigo-400" />}
                {title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children}
            </div>
        </div>
    )

    const Field = ({ label, value, fullWidth = false }) => (
        <div className={fullWidth ? 'md:col-span-2' : ''}>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                {label}
            </label>
            <p className="text-white bg-zinc-900/50 px-3 py-2 rounded-lg border border-zinc-700">
                {value || '-'}
            </p>
        </div>
    )

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-zinc-800 rounded-2xl border border-zinc-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-zinc-800 border-b border-zinc-700 p-6 flex justify-between items-start z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Detalhes da Denúncia
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColorClass}`}>
                                {status.label}
                            </span>
                            {complaint.numero_atendimento && (
                                <span className="text-sm text-zinc-400">
                                    Nº {complaint.numero_atendimento}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-700 rounded-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Dados da Denúncia */}
                    <Section title="Dados da Denúncia" icon={FileText}>
                        <Field label="Data da Denúncia" value={formatDate(complaint.data_denuncia)} />
                        <Field label="Diligência" value={complaint.diligencia} />
                        <Field label="Atendimento" value={complaint.atendimento} />
                        <Field label="Nº Atendimento" value={complaint.numero_atendimento} />
                        <Field label="Descrição" value={complaint.descricao} fullWidth />
                    </Section>

                    {/* Endereço */}
                    <Section title="Endereço" icon={MapPin}>
                        <Field label="Tipo" value={complaint.rua_tipo} />
                        <Field label="Logradouro" value={complaint.logradouro} />
                        <Field label="Número" value={complaint.numero} />
                        <Field label="Complemento" value={complaint.complemento} />
                        <Field label="Bairro" value={complaint.bairro} />
                    </Section>

                    {/* Ação da Fiscalização */}
                    <Section title="Ação da Fiscalização" icon={AlertCircle}>
                        <Field label="No Local" value={complaint.no_local} />
                        <Field label="Ação Tomada" value={complaint.acao_tomada} />
                        <Field label="Nº Autuação" value={complaint.numero_autuacao} />
                        <Field label="Autuado" value={complaint.autuado} />
                        <Field label="CPF/CNPJ" value={complaint.cpf_cnpj} />
                        <Field label="Recebido Por" value={complaint.recebido_por} />
                    </Section>

                    {/* Prazos */}
                    <Section title="Prazos" icon={Clock}>
                        <Field label="Prazo (Dias)" value={complaint.prazo_dias || '0'} />
                        <Field label="Data Inicial" value={formatDate(complaint.data_inicial)} />
                        <Field label="Data Final" value={formatDate(complaint.data_final)} />
                        <Field label="Prorrogação (Dias)" value={complaint.prorrogacao_dias || '0'} />
                        <Field label="Prorrogado Até" value={formatDate(complaint.prorrogado_ate)} />
                    </Section>

                    {/* Identificação */}
                    <Section title="Identificação" icon={User}>
                        <Field label="Categoria" value={complaint.categoria} />
                        <Field label="Fiscais Atuantes" value={complaint.fiscais_atuantes} />
                        <Field label="Nº ACI (Multa)" value={complaint.numero_aci} />
                        <Field label="Data ACI" value={formatDate(complaint.data_aci)} />
                        <Field label="Observação" value={complaint.observacao} fullWidth />
                    </Section>

                    {/* Metadata */}
                    <div className="pt-4 border-t border-zinc-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-500">
                            <div>
                                <span className="font-semibold">Criado em:</span>{' '}
                                {complaint.created_at ? formatDate(complaint.created_at.split('T')[0]) : '-'}
                            </div>
                            <div>
                                <span className="font-semibold">Atualizado em:</span>{' '}
                                {complaint.updated_at ? formatDate(complaint.updated_at.split('T')[0]) : '-'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-zinc-800 border-t border-zinc-700 p-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
                    >
                        Fechar
                    </button>
                    {onEdit && (
                        <button
                            onClick={() => onEdit(complaint)}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            Editar
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
