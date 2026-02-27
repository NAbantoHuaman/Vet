# 🐾 VetCare App - Gestión Clínica Veterinaria

Aplicación web desarrollada en **Angular 17+** utilizando **TypeScript** y principios de arquitectura limpia. Diseñada para digitalizar los procesos de atención de clínicas veterinarias, permitiendo agendar citas, gestionar mascotas y visualizar historiales clínicos.

---

## 🚀 Características Principales

- **Arquitectura Modular**: Código distribuido en dominios `Core`, `Shared` y `Features` aplicando inyección de dependencias.
- **Enrutamiento Perfilado (Guards)**: Diferenciación profunda entre vistas de Administrador (Clínica) y Clientes (Dueños), protegidas por Guardias de Ruta (AuthGuard).
- **Componentes Reutilizables**: Máxima separación lógica entre "Smart Components" (manejo de estado) y "Dumb Components" puramente presentacionales vía `@Input` y `@Output`.
- **POO y Fuerte Tipado**: Interfaces estrictas para Modelos (`User`, `Pet`, `Appointment`) y servicios fuertemente acoplados a genéricos.
- **UI Dinámica e Intuitiva**: Uso de _Pipes_ y _Directivas_ personalizadas, validaciones reactivas (`ReactiveForms`) y flujos sin fricción (Notificaciones Toast).

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

1. **Requisitos previos:**
   Asegúrate de tener instalado [Node.js](https://nodejs.org/) (recomendado v18 o superior) y el [Angular CLI](https://angular.io/cli).

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

\`\`\`bash
ng serve
\`\`\`

Navega a \`http://localhost:4200/\` en tu navegador.
La aplicación se recargará automáticamente si realizas cambios en los archivos fuente.

---

## 🧪 Instrucciones de Prueba (Testing Flow)

La aplicación implementa un sistema en memoria con datos simulados (Mock Data). No requieres base de datos externa.

**Prueba 1: Rol de Administrador (Veterinarios)**

- **Email**: `admin@vet.com`
- **Contraseña**: `admin123`
- **Flujo**: Ingresa, visualiza la tabla técnica de citas, marca citas programadas como "Completadas", explora el historial clínico cruzado de todas las mascotas, y verifica visualmente cómo no puedes solapar temporalmente 2 citas.

**Prueba 2: Rol de Cliente (Dueño de mascotas)**

- **Email**: `juan@mail.com`
- **Contraseña**: `cliente123`
- **Flujo**: Entra al portal como cliente, registra una nueva mascota seleccionando "Añadir mi mascota", luego ve a "Mis citas", agéndale una cita de vacunación para el día de mañana y aprecia el _Toast_ de confirmación. En el Historial Clínico, notarás que solo puedes recuperar vistas de tus propias mascotas.

---

_Proyecto desarrollado para la Escuela de Tecnología._
