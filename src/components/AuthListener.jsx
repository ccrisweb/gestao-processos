import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthListener() {
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // Logic for password reset flow
            if (event === "PASSWORD_RECOVERY") {
                console.log("Password recovery event detected");
                navigate("/reset-password");
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [navigate]);

    return null; // This component doesn't render anything
}
