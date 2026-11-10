# UNJu Deportes – Frontend

Aplicación web para la gestión de talleres deportivos de la Universidad Nacional de Jujuy (UNJu).

Permite consultar la oferta deportiva en el portal público y operar el sistema interno con acceso diferenciado por rol.

## Despliegue

| Recurso | URL |
| --- | --- |
| Producción | https://trabajo-final-integrador2026-4g8q.vercel.app |
| Alias | https://trabajo-final-integrador2026.vercel.app |
| Acceso interno | `/admin` |
| Backend que consume | https://unju-deportes-backend.onrender.com |

En Vercel el **Root Directory** del proyecto debe ser `Gestion_Talleres_Deportivos_2026/Frontend`. El build es `npm run build` y la salida `dist`. El archivo `vercel.json` reescribe las rutas SPA hacia `index.html`.

## Tecnologías

- React 19
- TypeScript 6
- Vite 8
- React Router 7
- Lucide React
- HTML5 QR Code
- QRCode React
- CSS

## Funcionalidades

### Portal público

- Consulta de la oferta deportiva.
- Preinscripción online.
- Consulta del estado de una preinscripción.

### Sistema interno

- **Panel principal:** indicadores y accesos rápidos.
- **Participantes:** padrón de participantes.
- **Preinscripciones:** revisión de solicitudes.
- **Oferta deportiva:** talleres, disciplinas y períodos.
- **Documentación:** documentación de participantes.
- **Seguros y aptos:** seguimiento de seguro y apto médico.
- **Control de ingreso:** identificación y asistencia.
- **Participantes por taller:** vista del profesor.
- **Reportes:** indicadores de gestión.
- **Usuarios:** altas y roles (`ADMIN_SISTEMA`).
- **Mi perfil:** cambio de contraseña propia.

## Roles y permisos

| Rol | Acceso principal |
|---|---|
| ADMINISTRATIVO | Panel, Participantes, Preinscripciones, Oferta deportiva, Documentación, Seguros y aptos y Reportes. |
| COORDINADOR | Panel, Participantes, Preinscripciones, Oferta deportiva, Documentación, Seguros y aptos y Reportes. |
| PROFESOR | Panel, Oferta deportiva y Participantes por taller. |
| AYUDANTE | Panel y Oferta deportiva. |
| RESPONSABLE_INGRESO | Panel, Oferta deportiva y Control de ingreso. |
| AUTORIDAD_INSTITUCIONAL | Panel, Oferta deportiva y Reportes. |
| ADMIN_SISTEMA | Panel, Oferta deportiva y Usuarios. |

## Requisitos

- Node.js y npm
- Backend en ejecución (local o Render)

## Instalación y ejecución

```bash
git clone https://github.com/YOHVASS/TrabajoFinalIntegrador2026.git
cd TrabajoFinalIntegrador2026/Gestion_Talleres_Deportivos_2026/Frontend
npm install
npm run dev
```

Abrir `http://localhost:5173` o `http://localhost:5173/admin`.

### Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción (`tsc -b` + Vite) |
| `npm run preview` | Vista previa del build |
| `npm run lint` | ESLint |

## Variables de entorno

Plantilla: `.env.example`.

```bash
VITE_API_URL=http://localhost:8080
```

En producción (Vercel):

```bash
VITE_API_URL=https://unju-deportes-backend.onrender.com
```

Sin `/api` y sin barra final. El cliente agrega `/api` en `src/services/api.ts`. La variable se incorpora en tiempo de build: después de cambiarla hay que redesplegar.

## Comunicación con el backend

Autenticación JWT. Tras el login, el token se guarda en el navegador y se envía en las solicitudes protegidas.

## Limitaciones

- El panel principal usa datos de la API de reportes y de talleres según el rol.
- La campana de alertas del header no está totalmente conectada a la API.
- Si el backend en Render está dormido, las pantallas pueden quedar en “cargando” hasta que responda.

## Proyecto académico

**Universidad Nacional de Jujuy** — Tecnicatura Universitaria en Programación

**Proyecto:** Sistema Web para la Gestión de los Talleres Deportivos de la UNJu

**Grupo 182 · Año 2026**
