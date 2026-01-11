import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useToast();

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const baseUrl = window.location.origin + window.location.pathname;
            const redirectUrl = baseUrl.endsWith('/') ? `${baseUrl}#/reset-password` : `${baseUrl}/#/reset-password`;

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });

            if (error) throw error;

            setSubmitted(true);
            toast.success("Link de recuperação enviado!");
        } catch (err) {
            console.error("Erro ao enviar email:", err);
            toast.error("Erro ao enviar email: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
            {/* Video Background (Keeping consistency) */}
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

            <div className="absolute inset-0 bg-black/60 z-10" />

            <div className="max-w-md w-full space-y-8 glass p-8 rounded-xl shadow-2xl border border-zinc-700 relative z-20 animate-fade-in">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center mb-6">
                        <img
                            src="./Antigravity.png"
                            alt="Logo Antigravity"
                            className="h-24 w-auto drop-shadow-lg"
                        />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        Esqueci minha senha
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        {submitted
                            ? "Confira seu email. Enviamos o link de redefinição de senha."
                            : "Digite seu email para receber o link de recuperação"}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
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
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? "Enviando..." : submitted ? "Tentar novamente" : "Enviar link de recuperação"}
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <Link
                            to="/login"
                            className="text-sm text-zinc-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
                        >
                            <ArrowLeft size={16} /> Voltar para o Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
