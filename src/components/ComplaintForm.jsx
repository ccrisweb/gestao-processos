import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addDays, format, parseISO } from "date-fns";
import {
  ATENDIMENTO_OPTIONS,
  RUA_OPTIONS,
  NO_LOCAL_OPTIONS,
  ACAO_TOMADA_OPTIONS,
  BAIRRO_OPTIONS,
} from "../lib/constants";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Save,
  AlertCircle,
  FileText,
  MapPin,
  ShieldAlert,
  Clock,
  UserCheck,
} from "lucide-react";
import { getStatus, getStatusColor } from "../lib/utils";

export default function ComplaintForm({
  initialData = null,
  onSuccess,
  mode = "create",
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const isEditMode = mode === "edit" && initialData;

  // Initial State
  const [formData, setFormData] = useState({
    // Grupo 1
    data_denuncia: format(new Date(), "yyyy-MM-dd"),
    diligencia: "1ª",
    descricao: "",
    atendimento: ATENDIMENTO_OPTIONS[0],
    numero_atendimento: "",
    // Grupo 2
    rua_tipo: RUA_OPTIONS[6], // Rua standard
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    // Grupo 3
    no_local: NO_LOCAL_OPTIONS[0],
    acao_tomada: ACAO_TOMADA_OPTIONS[5], // Intimação default
    numero_autuacao: "",
    autuado: "",
    cpf_cnpj: "",
    recebido_por: "",
    // Grupo 4
    prazo_dias: 0,
    data_inicial: "",
    data_final: "",
    prorrogacao_dias: 0,
    prorrogado_ate: "",
    // Grupo 5
    categoria: "",
    fiscais_atuantes: "",
    observacao: "",
    // Grupo 6
    numero_aci: "",
    data_aci: "",
  });

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const calculateDataFinal = (start, days) => {
    if (!start || !days) return "";
    try {
      const startDate = parseISO(start);
      const endDate = addDays(startDate, parseInt(days));
      if (isNaN(endDate)) return "";
      return format(endDate, "yyyy-MM-dd");
    } catch (e) {
      return "";
    }
  };

  const calculateProrrogadoAte = (end, days) => {
    if (!end || !days) return "";
    try {
      const endDate = parseISO(end);
      const extended = addDays(endDate, parseInt(days));
      if (isNaN(extended)) return "";
      return format(extended, "yyyy-MM-dd");
    } catch (e) {
      return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Auto-calculate Data Final logic
      if (name === "data_inicial" || name === "prazo_dias") {
        const start = name === "data_inicial" ? value : prev.data_inicial;
        const days = name === "prazo_dias" ? value : prev.prazo_dias;

        const newDataFinal = calculateDataFinal(start, days);
        if (newDataFinal) {
          newData.data_final = newDataFinal;
          // Recalculate prorrogado_ate if needed
          if (prev.prorrogacao_dias) {
            newData.prorrogado_ate = calculateProrrogadoAte(
              newDataFinal,
              prev.prorrogacao_dias
            );
          }
        }
      }

      // Auto-calculate Prorrogado Até logic
      if (name === "data_final" || name === "prorrogacao_dias") {
        const end =
          name === "data_final" ? value : newData.data_final || prev.data_final;
        const days =
          name === "prorrogacao_dias" ? value : prev.prorrogacao_dias;

        const newProrrogadoAte = calculateProrrogadoAte(end, days);
        if (newProrrogadoAte) {
          newData.prorrogado_ate = newProrrogadoAte;
        }
      }

      return newData;
    });
  };

  // Helper to get current status for display - FIX: Pass the entire formData object
  const currentStatus = getStatus(formData);
  const statusColorClass = getStatusColor(currentStatus.color);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    // Client-side validation
    const validateForm = () => {
      const errs = {};
      
      // Minimal validation: at least some basic data required
      // Description: only required if entered, minimum 3 characters if provided
      if (formData.descricao && formData.descricao.trim().length > 0 && formData.descricao.trim().length < 3) {
        errs.descricao = "Descrição deve ter no mínimo 3 caracteres.";
      }

      // Numeric sanity
      if (formData.prazo_dias && Number(formData.prazo_dias) < 0) {
        errs.prazo_dias = "Prazo deve ser >= 0.";
      }

      // If both dates provided, ensure data_final is same or after
      if (formData.data_inicial && formData.data_final) {
        try {
          const start = parseISO(formData.data_inicial);
          const end = parseISO(formData.data_final);
          if (isNaN(start) || isNaN(end) || end < start) {
            errs.data_final =
              "Data final deve ser igual ou posterior à data inicial.";
          }
        } catch (e) {
          errs.data_final = "Formato de data inválido.";
        }
      }

      return errs;
    };

    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Existem erros no formulário. Corrija e tente novamente.");
      setLoading(false);
      return;
    }

    try {
      // Increased timeout to 120 seconds for database operations
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Tempo limite excedido ao salvar. Verifique sua conexão."
              )
            ),
          120000
        )
      );

      const savePromise = (async () => {
        // Sanitize payload: convert empty date strings to null and ensure numeric fields are numbers
        const sanitizePayload = (data) => {
          const copy = { ...data };
          // Convert any empty string date-like fields to null
          Object.keys(copy).forEach((k) => {
            const v = copy[k];
            if (typeof v === "string" && v.trim() === "") {
              // if field name contains 'data' or starts with 'data_' treat as date -> null
              if (
                k.toLowerCase().includes("data") ||
                k.toLowerCase().includes("date") ||
                k.toLowerCase().includes("prorrogado")
              ) {
                copy[k] = null;
              } else {
                // keep empty strings for textual optional fields
                copy[k] = "";
              }
            }
          });

          // Numeric fields — ensure numbers (or default 0)
          const intFields = ["prazo_dias", "prorrogacao_dias"];
          intFields.forEach((k) => {
            if (copy[k] === "" || copy[k] === undefined || copy[k] === null) {
              copy[k] = 0;
            } else {
              const n = parseInt(copy[k], 10);
              copy[k] = Number.isNaN(n) ? 0 : n;
            }
          });

          return copy;
        };

        const payload = {
          ...sanitizePayload(formData),
          user_id: user?.id,
          updated_at: new Date().toISOString(),
        };

        console.log(
          isEditMode ? "Updating complaint:" : "Creating complaint:",
          payload
        );

        let data, error;

        if (isEditMode) {
          // Update existing record
          const result = await supabase
            .from("complaints")
            .update(payload)
            .eq("id", initialData.id)
            .select();

          data = result.data;
          error = result.error;
        } else {
          // Insert new record
          const result = await supabase
            .from("complaints")
            .insert([payload])
            .select();

          data = result.data;
          error = result.error;
        }

        if (error) {
          console.error("Database error:", error);
          throw new Error(error.message || "Erro ao salvar no banco de dados");
        }

        console.log("Save successful:", data);
        return data;
      })();

      await Promise.race([savePromise, timeoutPromise]);

      // Success
      toast.success(
        isEditMode
          ? "Registro atualizado com sucesso!"
          : "Registro criado com sucesso!"
      );
      if (onSuccess) onSuccess();

      // Navigate to dashboard after a short delay to show toast
      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      console.error("Error saving:", err);
      const errorMsg =
        "Erro ao salvar: " +
        (err.message || "Erro desconhecido. Verifique sua conexão.");
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: "Dados da Denúncia", icon: FileText },
    { id: 2, title: "Endereço", icon: MapPin },
    { id: 3, title: "Ação da Fiscalização", icon: ShieldAlert },
    { id: 4, title: "Prazos & Finalização", icon: Clock },
  ];

  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Simple validity check (can be expanded)
  const isFormValid = () => {
    // Require data_final to be set and not empty
    if (!formData.data_final) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center cursor-pointer transition-colors duration-300 ${
                currentStep >= step.id ? "text-indigo-400" : "text-zinc-600"
              }`}
              onClick={() => setCurrentStep(step.id)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 transition-all duration-500 ${
                  currentStep >= step.id
                    ? "border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/20"
                    : "border-zinc-700 bg-zinc-800"
                }`}
              >
                <step.icon size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider hidden md:block">
                {step.title}
              </span>
            </div>
          ))}
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {currentStep === 1 && (
          <Section title="Dados da Denúncia / Solicitação" icon={FileText}>
            <Input
              label="Data"
              name="data_denuncia"
              type="date"
              required
              value={formData.data_denuncia}
              handleChange={handleChange}
            />
            <Input
              label="Diligência (Ex: 1ª)"
              name="diligencia"
              placeholder="1ª, 2ª..."
              value={formData.diligencia}
              handleChange={handleChange}
            />
            <Select
              label="Atendimento"
              name="atendimento"
              options={ATENDIMENTO_OPTIONS}
              value={formData.atendimento}
              handleChange={handleChange}
            />
            <Input
              label="Nº Atendimento (0000/aaaa)"
              name="numero_atendimento"
              value={formData.numero_atendimento}
              handleChange={handleChange}
            />
            <div className="md:col-span-2 lg:col-span-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 transition-colors">
                Descrição
              </label>
              <textarea
                name="descricao"
                rows={3}
                value={formData.descricao || ""}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border-2 border-zinc-700/50 rounded-xl px-4 py-3 text-white 
                  focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200
                  placeholder:text-zinc-600 hover:border-zinc-600 focus:bg-zinc-900"
                placeholder="Descreva a denúncia..."
              />
            </div>
          </Section>
        )}

        {currentStep === 2 && (
          <Section title="Endereço" icon={MapPin}>
            <Select
              label="Tipo"
              name="rua_tipo"
              options={RUA_OPTIONS}
              value={formData.rua_tipo}
              handleChange={handleChange}
            />
            <Input
              label="Logradouro"
              name="logradouro"
              className="md:col-span-2"
              value={formData.logradouro}
              handleChange={handleChange}
            />
            <Input
              label="Número"
              name="numero"
              value={formData.numero}
              handleChange={handleChange}
            />
            <Input
              label="Complemento"
              name="complemento"
              value={formData.complemento}
              handleChange={handleChange}
            />
            <Select
              label="Bairro"
              name="bairro"
              options={BAIRRO_OPTIONS}
              value={formData.bairro}
              handleChange={handleChange}
            />
          </Section>
        )}

        {currentStep === 3 && (
          <Section title="Ação da Fiscalização" icon={ShieldAlert}>
            <Select
              label="No Local"
              name="no_local"
              options={NO_LOCAL_OPTIONS}
              value={formData.no_local}
              handleChange={handleChange}
            />
            <Select
              label="Ação Tomada"
              name="acao_tomada"
              options={ACAO_TOMADA_OPTIONS}
              value={formData.acao_tomada}
              handleChange={handleChange}
            />
            <Input
              label="Nº Autuação"
              name="numero_autuacao"
              value={formData.numero_autuacao}
              handleChange={handleChange}
            />
            <Input
              label="Autuado"
              name="autuado"
              value={formData.autuado}
              handleChange={handleChange}
            />
            <Input
              label="CPF / CNPJ"
              name="cpf_cnpj"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              value={formData.cpf_cnpj}
              handleChange={(e) => {
                let v = e.target.value.replace(/\D/g, "");
                if (v.length > 14) v = v.slice(0, 14);

                if (v.length <= 11) {
                  v = v.replace(/(\d{3})(\d)/, "$1.$2");
                  v = v.replace(/(\d{3})(\d)/, "$1.$2");
                  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                } else {
                  v = v.replace(/^(\d{2})(\d)/, "$1.$2");
                  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
                  v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
                  v = v.replace(/(\d{4})(\d)/, "$1-$2");
                }

                handleChange({ target: { name: "cpf_cnpj", value: v } });
              }}
            />
            <Input
              label="Recebido Por"
              name="recebido_por"
              value={formData.recebido_por}
              handleChange={handleChange}
            />
          </Section>
        )}

        {currentStep === 4 && (
          <>
            <Section title="Prazos" icon={Clock}>
              <Input
                label="Prazo (Dias)"
                name="prazo_dias"
                type="number"
                value={formData.prazo_dias}
                handleChange={handleChange}
                placeholder="Ex: 30"
              />
              <Input
                label="Data Inicial"
                name="data_inicial"
                type="date"
                value={formData.data_inicial}
                handleChange={handleChange}
              />
              <div>
                <Input
                  label="Data Final"
                  name="data_final"
                  type="date"
                  value={formData.data_final}
                  handleChange={handleChange}
                  required
                />
                {fieldErrors.data_final && (
                  <p className="text-sm text-red-400 mt-1">
                    {fieldErrors.data_final}
                  </p>
                )}
              </div>
              <Input
                label="Prorr. (Dias)"
                name="prorrogacao_dias"
                type="number"
                value={formData.prorrogacao_dias}
                handleChange={handleChange}
                placeholder="Ex: 15"
              />
              <Input
                label="Prorrogado Até"
                name="prorrogado_ate"
                type="date"
                value={formData.prorrogado_ate}
                handleChange={handleChange}
              />

              {/* SITUAÇÃO Field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Situação
                </label>
                <div
                  className={`w-full px-2 py-3 rounded-xl border flex items-center justify-center ${statusColorClass} transition-colors duration-200 shadow-sm`}
                >
                  <span className="uppercase tracking-wide text-sm font-bold text-center">
                    {currentStatus.label}
                  </span>
                </div>
              </div>
            </Section>

            <Section title="Identificação & Multa" icon={UserCheck}>
              <Input
                label="Categoria"
                name="categoria"
                value={formData.categoria}
                handleChange={handleChange}
              />
              <Input
                label="Fiscais Atuantes"
                name="fiscais_atuantes"
                value={formData.fiscais_atuantes}
                handleChange={handleChange}
              />
              <Input
                label="Nº ACI (Multa)"
                name="numero_aci"
                value={formData.numero_aci}
                handleChange={handleChange}
              />
              <Input
                label="Data ACI"
                name="data_aci"
                type="date"
                value={formData.data_aci}
                handleChange={handleChange}
              />
              <div className="col-span-full">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 transition-colors">
                  Observação
                </label>
                <textarea
                  name="observacao"
                  rows={2}
                  value={formData.observacao || ""}
                  onChange={handleChange}
                  className="w-full bg-zinc-900/50 border-2 border-zinc-700/50 rounded-xl px-4 py-3 text-white 
                  focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200
                  placeholder:text-zinc-600 hover:border-zinc-600 focus:bg-zinc-900"
                />
              </div>
            </Section>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-zinc-800">
          <button
            type="button"
            onClick={prevStep}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              currentStep === 1
                ? "opacity-0 pointer-events-none"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            }`}
          >
            Voltar
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={nextStep}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
            >
              Próximo
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title={
                !isFormValid()
                  ? "Preencha os campos obrigatórios antes de salvar"
                  : ""
              }
            >
              {loading ? (
                isEditMode ? (
                  "Atualizando..."
                ) : (
                  "Salvando..."
                )
              ) : (
                <>
                  <Save size={20} />
                  {isEditMode ? "Atualizar Registro" : "Salvar Registro"}
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// Components defined OUTSIDE
const Section = ({ title, children, icon: Icon }) => (
  <div className="bg-zinc-800/80 backdrop-blur-sm p-6 rounded-2xl border border-zinc-700/50 shadow-xl mb-8 group hover:border-indigo-500/30 transition-all duration-300">
    <h3 className="text-xl font-bold text-white mb-6 border-b border-zinc-700 pb-3 flex items-center gap-2">
      {Icon && <Icon className="text-indigo-400" size={24} />}
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 group-hover:from-indigo-400 group-hover:to-purple-400 transition-all">
        {title}
      </span>
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  </div>
);

const Input = ({
  label,
  name,
  type = "text",
  className = "",
  value,
  handleChange,
  ...props
}) => (
  <div className={`flex flex-col group/input ${className}`}>
    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 group-focus-within/input:text-indigo-400 transition-colors">
      {label}
    </label>
    <input
      name={name}
      type={type}
      value={value !== undefined && value !== null ? value : ""}
      onChange={handleChange}
      className="bg-zinc-900/50 border-2 border-zinc-700/50 rounded-xl px-4 py-3 text-white 
      focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200
      placeholder:text-zinc-600 hover:border-zinc-600 focus:bg-zinc-900"
      {...props}
    />
  </div>
);

const Select = ({ label, name, options, value, handleChange, ...props }) => (
  <div className="flex flex-col group/input">
    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 group-focus-within/input:text-indigo-400 transition-colors">
      {label}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value !== undefined && value !== null ? value : ""}
        onChange={handleChange}
        className="w-full bg-zinc-900/50 border-2 border-zinc-700/50 rounded-xl px-4 py-3 text-white appearance-none
        focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200
        hover:border-zinc-600 cursor-pointer focus:bg-zinc-900"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="w-4 h-4 text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  </div>
);
