import { useLocation, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ComplaintForm from '../components/ComplaintForm'

export default function EditComplaint() {
    const navigate = useNavigate()
    const location = useLocation()
    const { id } = useParams()
    const complaint = location.state?.complaint

    if (!complaint) {
        return (
            <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-red-400 mb-4">
                            Denúncia não encontrada
                        </h2>
                        <p className="text-zinc-400 mb-6">
                            Não foi possível carregar os dados da denúncia.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Voltar ao Dashboard
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-zinc-800 pb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                            Editar Denúncia
                        </h1>
                        <p className="text-zinc-400 mt-1">
                            Atualize as informações do registro #{id}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <ComplaintForm initialData={complaint} mode="edit" />
            </div>
        </div>
    )
}
