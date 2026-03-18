import { type AppStep } from "@/context/VoteContext";

const STEPS: { key: AppStep; label: string }[] = [
  { key: "privacy", label: "Privacidad" },
  { key: "login",   label: "Identificación" },
  { key: "otp",     label: "Verificación" },
  { key: "ballot",  label: "Votación" },
  { key: "success", label: "¡Listo!" },
];

const STEP_INDEX: Partial<Record<AppStep, number>> = {
  privacy: 0, login: 1, otp: 2, ballot: 3, success: 4,
};

export default function StepIndicator({ step }: { step: AppStep }) {
  if (step === "arco") return null; // Don't show on ARCO module

  const current = STEP_INDEX[step] ?? 0;

  return (
    <div className="w-full px-5 pt-4 pb-2">
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const done    = i < current;
          const active  = i === current;
          const isLast  = i === STEPS.length - 1;

          return (
            <div key={s.key} className="flex items-center flex-1">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    done   ? "bg-accent text-accent-foreground" :
                    active ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                             "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span className={`text-[9px] mt-0.5 font-medium whitespace-nowrap transition-colors ${
                  active ? "text-primary" : done ? "text-accent" : "text-muted-foreground"
                }`}>
                  {s.label}
                </span>
              </div>
              {/* Connector line */}
              {!isLast && (
                <div className={`flex-1 h-0.5 mb-3 mx-1 transition-colors duration-300 ${
                  done ? "bg-accent" : "bg-border"
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
