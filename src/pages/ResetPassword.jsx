import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, Save } from "lucide-react";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem!");
            return;
        }

        if (password.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            toast.success("Senha atualizada com sucesso!");
            navigate("/");
        } catch (error) {
            console.error("Error updating password:", error);
            toast.error("Erro ao atualizar senha: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900 px-4">
            <div className="max-w-md w-full space-y-8 glass p-8 rounded-xl shadow-2xl border border-zinc-700">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center mb-6 h-12 w-12 rounded-full bg-indigo-900/50 border border-indigo-500/30">
                        <Lock className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        Redefinir Senha
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        Digite sua nova senha abaixo.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleUpdatePassword}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="new-password" className="sr-only">
                                Nova Senha
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    id="new-password"
                                    name="new-password"
                                    type="password"
                                    required
                                    className="appearance-none rounded-xl relative block w-full pl-10 px-4 py-3 border border-zinc-600 placeholder-zinc-500 text-white bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm transition-all"
                                    placeholder="Nova senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirm-password" className="sr-only">
                                Confirmar Senha
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type="password"
                                    required
                                    className="appearance-none rounded-xl relative block w-full pl-10 px-4 py-3 border border-zinc-600 placeholder-zinc-500 text-white bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm transition-all"
                                    placeholder="Confirme a nova senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="flex-1 flex justify-center py-3 px-4 border border-zinc-600 text-sm font-medium rounded-xl text-zinc-300 hover:bg-zinc-800 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 group relative flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                            disabled={loading}
                        >
                            {loading ? "Salvando..." : "Salvar Senha"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
