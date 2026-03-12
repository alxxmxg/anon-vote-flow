import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppStep = "privacy" | "login" | "otp" | "ballot" | "success" | "arco";

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
  user: User | null;
  loading: boolean;
}

const VoteContext = createContext<VoteContextType | null>(null);

export function VoteProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<AppStep>("privacy");
  const [email, setEmail] = useState("");
  const [numeroControl, setNumeroControl] = useState("");
  const [folio, setFolio] = useState<string | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user && privacyAccepted) {
          setEmail(session.user.email ?? "");
          setNumeroControl(session.user.user_metadata?.numero_control ?? "");
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [privacyAccepted]);

  return (
    <VoteContext.Provider value={{
      step, setStep, email, setEmail, numeroControl, setNumeroControl,
      folio, setFolio, privacyAccepted, setPrivacyAccepted,
      user, loading,
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
