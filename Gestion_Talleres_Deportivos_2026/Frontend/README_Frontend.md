# Frontend — Sistema Web de Gestión de Talleres Deportivos (UNJu)

Frontend desarrollado en **React + TypeScript**, consume la API del Backend (Spring Boot)
mediante JWT.

## Organización por módulos

```
src/
├── modules/
│   ├── auth/            # Login y gestión de sesión
│   ├── participantes/   # ABM de participantes
│   ├── documentacion/   # Carga de documentación
│   ├── seguro/          # Registro de pagos del seguro
│   ├── aptomedico/      # Registro y control de aptos médicos
│   ├── oferta/          # Disciplinas, talleres, horarios, profesores, ayudantes
│   ├── preinscripcion/  # Formulario público de preinscripción
│   ├── ingreso/         # Pantalla de control de ingreso (QR/DNI)
│   ├── alertas/         # Panel de alertas
│   ├── portal/          # Landing pública, oferta, noticias
│   └── reportes/        # Indicadores y reportes
├── components/          # Componentes reutilizables (UI)
└── services/            # Clientes HTTP hacia el backend
```

## Despliegue

Frontend desplegado en Vercel.
