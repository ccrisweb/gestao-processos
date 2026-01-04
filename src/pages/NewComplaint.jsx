
import { useNavigate } from 'react-router-dom'
import ComplaintForm from '../components/ComplaintForm'
import { ArrowLeft } from 'lucide-react'

export default function NewComplaint() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="text-zinc-400" />
                    </button>
                    <h1 className="text-3xl font-bold">Novo Registro</h1>
                </div>

                <ComplaintForm onSuccess={() => navigate('/')} />
            </div>
        </div>
    )
}
