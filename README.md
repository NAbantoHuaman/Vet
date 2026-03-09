# 🐾 VetCare App - Gestión Clínica Veterinaria

Aplicación web desarrollada en **Angular 17+** utilizando **TypeScript** y principios de arquitectura limpia. Diseñada para digitalizar los procesos de atención de clínicas veterinarias, permitiendo agendar citas, gestionar mascotas y visualizar historiales clínicos.

---

## 🚀 Características Principales

- **Interfaz UI Premium**: Diseño moderno con temática oscura (Dark Mode), acentos de neón y efectos de _glassmorphism_, ofreciendo una experiencia inmersiva y responsiva.
- **Seguimiento de Salud**: Historia clínica detallada con gráficas de salud claras y una línea de tiempo para el control de vacunaciones.
- **Soporte PWA**: Configuración de Progressive Web App (PWA) para ofrecer una experiencia instalable y eficiente.
- **Arquitectura Optimizada y Modular**: Diseño modular con separación por dominios (`Core`, `Shared` y `Features`), reutilización de módulos y organización lógica de servicios siguiendo buenas prácticas avanzadas en Angular.
- **Enrutamiento Perfilado (Guards)**: Diferenciación profunda entre vistas de Administrador (Clínica) y Clientes (Dueños), protegidas por Guardias de Ruta (AuthGuard).
- **Componentes Totalmente Parametrizables**: Componentes reutilizables en múltiples contextos, con lógica desacoplada siguiendo principios de diseño limpio (separación abstracta entre "Smart" y "Dumb Components" vía `@Input` y `@Output`).
- **POO y Tipos de Datos Complejos**: Uso de abstracción, herencia, encapsulamiento e interfaces estrictas (ej. Modelos `User`, `Pet`) para lograr un código limpio, escalable y alineado con sólidas prácticas de Programación Orientada a Objetos.
- **UI Dinámica (Pipes y Directivas)**: Aplicación funcional de directivas y pipes personalizados, junto a componentes avanzados y personalizados (vía TailwindCSS, como alternativa moderna a Bootstrap) para optimizar la experiencia gráfica y de usuario.

---

## 🛠️ Tecnologías y Estructura

```text
src/app/
 ├── core/          # Lógica Singleton (Servicios REST mockeados, AuthGuard, Toasts)
 ├── shared/        # Modelos Interfaces, Pipes de Estados y Directivas de UI
 ├── features/      # Componentes de Vistas (Auth, Dashboard, Mascotas, Citas, Historial)
 ├── app.routes.ts  # Manejo estricto de rutas (Lazy Loading preparativo)
 └── app.component  # "Shell" de la aplicación (Navbar y Router Outlet)
```

---

## ⚙️ Instalación y Configuración

Sigue estos pasos para correr el proyecto en tu entorno local:

1. **Dependencias del Entorno (Requisitos previos):**
   - **Node.js**: v18.0.0 o superior.
   - **Angular CLI**: v17+ (o superior).
   - **Gestor de paquetes**: NPM (incluido con Node.js).
   - **Estilos**: TailwindCSS integrado para componentes avanzados de UI.

2. **Clonar el proyecto y navegar al directorio:**
   \`\`\`bash
   git clone <tu-repositorio-url>
   cd vet-app
   \`\`\`

3. **Instalar dependencias:**
   \`\`\`bash
   npm install
   \`\`\`

---

## 🏃 Ejecución Local

Para levantar el servidor de desarrollo, ejecuta:

```bash
ng serve
```

Navega a `http://localhost:4200/` en tu navegador.
La aplicación se recargará automáticamente si realizas cambios en los archivos fuente.

### ⚙️ Ejecución de Pruebas Unitarias

Para correr los tests automatizados configurados con Vitest (brindando evidencias de un código limpio, testable y estructurado), ejecuta:

```bash
npm run test
```

---

## 🧪 Evidencias Detalladas de Pruebas y Uso (Testing Flow)

La aplicación implementa un sistema en memoria con datos simulados (Mock Data) para asegurar procesos limpios sin depender de bases de datos externas. Se consideraron las siguientes pruebas exhaustivas:

**Prueba Validada 1: Rol de Administrador (Veterinarios)**

- **Credenciales**: `admin@vet.com` / `admin123`
- **Evidencia del Flujo**: El sistema autentica e inicializa el dashboard. Se verificó con éxito la tabla de citas (cambio de estados a "Completadas"), el acceso al historial clínico encapsulado de todas las mascotas, y la lógica de negocio que previene el solapamiento temporal de 2 citas (manejo de errores integrado).

**Prueba Validada 2: Rol de Cliente (Dueño de mascotas)**

- **Credenciales**: `juan@mail.com` / `cliente123`
- **Evidencia del Flujo**: Se comprobó la seguridad limitando las vistas estrictamente a las mascotas del cliente. Se probó con éxito el registro de una mascota, la correcta visualización de parámetros y el agendamiento de nuevas citas, validando que la interfaz reacciona fluidamente a través de _Toasts_ informativos tras las inserciones.

---
