import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthListener() {
    const navigate = useNavigate();

    useEffect(() => {
        // Aggressive check for HashRouter: Supabase tokens use fragments.
        // If we land on a URL with recovery, force navigate to reset-password.
        const checkHash = () => {
            const hash = window.location.hash;
            if (hash.includes("type=recovery") || hash.includes("access_token=")) {
                console.log("Recovery token detected in hash, ensuring orientation to /reset-password");
                if (!window.location.hash.includes("/reset-password")) {
                    navigate("/reset-password");
                }
            }
        };

        checkHash();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth Event:", event);
            // Logic for password reset flow
            if (event === "PASSWORD_RECOVERY") {
                console.log("Password recovery event detected via listener");
                navigate("/reset-password");
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [navigate]);

    return null; // This component doesn't render anything
}
