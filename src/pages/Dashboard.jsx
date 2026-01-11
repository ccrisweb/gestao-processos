import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";
import ComplaintTable from "../components/ComplaintTable";
import { StatsSkeleton } from "../components/Skeleton";
import { PieChart, BarChart } from "../components/Charts";
import {
  PlusCircle,
  LogOut,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStatus } from "../lib/utils";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, open: 0, expired: 0, extended: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [chartData, setChartData] = useState({ byStatus: [], byMonth: [] });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const { count: total, error: countError } = await Promise.race([
        supabase.from("complaints").select("*", { count: "exact", head: true }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 120000)
        ),
      ]);

      if (countError) throw countError;

      const { data, error: dataError } = await Promise.race([
        supabase.from("complaints").select("data_final, prorrogado_ate"),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 120000)
        ),
      ]);

      if (dataError) throw dataError;

      if (data) {
        let open = 0;
        let expired = 0;
        let extended = 0;
        let pending = 0;

        data.forEach((item) => {
          const status = getStatus(item);
          if (status.label === "AGUARDAR") open++;
          else if (status.label === "VENCIDO") expired++;
          else if (status.label === "PRORROGADO") extended++;
          else pending++;
        });

        setStats({ total: total || 0, open, expired, extended });

        setChartData({
          byStatus: [
            { label: "Em Aberto", value: open, color: "#22c55e" },
            { label: "Vencidos", value: expired, color: "#ef4444" },
            { label: "Prorrogados", value: extended, color: "#f97316" },
            { label: "Pendentes", value: pending, color: "#6b7280" },
          ].filter(item => item.value > 0),
          byMonth: [],
        });
      }
    } catch (error) {
      console.error("[Dashboard] Erro ao buscar estatísticas:", error);
      setStats({ total: 0, open: 0, expired: 0, extended: 0 });
      setChartData({ byStatus: [], byMonth: [] });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erro ao sair do sistema.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              Painel de Controle
            </h1>
            <p className="text-zinc-400 mt-1">Bem-vindo, {user?.email}</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate("/new")}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20 hover-lift ripple-container"
            >
              <PlusCircle size={18} />
              Novo Registro
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-all text-zinc-300 hover-lift"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {loadingStats ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all animate-slide-up hover-lift">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <PlusCircle size={64} />
              </div>
              <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
                Total Registrados
              </h3>
              <p className="text-4xl font-bold mt-2">{stats.total}</p>
            </div>

            <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 p-6 rounded-2xl relative overflow-hidden hover:border-yellow-500/30 transition-all animate-slide-up delay-100 hover-lift">
              <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
                Em Aberto
              </h3>
              <p className="text-4xl font-bold mt-2 text-yellow-500">
                {stats.open}
              </p>
            </div>

            <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 p-6 rounded-2xl relative overflow-hidden hover:border-red-500/30 transition-all animate-slide-up delay-200 hover-lift">
              <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
                Vencidos
              </h3>
              <p className="text-4xl font-bold mt-2 text-red-500">
                {stats.expired}
              </p>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {!loadingStats && chartData.byStatus.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 p-6 rounded-2xl hover:border-indigo-500/30 transition-all animate-scale-in delay-300 hover-lift">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="text-indigo-400" size={24} />
                <h3 className="text-lg font-semibold text-white">
                  Distribuição por Status
                </h3>
              </div>
              <PieChart data={chartData.byStatus} size={220} />
            </div>

            <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 p-6 rounded-2xl hover:border-purple-500/30 transition-all animate-scale-in delay-400 hover-lift">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="text-purple-400" size={24} />
                <h3 className="text-lg font-semibold text-white">
                  Detalhamento de Status
                </h3>
              </div>
              <BarChart data={chartData.byStatus} />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="space-y-4 animate-slide-up delay-300">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
            Registros Recentes
          </h2>
          <ComplaintTable />
        </div>
      </div>
    </div>
  );
}
