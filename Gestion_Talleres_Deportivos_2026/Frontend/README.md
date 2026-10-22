# Frontend — Sistema Web de Gestión de Talleres Deportivos (UNJu)

Frontend a desarrollar en **React + TypeScript**. Consumirá la API del Backend (Spring Boot) mediante JWT.

El código de este módulo todavía no está implementado. La estructura de abajo es la organización prevista.

## Organización por módulos

```
src/
├── modules/
│   ├── auth/            # Login y gestión de sesión
│   ├── participantes/   # ABM de participantes
│   ├── documentacion/   # Carga de documentación
│   ├── seguro/          # Registro de pagos del seguro e informe a la productora
│   ├── aptomedico/      # Registro y control de aptos médicos
│   ├── oferta/          # Disciplinas, talleres, horarios, períodos, profesores, ayudantes
│   ├── preinscripcion/  # Formulario público de preinscripción
│   ├── ingreso/         # Pantalla de control de ingreso (QR/DNI)
│   ├── alertas/         # Panel de alertas
│   ├── portal/          # Landing pública, oferta, noticias
│   └── reportes/        # Indicadores y reportes
├── components/          # Componentes reutilizables (UI)
└── services/            # Clientes HTTP hacia el backend
```

## Despliegue previsto

El frontend tiene previsto su despliegue en Vercel. Todavía no hay ningún componente desplegado.
