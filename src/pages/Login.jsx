
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, LayoutDashboard } from 'lucide-react'

export default function Login() {
    const { signIn, signUp } = useAuth()
    const toast = useToast()
    const navigate = useNavigate()
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        // Timeout promise to prevent hanging - increased to 60s
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Tempo limite excedido. Verifique sua conexão ou configurações do Supabase.')), 60000)
        )

        try {
            console.log(isLogin ? 'Attempting Login...' : 'Attempting Sign Up...', { email })

            if (isLogin) {
                const { error } = await Promise.race([
                    signIn({ email, password }),
                    timeoutPromise
                ])

                if (error) throw error
                console.log('Login successful')
                toast.success('Login realizado com sucesso!')
                navigate('/')
            } else {
                const { error, data } = await Promise.race([
                    signUp({ email, password }),
                    timeoutPromise
                ])

                if (error) throw error
                console.log('Sign Up successful', data)

                if (data.session) {
                    toast.success('Conta criada com sucesso!')
                    navigate('/')
                } else {
                    const msg = 'Conta criada! Verifique se seu email precisa de confirmação ou faça login.'
                    setMessage(msg)
                    toast.info(msg)
                    setIsLogin(true)
                }
            }
        } catch (err) {
            console.error("Auth Error:", err)
            const errorMsg = err.message || 'Falha na autenticação.'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-zinc-800 p-8 rounded-xl shadow-2xl border border-zinc-700">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-white">
                        {isLogin ? 'Gestão de Denúncias' : 'Criar Nova Conta'}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        {isLogin ? 'Entre com suas credenciais' : 'Preencha os dados para se registrar'}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded p-3 text-sm text-center">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="bg-green-500/10 border border-green-500 text-green-500 rounded p-3 text-sm text-center">
                            {message}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-zinc-500" />
                                </div>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-zinc-600 placeholder-zinc-500 text-white bg-zinc-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Senha</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-zinc-500" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-zinc-600 placeholder-zinc-500 text-white bg-zinc-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                    placeholder="Senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                        >
                            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin)
                                setError('')
                                setMessage('')
                            }}
                            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            {isLogin
                                ? 'Não tem uma conta? Crie uma agora'
                                : 'Já tem uma conta? Faça login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
