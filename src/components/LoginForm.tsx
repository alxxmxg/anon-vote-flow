import { useState } from "react";
import { useVote } from "@/context/VoteContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Mail, Hash } from "lucide-react";
import { generateOtp, setSession } from "@/lib/mockDB";

export default function LoginForm() {
  const { setStep, setEmail, setNumeroControl } = useVote();
  const [localEmail, setLocalEmail] = useState("");
  const [localControl, setLocalControl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (e: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!localEmail.trim() || !localControl.trim()) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (!isValidEmail(localEmail)) {
      setError("Introduce un correo institucional válido.");
      return;
    }
    if (localControl.length < 5) {
      setError("Número de control inválido.");
      return;
    }

    setLoading(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));

    // Generate OTP (shown in browser console for demo)
    const code = generateOtp(localEmail);
    setSession({ email: localEmail, numeroControl: localControl });
    setEmail(localEmail);
    setNumeroControl(localControl);
    setLoading(false);

    // Show code in a visible alert during demo
    alert(`[MODO DEMO] Tu código OTP es:\n\n  ${code}\n\n(En producción se enviaría por email)`);

    setStep("otp");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8 bg-background">
      <div className="w-full max-w-md">
        {/* Demo banner */}
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex gap-2 items-start">
          <span className="text-yellow-500 text-lg leading-none mt-0.5">⚠️</span>
          <p className="text-xs text-yellow-800 leading-relaxed">
            <strong>Modo Demo.</strong> Los datos se guardan localmente en tu navegador. El código OTP aparecerá en un aviso en pantalla.
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-foreground mb-2">
          Identifícate
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Ingresa tus datos institucionales para recibir tu código de verificación.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Correo institucional
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu.nombre@universidad.edu"
                value={localEmail}
                onChange={(e) => setLocalEmail(e.target.value)}
                className="pl-10 h-12 rounded-xl"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="control" className="text-sm font-medium text-foreground">
              Número de control
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="control"
                type="text"
                placeholder="20210001"
                value={localControl}
                onChange={(e) => setLocalControl(e.target.value)}
                className="pl-10 h-12 rounded-xl"
                maxLength={15}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base font-semibold rounded-xl"
          >
            {loading ? "Generando código..." : "Solicitar Código OTP"}
          </Button>
        </form>

        <button
          onClick={() => setStep("arco")}
          className="w-full mt-6 text-xs text-muted-foreground hover:text-primary transition-colors text-center"
        >
          Privacidad y Derechos ARCO →
        </button>
      </div>
    </div>
  );
}
