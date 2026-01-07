import { useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const Toast = ({ toast }) => {
    const { removeToast } = useToast()

    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        warning: <AlertCircle size={20} />,
        info: <Info size={20} />
    }

    const styles = {
        success: 'bg-green-500/90 border-green-400 text-white',
        error: 'bg-red-500/90 border-red-400 text-white',
        warning: 'bg-orange-500/90 border-orange-400 text-white',
        info: 'bg-blue-500/90 border-blue-400 text-white'
    }

    return (
        <div
            className={`flex items-center gap-3 min-w-[300px] max-w-md p-4 rounded-xl border-2 shadow-2xl backdrop-blur-sm animate-slide-in ${styles[toast.type] || styles.info}`}
        >
            <div className="flex-shrink-0">
                {icons[toast.type] || icons.info}
            </div>
            <p className="flex-1 font-medium text-sm">{toast.message}</p>
            <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
                aria-label="Fechar"
            >
                <X size={18} />
            </button>
        </div>
    )
}

export const ToastContainer = () => {
    const { toasts } = useToast()

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast toast={toast} />
                </div>
            ))}
        </div>
    )
}

export default Toast
