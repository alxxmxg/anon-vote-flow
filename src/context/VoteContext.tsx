import { createContext, useContext, useState, ReactNode } from "react";
import { getSession, clearSession } from "@/lib/mockDB";

export type AppStep = "intro" | "privacy" | "login" | "otp" | "ballot" | "success" | "arco";

interface VoteContextType {
  step: AppStep;
  setStep: (step: AppStep) => void;
  email: string;
  setEmail: (email: string) => void;
  numeroControl: string;
  setNumeroControl: (n: string) => void;
  folio: string | null;
  setFolio: (f: string) => void;
  privacyAccepted: boolean;
  setPrivacyAccepted: (v: boolean) => void;
  signOut: () => void;
}

const VoteContext = createContext<VoteContextType | null>(null);

export function VoteProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<AppStep>("intro");
  const [email, setEmail] = useState("");
  const [numeroControl, setNumeroControl] = useState("");
  const [folio, setFolio] = useState<string | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const signOut = () => {
    clearSession();
    setEmail("");
    setNumeroControl("");
    setFolio(null);
    setPrivacyAccepted(false);
    setStep("intro");
  };

  return (
    <VoteContext.Provider value={{
      step, setStep, email, setEmail, numeroControl, setNumeroControl,
      folio, setFolio, privacyAccepted, setPrivacyAccepted, signOut,
    }}>
      {children}
    </VoteContext.Provider>
  );
}

export function useVote() {
  const ctx = useContext(VoteContext);
  if (!ctx) throw new Error("useVote must be used within VoteProvider");
  return ctx;
}
