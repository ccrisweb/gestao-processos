import { AlertCircle, X } from 'lucide-react'

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirmar Ação",
    message = "Tem certeza que deseja continuar?",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    type = "danger" // danger, warning, info
}) {
    if (!isOpen) return null

    const typeStyles = {
        danger: {
            button: 'bg-red-600 hover:bg-red-700 shadow-red-500/20',
            icon: 'text-red-400',
            border: 'border-red-500/20'
        },
        warning: {
            button: 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20',
            icon: 'text-orange-400',
            border: 'border-orange-500/20'
        },
        info: {
            button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20',
            icon: 'text-indigo-400',
            border: 'border-indigo-500/20'
        }
    }

    const style = typeStyles[type] || typeStyles.danger

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-zinc-800 rounded-2xl border ${style.border} shadow-2xl max-w-md w-full`}>
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 ${style.icon}`}>
                            <AlertCircle size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">
                                {title}
                            </h3>
                            <p className="text-zinc-300 text-sm">
                                {message}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="border-t border-zinc-700 p-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                        className={`px-6 py-2 text-white rounded-lg font-medium transition-colors shadow-lg ${style.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
