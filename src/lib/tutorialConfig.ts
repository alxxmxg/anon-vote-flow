import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export type TutorialStep = "intro" | "privacy" | "login" | "otp" | "ballot" | "verificar" | "admin" | "resultados";

export const tutorialSteps: Record<TutorialStep, any[]> = {
  intro: [
    { element: '#tour-intro-box', popover: { title: 'Bienvenido', description: 'Este es el sistema oficial de consulta institucional. Tus datos son 100% seguros.', side: "bottom", align: 'start' }},
    { element: '#tour-intro-btn', popover: { title: 'Comenzar', description: 'Haz clic aquí para iniciar el proceso de participación.', side: "top", align: 'end' }}
  ],
  privacy: [
    { element: '#tour-privacy-content', popover: { title: 'Tus Derechos ARCO', description: 'Lee atentamente nuestra política de privacidad. Garantizamos tu anonimato.', side: "bottom", align: 'start' }},
    { element: '#tour-privacy-btn', popover: { title: 'Aceptar', description: 'Si estás de acuerdo, acepta para continuar a la identificación.', side: "top", align: 'end' }}
  ],
  login: [
    { element: '#tour-login-email', popover: { title: 'Correo Institucional', description: 'Ingresa tu correo oficial con terminación @itmexicali.edu.mx', side: "top", align: 'start' }},
    { element: '#tour-login-control', popover: { title: 'Número de Control', description: 'Escribe tu número de control o matrícula.', side: "top", align: 'start' }},
    { element: '#tour-login-btn', popover: { title: 'Solicitar Código', description: 'Haz clic para recibir un código PIN temporal en tu correo.', side: "bottom", align: 'center' }}
  ],
  otp: [
    { element: '#tour-otp-input', popover: { title: 'Código de Verificación', description: 'Ingresa el código que acabas de recibir en tu correo. Revisa en bandeja de SPAM si no lo ves.', side: "top", align: 'start' }},
    { element: '#tour-otp-btn', popover: { title: 'Verificar', description: 'Verifica tu código para acceder a la boleta.', side: "bottom", align: 'center' }}
  ],
  ballot: [
    { element: '#tour-boleta-list', popover: { title: 'Problemáticas', description: 'Selecciona una o más problemáticas. Puedes añadir notas opcionales.', side: "top", align: 'start' }},
    { element: '#tour-boleta-btn', popover: { title: 'Emitir Voto', description: 'Una vez seleccionado, envía tu voto anónimamente.', side: "top", align: 'center' }}
  ],
  verificar: [
    { element: '#tour-verificar-input', popover: { title: 'Verificar Folio', description: 'Ingresa el código que recibiste al completar tu votación (Folio Criptográfico).', side: "bottom", align: 'start' }},
    { element: '#tour-verificar-btn', popover: { title: 'Buscar', description: 'Busca tu folio para confirmar que fue registrado correctamente.', side: "bottom", align: 'start' }}
  ],
  admin: [
    { element: '#tour-admin-input', popover: { title: 'Contraseña', description: 'Ingresa tu clave de administrador para acceder a panel de reportes de anomalías.', side: "bottom", align: 'start' }},
    { element: '#tour-admin-btn', popover: { title: 'Ingresar', description: 'Haz clic aquí para entrar.', side: "bottom", align: 'center' }}
  ],
  resultados: []
};

// Global reference to the current driver instance
let currentDriver: any = null;

export function startTutorial(stepName: TutorialStep, force = false) {
  if (!tutorialSteps[stepName] || tutorialSteps[stepName].length === 0) return;

  const storageKey = `tutorial_skipped_${stepName}`;
  const hasSkipped = localStorage.getItem(storageKey);

  // If already skipped and we are not forcing it via "?", do not show.
  if (hasSkipped === "true" && !force) return;

  if (currentDriver) {
    currentDriver.destroy();
  }

  currentDriver = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    doneBtnText: 'Entendido',
    closeBtnText: 'Cerrar',
    nextBtnText: 'Siguiente',
    prevBtnText: 'Atrás',
    steps: tutorialSteps[stepName],
  });

  // Mark as shown so it doesn't auto-popup again unless forced with "?"
  if (!force) {
    localStorage.setItem(storageKey, "true");
  }

  currentDriver.drive();
}
