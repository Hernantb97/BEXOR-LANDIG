"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordClient() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let token = searchParams.get("access_token");
    if (!token && typeof window !== "undefined") {
      const hash = window.location.hash;
      const match = hash.match(/access_token=([^&]+)/);
      if (match) token = match[1];
    }
    setAccessToken(token || "");
  }, [searchParams]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      if (!accessToken) {
        setMessage("Token de recuperación inválido o faltante.");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("¡Contraseña actualizada! Ahora puedes iniciar sesión.");
        setTimeout(() => router.push("/dashboard/login"), 2000);
      }
    } catch (err: any) {
      setMessage("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow-lg animate-fadeIn">
        <h1 className="text-2xl font-bold text-center">Restablecer contraseña</h1>
        <form onSubmit={handleReset} className="space-y-4">
          <Input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
            className="h-11"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Actualizar contraseña"}
          </Button>
        </form>
        {message && <div className="text-center text-sm text-gray-700 mt-2">{message}</div>}
      </div>
    </div>
  );
} 