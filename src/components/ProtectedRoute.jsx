
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ allowedRoles }) => {
    const { user, role, loading } = useAuth()

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Carregando...</div>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Optionally redirect to unauthorized page or dashboard
        return <Navigate to="/" replace />
    }

    return <Outlet />
}
