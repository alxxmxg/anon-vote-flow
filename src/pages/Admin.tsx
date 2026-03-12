import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminPanel from "@/components/AdminPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"login" | "otp" | "panel">("login");
  const [error, setError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (session?.user) {
          const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .eq("role", "admin")
            .maybeSingle();
          
          if (data) {
            setIsAdmin(true);
            setStep("panel");
          } else {
            setError("No tienes permisos de administrador.");
            await supabase.auth.signOut();
          }
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        if (data) {
          setIsAdmin(true);
          setStep("panel");
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingOtp(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
      setSendingOtp(false);
      return;
    }
    setSendingOtp(false);
    setStep("otp");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    if (error) {
      setError("Código inválido o expirado.");
      return;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Verificando acceso...</p>
      </div>
    );
  }

  if (isAdmin && step === "panel") return <AdminPanel />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8 bg-background">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-foreground mb-2">Panel Admin</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">Acceso restringido a administradores</p>

        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="admin@universidad.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl"
            />
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <Button type="submit" disabled={sendingOtp} className="w-full h-12 rounded-xl">
              {sendingOtp ? "Enviando..." : "Enviar código OTP"}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              type="text"
              placeholder="Código OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="h-12 rounded-xl text-center text-xl tracking-widest"
            />
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <Button type="submit" className="w-full h-12 rounded-xl">Verificar</Button>
          </form>
        )}
      </div>
    </div>
  );
}
