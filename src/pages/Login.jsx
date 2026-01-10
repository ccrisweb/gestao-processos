import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, LayoutDashboard } from "lucide-react";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const createTimeoutPromise = () =>
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(new Error("Tempo limite excedido. Verifique sua conexão.")),
          30000
        )
      );

    try {
      if (isLogin) {
        const result = await Promise.race([
          signIn({ email, password }),
          createTimeoutPromise(),
        ]);

        const { error } = result || {};
        if (error) throw new Error(error.message || "Erro ao fazer login");

        toast.success("Login realizado com sucesso!");
        navigate("/");
      } else {
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
          setIsLogin(true);
        }
      }
    } catch (err) {
      const errorMsg = err?.message || "Falha na autenticação.";
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
        Seu navegador não suporta vídeos HTML5.
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Content */}
      <div className="max-w-md w-full space-y-8 glass p-8 rounded-xl shadow-2xl border border-zinc-700 relative z-20">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center mb-6">
            <img
              src="./Antigravity.png"
              alt="Logo Antigravity"
              className="h-24 w-auto drop-shadow-lg transform hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {isLogin ? "Gestão de Denúncias" : "Criar Nova Conta"}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            {isLogin
              ? "Entre com suas credenciais"
              : "Preencha os dados para se registrar"}
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
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
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
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar Conta"}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="underline text-sm text-zinc-400"
              >
                {isLogin ? "Criar conta" : "Voltar ao login"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
