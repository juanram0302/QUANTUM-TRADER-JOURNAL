# QUANTUM TRADER — SMC PRO

> *The world moves. We read the structure.*

Sistema profesional de trading basado en **BOS/CHoCH + Fibonacci Invertido + Smart Money Concepts**, con journal interactivo, monitor de posiciones y panel de administración de estudiantes.

---

## Estructura del proyecto

```
quantum-trader/
├── index.html          # Landing page + registro de usuario
├── login.html          # Login de usuarios
├── app.html            # Journal & monitor principal (requiere sesión)
├── admin.html          # Panel de administración (solo admin)
├── logo.svg            # Logo oficial Quantum Trader
├── auth.js             # Lógica de autenticación (localStorage)
├── db.js               # Base de datos simulada (usuarios/trades)
├── README.md
└── .gitignore
```

---

## Características

- **Registro con aprobación manual** — el admin aprueba cada usuario
- **Journal de trades** con checklist pre-entrada del plan
- **Monitor de posición** — gráfico bloqueado hasta 65% del TP
- **Notificaciones EA** — estados de BE, trailing, L3, L4
- **Panel admin** — gestión completa de usuarios
- **Preparado para escalar** — estructura lista para pagos y módulos educativos

---

## Deploy en GitHub Pages

1. Sube el repositorio a GitHub
2. Ve a **Settings → Pages → Source: main / root**
3. Tu app estará en `https://tuusuario.github.io/quantum-trader`

---

## Credenciales por defecto

- **Admin:** `admin@quantumtrader.pro` / `quantum2025`
- Cambia estas credenciales en `auth.js` antes de publicar

---

## Roadmap futuro

- [ ] Sistema de pagos / suscripción mensual
- [ ] Módulos de educación con lecciones del plan
- [ ] Progreso del estudiante visible para el admin
- [ ] Estadísticas globales de todos los usuarios
- [ ] Notificaciones por email (requiere backend)

---

*Quantum Trader © 2025 — Plan de Trading BOS/CHoCH v2.0*
