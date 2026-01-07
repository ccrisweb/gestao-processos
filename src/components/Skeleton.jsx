// Skeleton Loader Components

export const TableSkeleton = ({ rows = 5 }) => {
    return (
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
                        <th className="px-6 py-4 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                    {[...Array(rows)].map((_, index) => (
                        <tr key={index} className="animate-pulse">
                            <td className="px-6 py-4">
                                <div className="h-4 bg-zinc-700 rounded w-24"></div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="h-6 bg-zinc-700 rounded-full w-20"></div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="h-4 bg-zinc-700 rounded w-32"></div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="h-4 bg-zinc-700 rounded w-40"></div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="h-4 bg-zinc-700 rounded w-28"></div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="h-4 bg-zinc-700 rounded w-24"></div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-8 w-8 bg-zinc-700 rounded-lg"></div>
                                    <div className="h-8 w-8 bg-zinc-700 rounded-lg"></div>
                                    <div className="h-8 w-8 bg-zinc-700 rounded-lg"></div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export const CardSkeleton = () => {
    return (
        <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 p-6 rounded-2xl relative overflow-hidden animate-pulse">
            <div className="h-4 bg-zinc-700 rounded w-32 mb-3"></div>
            <div className="h-10 bg-zinc-700 rounded w-16"></div>
        </div>
    )
}

export const StatsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
        </div>
    )
}

export const FormSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="bg-zinc-800/80 backdrop-blur-sm p-6 rounded-2xl border border-zinc-700/50">
                <div className="h-6 bg-zinc-700 rounded w-48 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 bg-zinc-700 rounded w-24"></div>
                            <div className="h-10 bg-zinc-700 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export const LoadingSpinner = ({ size = 'md', text = 'Carregando...' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    }

    return (
        <div className="flex flex-col items-center justify-center gap-3 p-8">
            <div className={`${sizes[size]} border-4 border-zinc-700 border-t-indigo-500 rounded-full animate-spin`}></div>
            {text && <p className="text-zinc-400 text-sm">{text}</p>}
        </div>
    )
}

export default {
    TableSkeleton,
    CardSkeleton,
    StatsSkeleton,
    FormSkeleton,
    LoadingSpinner
}
