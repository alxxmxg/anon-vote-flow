# 🗳️ Anon Vote Flow - Sistema de Votación Universitaria

Sistema de votación digital diseñado para el **Instituto Tecnológico de Mexicali (ITM)**. Esta plataforma permite realizar procesos electoral de manera segura, anónima y eficiente, integrando autenticación institucional y resultados en tiempo real.

[![Vercel Deployment](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://votoitm.vercel.app)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

---

## Características Principales (11 Core Features)

El sistema ha sido diseñado bajo principios de ingeniería de software para garantizar escalabilidad y seguridad:

1.  **Autenticación Híbrida OTP:** Flujo de validación mediante códigos numéricos de 6 dígitos enviados al correo.
2.  **Validación de Dominio Institucional:** Filtro estricto que solo permite votos de correos `@itmexicali.edu.mx`.
3.  **Prevención de Voto Duplicado:** Lógica de backend que verifica el estado del elector antes de procesar el sufragio.
4.  **Arquitectura de Anonimato:** Separación de la identidad del usuario y el voto mediante tablas desacopladas.
5.  **Dashboard Administrativo:** Panel privado para la gestión de la elección con métricas avanzadas.
6.  **Gráficas en Tiempo Real:** Visualización dinámica de tendencias de votación mediante componentes reactivos.
7.  **Manejo de Estados Robusto:** Control preciso del ciclo de vida del voto (Validación -> Emisión -> Éxito).
8.  **Diseño Responsivo (Mobile First):** Interfaz optimizada para votar desde cualquier dispositivo móvil en el campus.
9.  **Persistencia de Sesión Segura:** Integración de Supabase Auth con LocalStorage para mantener la sesión activa.
10. **Protección de Rutas (Guards):** Middleware de seguridad que bloquea accesos no autorizados al panel `/admin`.
11. **Configuración de Rewrites:** Optimización en Vercel para manejo de rutas SPA y evitar errores 404.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React.js + Vite
* **Lenguaje:** TypeScript
* **Estilos:** Tailwind CSS (Lucide React para iconos)
* **Backend & DB:** Supabase (PostgreSQL + Auth Service)
* **Despliegue:** Vercel

---

## 📦 Instalación Local

Si deseas clonar y ejecutar este proyecto en tu entorno local:

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/alxxmxg/anon-vote-flow.git](https://github.com/alxxmxg/anon-vote-flow.git)
    cd anon-vote-flow
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz y agrega tus llaves de Supabase:
    ```env
    VITE_SUPABASE_URL=tu_url_aqui
    VITE_SUPABASE_ANON_KEY=tu_key_aqui
    ```

4.  **Correr en desarrollo:**
    ```bash
    npm run dev
    ```

---

## 🔐 Seguridad
El proyecto utiliza **Row Level Security (RLS)** en Supabase para asegurar que los datos solo sean accesibles por los servicios autorizados, protegiendo la integridad de cada voto registrado.

## 👤 Autor
* **Julio Alejandro Magaña Nuñez** - *Ingeniería en Sistemas Computacionales* - **ITM**

---
© 2026 - Instituto Tecnológico de Mexicali.