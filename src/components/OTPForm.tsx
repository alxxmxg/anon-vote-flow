import { useState, useRef, useEffect } from "react";
import { useVote } from "@/context/VoteContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound } from "lucide-react";
import { verifyOtp, generateOtp } from "@/lib/mockDB";

export default function OTPForm() {
  const { email, numeroControl, setStep } = useVote();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed.length < 6) {
      setError("Introduce el código completo que recibiste por correo.");
      return;
    }
    setLoading(true);
    setError("");

    const result = await verifyOtp(email, numeroControl ?? "", trimmed);
    if (!result.success) {
      setError(result.error ?? "Código inválido. Intenta nuevamente.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("ballot");
  };

  const handleResend = async () => {
    setResendTimer(60);
    const result = await generateOtp(email, numeroControl ?? "");
    if (!result.success) {
      setError("Fallo al reenviar código");
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8 bg-background">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-foreground mb-2">
          Verificación OTP
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-2">
          Ingresa el código que enviamos a{" "}
          <span className="font-medium text-foreground">{maskedEmail}</span>
        </p>
        <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-center mb-8">
          Revisa tu bandeja de entrada (y spam). El código puede tener entre 6 y 10 dígitos.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Input
              id="tour-otp-input"
              ref={inputRef}
              type="text"
              inputMode="numeric"
              placeholder="Pega tu código aquí"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="h-16 text-center text-2xl font-mono font-bold tracking-[0.3em] rounded-xl border-2 border-primary/30 focus:border-primary"
              maxLength={10}
              autoComplete="one-time-code"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-4 text-center">
              {error}
            </p>
          )}

          <Button
            id="tour-otp-btn"
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base font-semibold rounded-xl mb-4"
          >
            {loading ? "Verificando..." : "Verificar Código"}
          </Button>

          <button
            type="button"
            disabled={resendTimer > 0}
            onClick={handleResend}
            className="w-full text-sm text-muted-foreground hover:text-primary disabled:opacity-50 transition-colors text-center"
          >
            {resendTimer > 0
              ? `Reenviar código en ${resendTimer}s`
              : "Reenviar código"}
          </button>
        </form>
      </div>
    </div>
  );
}
