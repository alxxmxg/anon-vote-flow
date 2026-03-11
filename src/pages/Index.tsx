import { VoteProvider, useVote } from "@/context/VoteContext";
import AvisoPrivacidad from "@/components/AvisoPrivacidad";
import LoginForm from "@/components/LoginForm";
import OTPForm from "@/components/OTPForm";
import BoletaVotacion from "@/components/BoletaVotacion";
import PantallaExito from "@/components/PantallaExito";
import ArcoModule from "@/components/ArcoModule";

function ConsultaFlow() {
  const { step } = useVote();

  switch (step) {
    case "privacy":
      return <AvisoPrivacidad />;
    case "login":
      return <LoginForm />;
    case "otp":
      return <OTPForm />;
    case "ballot":
      return <BoletaVotacion />;
    case "success":
      return <PantallaExito />;
    case "arco":
      return <ArcoModule />;
    default:
      return <AvisoPrivacidad />;
  }
}

const Index = () => (
  <VoteProvider>
    <ConsultaFlow />
  </VoteProvider>
);

export default Index;
