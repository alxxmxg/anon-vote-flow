import { HelpCircle } from "lucide-react";
import { startTutorial, TutorialStep } from "@/lib/tutorialConfig";

export default function TutorialButton({ currentStep }: { currentStep?: string }) {
  const handleOpenTutorial = () => {
    let tutorialStep: TutorialStep | null = null;
    
    const path = window.location.pathname;
    
    if (path === "/admin") tutorialStep = "admin";
    else if (path === "/verificar") tutorialStep = "verificar";
    else if (path === "/resultados") tutorialStep = "resultados";
    else if (currentStep) {
      tutorialStep = currentStep as TutorialStep;
    }

    if (tutorialStep) {
      startTutorial(tutorialStep, true);
    }
  };

  return (
    <button
      onClick={handleOpenTutorial}
      className="fixed bottom-6 right-6 z-[60] w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label="Abrir tutorial"
    >
      <HelpCircle className="w-6 h-6" />
    </button>
  );
}
