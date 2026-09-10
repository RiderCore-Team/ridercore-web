# Co-piloto Web 🚀

Panel de control, telemetría y gestión de escuadrones con Next.js 16, Tailwind CSS y Firebase (Authentication + Cloud Firestore).

---

## 🛠️ Requisitos Previos e Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd copiloto-web
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar las Variables de Entorno:**
   Copia el archivo `.env.example` y renómbralo a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Rellena `.env.local` con las credenciales de tu proyecto de Firebase:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="tu-proyecto"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="tu-proyecto.firebasestorage.app"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
   NEXT_PUBLIC_FIREBASE_APP_ID="1:..."
   ```

---

## ⚡ Ejecutar en Desarrollo

Inicia el servidor local:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔒 Reglas de Seguridad de Firestore

El proyecto está diseñado para funcionar con la siguiente regla en Cloud Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

La aplicación incluye una pantalla de autenticación con:
- **Correo y Contraseña** (Login / Registro)
- **Inicio con Google**
- **Acceso Rápido de Prueba (Anónimo)**
