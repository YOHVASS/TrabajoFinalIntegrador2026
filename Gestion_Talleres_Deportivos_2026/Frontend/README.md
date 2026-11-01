
# UNJu Deportes – Frontend

Sistema web para la gestión de talleres deportivos de la Universidad Nacional de Jujuy (UNJu).

El frontend permite consultar la oferta deportiva y gestionar las distintas operaciones del sistema mediante una interfaz web, con acceso diferenciado según el rol del usuario.

## Tecnologías utilizadas

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
- Visualización de talleres y disciplinas.
- Acceso a información de las actividades deportivas.
- Inicio del proceso de preinscripción.

### Sistema interno de gestión

- **Panel principal:** visualización de indicadores y accesos rápidos.
- **Participantes:** gestión del padrón de participantes.
- **Preinscripciones:** consulta y gestión de solicitudes de inscripción.
- **Oferta deportiva:** consulta y gestión de talleres y disciplinas.
- **Documentación:** consulta y gestión de documentación de participantes.
- **Seguros y aptos:** seguimiento de seguros y aptos médicos.
- **Control de ingreso:** identificación de participantes y registro de asistencia.
- **Participantes por taller:** consulta de participantes inscriptos en los talleres asignados al profesor.
- **Reportes:** consulta de información e indicadores para la gestión.

## Roles y permisos

El acceso a los módulos se encuentra organizado según el rol del usuario.

| Rol | Acceso principal |
|---|---|
| ADMINISTRATIVO | Panel principal, Participantes, Preinscripciones, Oferta deportiva, Documentación, Seguros y aptos y Reportes. |
| COORDINADOR | Panel principal, Participantes, Preinscripciones, Oferta deportiva, Documentación, Seguros y aptos y Reportes. |
| PROFESOR | Panel principal, Oferta deportiva y Participantes por taller. |
| AYUDANTE | Panel principal y Oferta deportiva. |
| RESPONSABLE_INGRESO | Panel principal, Oferta deportiva y Control de ingreso. |
| AUTORIDAD_INSTITUCIONAL | Panel principal, Oferta deportiva y Reportes. |
| ADMIN_SISTEMA | Panel principal y Oferta deportiva. |

## Requisitos previos

Para ejecutar el proyecto se necesita:

- Node.js
- npm
- Backend del sistema en funcionamiento.

## Instalación

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
```

Ingresar a la carpeta del frontend:

```bash
cd Frontend
```

Instalar las dependencias:

```bash
npm install
```

## Ejecución en desarrollo

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir la aplicación en el navegador.

## Compilación para producción

Generar la versión de producción:

```bash
npm run build
```

Este comando ejecuta primero la verificación y compilación de TypeScript y luego genera la versión optimizada con Vite.

## Análisis de código

Ejecutar ESLint para revisar el código:

```bash
npm run lint
```

## Vista previa de producción

Para visualizar localmente la compilación generada:

```bash
npm run preview
```

## Dependencias principales

| Dependencia | Uso |
|---|---|
| react y react-dom | Construcción de la interfaz de usuario. |
| react-router-dom | Navegación entre páginas y rutas. |
| lucide-react | Iconos de la interfaz. |
| html5-qrcode | Lectura de códigos QR mediante cámara. |
| qrcode.react | Generación de códigos QR. |
| vite | Servidor de desarrollo y compilación. |
| typescript | Tipado estático del proyecto. |
| eslint | Análisis y revisión del código. |

## Comunicación con el backend

El frontend consume los servicios REST del backend desarrollado con Java y Spring Boot.

La autenticación utiliza JWT. Luego de iniciar sesión correctamente, el token se almacena en el navegador y se utiliza para las solicitudes protegidas.

La dirección de la API debe configurarse de acuerdo con el entorno de ejecución del proyecto.

## Despliegue

La planificación tecnológica contempla el despliegue del frontend en Vercel y del backend en Render.

La configuración definitiva depende de las variables de entorno y de las direcciones de los servicios correspondientes.

## Proyecto académico

**Universidad Nacional de Jujuy**

Tecnicatura Universitaria en Programación

**Proyecto:** Sistema Web para la Gestión de los Talleres Deportivos de la UNJu.

**Año:** 2026
