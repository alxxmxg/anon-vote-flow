import { useState, useRef, useEffect } from "react";
import { useVote } from "@/context/VoteContext";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";
import { verifyOtp, generateOtp } from "@/lib/mockDB";

const OTP_LENGTH = 6;

export default function OTPForm() {
  const { email, setStep } = useVote();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Paste support: distribute 6 digits across inputs
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setError("Introduce el código completo de 6 dígitos.");
      return;
    }
    setLoading(true);
    setError("");

    await new Promise((r) => setTimeout(r, 500));

    const valid = verifyOtp(email, code);
    if (!valid) {
      setError("Código inválido. Revisa el aviso que apareció en pantalla.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("ballot");
  };

  const handleResend = () => {
    setResendTimer(60);
    const code = generateOtp(email);
    alert(`[MODO DEMO] Tu nuevo código OTP es:\n\n  ${code}`);
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
          Ingresa el código de 6 dígitos mostrado para{" "}
          <span className="font-medium text-foreground">{maskedEmail}</span>
        </p>
        <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-center mb-8">
          El código apareció en un aviso de tu navegador. Si lo cerraste, usa "Reenviar".
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2.5 mb-6" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-semibold bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-4 text-center">
              {error}
            </p>
          )}

          <Button
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
