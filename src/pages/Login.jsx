import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, CheckSquare, Square, ArrowLeft, UserPlus, LogIn } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Modes: 'login', 'signup', 'forgot'
  const [mode, setMode] = useState('login');

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Load saved email
  useEffect(() => {
    const savedEmail = localStorage.getItem("antigravity_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!email) {
      setError("Digite seu email para recuperar a senha.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password", // Ensure this route exists or redirect to home handles it
      });

      if (error) throw error;

      setMessage("Email de recuperação enviado! Verifique sua caixa de entrada.");
      toast.success("Email enviado com sucesso!");
    } catch (err) {
      setError(err.message || "Erro ao enviar email de recuperação.");
      toast.error("Erro ao enviar email.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    // Save or clear remember me
    if (rememberMe && email) {
      localStorage.setItem("antigravity_email", email);
    } else {
      localStorage.removeItem("antigravity_email");
    }

    const createTimeoutPromise = () =>
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(new Error("Tempo limite excedido. Verifique sua conexão.")),
          30000
        )
      );

    try {
      if (mode === 'login') {
        const result = await Promise.race([
          signIn({ email, password }),
          createTimeoutPromise(),
        ]);

        const { error } = result || {};
        if (error) throw new Error(error.message || "Erro ao fazer login");

        toast.success("Login realizado com sucesso!");
        navigate("/");
      } else if (mode === 'signup') {
        const result = await Promise.race([
          signUp({ email, password }),
          createTimeoutPromise(),
        ]);

        const { error, data } = result || {};
        if (error) throw new Error(error.message || "Erro ao criar conta");

        if (data?.session) {
          toast.success("Conta criada com sucesso!");
          navigate("/");
        } else {
          const msg = "Conta criada! Verifique seu email ou faça login.";
          setMessage(msg);
          toast.info(msg);
          setMode('login');
        }
      }
    } catch (err) {
      let errorMsg = err?.message || "Falha na autenticação.";

      // Translate common errors
      if (errorMsg.includes("Invalid login credentials")) {
        errorMsg = "Email ou senha incorretos.";
      } else if (errorMsg.includes("Email not confirmed")) {
        errorMsg = "Email não confirmado. Verifique sua caixa de entrada.";
      } else if (errorMsg.includes("User not found")) {
        errorMsg = "Usuário não encontrado.";
      }

      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 min-w-full min-h-full object-cover z-0"
      >
        <source
          src="https://cdn.pixabay.com/video/2022/11/26/140578-775389242_large.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Content */}
      <div className="max-w-md w-full space-y-8 glass p-8 rounded-xl shadow-2xl border border-zinc-700 relative z-20 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center mb-6">
            <img
              src="./Antigravity.png"
              alt="Logo Antigravity"
              className="h-24 w-auto drop-shadow-lg transform hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {mode === 'login' && "Bem-vindo de volta"}
            {mode === 'signup' && "Criar Nova Conta"}
            {mode === 'forgot' && "Recuperar Senha"}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            {mode === 'login' && "Entre com suas credenciais para continuar"}
            {mode === 'signup' && "Preencha os dados abaixo para se registrar"}
            {mode === 'forgot' && "Digite seu email para receber o link de reset"}
          </p>
        </div>



        <form className="mt-8 space-y-6" onSubmit={mode === 'forgot' ? handleForgotPassword : handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-3 text-sm text-center animate-shake">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 rounded-lg p-3 text-sm text-center animate-fade-in">
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-xl relative block w-full pl-10 px-4 py-3 border border-zinc-600 placeholder-zinc-500 text-white bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm transition-all"
                  placeholder="Seu endereço de email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label htmlFor="password" className="sr-only">Senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none rounded-xl relative block w-full pl-10 px-4 py-3 border border-zinc-600 placeholder-zinc-500 text-white bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm transition-all"
                    placeholder="Sua senha secreta"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            {mode === 'login' && (
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  {rememberMe ? <CheckSquare size={18} className="text-indigo-500" /> : <Square size={18} />}
                  Lembre-se de mim
                </button>
              </div>
            )}

            {mode === 'login' && (
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando...
                </span>
              ) : (
                mode === 'login' ? "Entrar na Plataforma" : (mode === 'signup' ? "Criar Conta Grátis" : "Enviar Link de Recuperação")
              )}
            </button>
          </div>

          <div className="text-center mt-4">
            {mode === 'login' && (
              <p className="text-sm text-zinc-400">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Cadastre-se
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p className="text-sm text-zinc-400">
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Entrar
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-sm text-zinc-400 hover:text-white flex items-center justify-center gap-2 mx-auto transition-colors"
              >
                <ArrowLeft size={16} /> Voltar para o Login
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
