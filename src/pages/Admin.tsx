import { useState } from "react";
import AdminPanel from "@/components/AdminPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock } from "lucide-react";

// Demo admin password — change this to whatever you want
const ADMIN_PASSWORD = "admin2024";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
    } else {
      setError("Contraseña incorrecta. (Demo: admin2024)");
    }
  };

  if (isAdmin) return <AdminPanel />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8 bg-background">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-foreground mb-2">Panel Admin</h1>
        <p className="text-sm text-muted-foreground text-center mb-2">Acceso restringido a administradores</p>

        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex gap-2 items-start">
          <span className="text-yellow-500 text-lg leading-none mt-0.5">⚠️</span>
          <p className="text-xs text-yellow-800 leading-relaxed">
            <strong>Modo Demo.</strong> Contraseña: <code className="font-mono bg-yellow-100 px-1 rounded">admin2024</code>
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Contraseña de administrador"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 rounded-xl"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
          <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold">
            Ingresar al Panel
          </Button>
        </form>

        <a href="/" className="block mt-6 text-xs text-muted-foreground hover:text-primary transition-colors text-center">
          ← Volver al sistema de votación
        </a>
      </div>
    </div>
  );
}
