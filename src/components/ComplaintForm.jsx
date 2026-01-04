
import { useState, useEffect } from 'react'
import { addDays, format, parseISO } from 'date-fns'
import { ATENDIMENTO_OPTIONS, RUA_OPTIONS, NO_LOCAL_OPTIONS, ACAO_TOMADA_OPTIONS } from '../lib/constants'
import { supabase } from '../lib/supabase'
import { Save, AlertCircle } from 'lucide-react'

export default function ComplaintForm({ initialData = null, onSuccess }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        // Grupo 1
        data_denuncia: format(new Date(), 'yyyy-MM-dd'),
        diligencia: '1ª',
        descricao: '',
        atendimento: ATENDIMENTO_OPTIONS[0],
        numero_atendimento: '',
        // Grupo 2
        rua_tipo: RUA_OPTIONS[6], // Rua standard
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        // Grupo 3
        no_local: NO_LOCAL_OPTIONS[0],
        acao_tomada: ACAO_TOMADA_OPTIONS[5], // Intimação default?
        numero_autuacao: '',
        autuado: '',
        cpf_cnpj: '',
        recebido_por: '',
        // Grupo 4
        prazo_inicial: 0,
        data_inicial: '',
        data_final: '',
        prorrogacao: 0,
        prorrogado_ate: '',
        // Grupo 5
        categoria: '',
        fiscais_atuantes: '',
        observacao: '',
        // Grupo 6
        numero_aci: '',
        data_aci: ''
    })

    // Load initial data if editing
    useEffect(() => {
        if (initialData) {
            setFormData(initialData)
        }
    }, [initialData])

    // Calculation Logic
    useEffect(() => {
        if (formData.data_inicial && formData.prazo_inicial) {
            try {
                const start = parseISO(formData.data_inicial)
                const end = addDays(start, parseInt(formData.prazo_inicial))
                setFormData(prev => ({ ...prev, data_final: format(end, 'yyyy-MM-dd') }))
            } catch (e) {
                // ignore invalid dates
            }
        }
    }, [formData.data_inicial, formData.prazo_inicial])

    useEffect(() => {
        if (formData.data_final && formData.prorrogacao) {
            try {
                const end = parseISO(formData.data_final)
                const extended = addDays(end, parseInt(formData.prorrogacao))
                setFormData(prev => ({ ...prev, prorrogado_ate: format(extended, 'yyyy-MM-dd') }))
            } catch (e) {
                // ignore
            }
        }
    }, [formData.data_final, formData.prorrogacao])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { data, error: insertError } = await supabase
                .from('complaints')
                .upsert(initialData ? { ...formData, id: initialData.id } : formData)
                .select()

            if (insertError) throw insertError

            if (onSuccess) onSuccess()
        } catch (err) {
            console.error(err)
            setError('Erro ao salvar formulário. Verifique os dados.')
        } finally {
            setLoading(false)
        }
    }

    const Section = ({ title, children }) => (
        <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 shadow-sm mb-6">
            <h3 className="text-lg font-medium text-white mb-4 border-b border-zinc-700 pb-2">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children}
            </div>
        </div>
    )

    const Input = ({ label, name, type = "text", ...props }) => (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-400 mb-1">{label}</label>
            <input
                name={name}
                type={type}
                value={formData[name] || ''}
                onChange={handleChange}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                {...props}
            />
        </div>
    )

    const Select = ({ label, name, options, ...props }) => (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-400 mb-1">{label}</label>
            <select
                name={name}
                value={formData[name] || ''}
                onChange={handleChange}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                {...props}
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    )

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <Section title="Dados da Denúncia / Solicitação">
                <Input label="Data" name="data_denuncia" type="date" required />
                <Input label="Diligência (Ex: 1ª)" name="diligencia" placeholder="1ª, 2ª..." />
                <Select label="Atendimento" name="atendimento" options={ATENDIMENTO_OPTIONS} />
                <Input label="Nº Atendimento (0000/aaaa)" name="numero_atendimento" />
                <div className="md:col-span-2 lg:col-span-3">
                    <label className="text-sm font-medium text-zinc-400 mb-1">Descrição</label>
                    <textarea
                        name="descricao"
                        rows={3}
                        value={formData.descricao || ''}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Descreva a denúncia..."
                    />
                </div>
            </Section>

            <Section title="Endereço">
                <Select label="Tipo" name="rua_tipo" options={RUA_OPTIONS} />
                <Input label="Logradouro" name="logradouro" className="md:col-span-2" />
                <Input label="Número" name="numero" />
                <Input label="Complemento" name="complemento" />
                <Input label="Bairro" name="bairro" />
            </Section>

            <Section title="Ação da Fiscalização">
                <Select label="No Local" name="no_local" options={NO_LOCAL_OPTIONS} />
                <Select label="Ação Tomada" name="acao_tomada" options={ACAO_TOMADA_OPTIONS} />
                <Input label="Nº Autuação" name="numero_autuacao" />
                <Input label="Autuado" name="autuado" />
                <Input label="CPF/CNPJ" name="cpf_cnpj" />
                <Input label="Recebido Por" name="recebido_por" />
            </Section>

            <Section title="Prazos">
                <Input label="Prazo Inicial (dias)" name="prazo_inicial" type="number" />
                <Input label="Data Inicial" name="data_inicial" type="date" />
                <Input label="Data Final" name="data_final" type="date" readOnly className="bg-zinc-800 text-zinc-500 cursor-not-allowed" />

                <div className="border-t border-zinc-700 col-span-full my-2"></div>

                <Input label="Prorrogação (dias)" name="prorrogacao" type="number" />
                <Input label="Prorrogado Até" name="prorrogado_ate" type="date" readOnly className="bg-zinc-800 text-zinc-500 cursor-not-allowed" />
            </Section>

            <Section title="Identificação & Multa">
                <Input label="Categoria" name="categoria" />
                <Input label="Fiscais Atuantes" name="fiscais_atuantes" />
                <Input label="Nº ACI (Multa)" name="numero_aci" />
                <Input label="Data ACI" name="data_aci" type="date" />
                <div className="col-span-full">
                    <label className="text-sm font-medium text-zinc-400 mb-1">Observação</label>
                    <textarea
                        name="observacao"
                        rows={2}
                        value={formData.observacao || ''}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </Section>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
                >
                    <Save size={20} />
                    {loading ? 'Salvando...' : 'Salvar Registro'}
                </button>
            </div>
        </form>
    )
}
