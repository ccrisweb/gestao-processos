
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import ComplaintTable from '../components/ComplaintTable'
import { PlusCircle, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState({ total: 0, open: 0, expired: 0 })

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        // Simple count query - optimization: use count() instead of fetching all
        // For MVP/small data, fetching all is fine or using specific RPCs
        const { count: total } = await supabase.from('complaints').select('*', { count: 'exact', head: true })

        // For expired/open, we'd need date logic. simpler to query all ID + Dates
        const { data } = await supabase.from('complaints').select('data_final, prorrogado_ate')

        if (data) {
            const now = new Date().toISOString().split('T')[0]
            let expired = 0
            let open = 0

            data.forEach(item => {
                const finalDate = item.prorrogado_ate || item.data_final
                if (finalDate && finalDate < now) expired++
                else open++
            })

            setStats({ total: total || 0, open, expired })
        }
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                            Painel de Controle
                        </h1>
                        <p className="text-zinc-400 mt-1">Bem-vindo, {user?.email}</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => navigate('/new')}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            <PlusCircle size={18} />
                            Novo Registro
                        </button>
                        <button
                            onClick={signOut}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors text-zinc-300"
                            title="Sair"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <PlusCircle size={64} />
                        </div>
                        <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Total Registrados</h3>
                        <p className="text-4xl font-bold mt-2">{stats.total}</p>
                    </div>

                    <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 p-6 rounded-2xl relative overflow-hidden">
                        <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Em Aberto</h3>
                        <p className="text-4xl font-bold mt-2 text-yellow-500">{stats.open}</p>
                    </div>

                    <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 p-6 rounded-2xl relative overflow-hidden">
                        <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Vencidos</h3>
                        <p className="text-4xl font-bold mt-2 text-red-500">{stats.expired}</p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                        Registros Recentes
                    </h2>
                    <ComplaintTable />
                </div>
            </div>
        </div>
    )
}
