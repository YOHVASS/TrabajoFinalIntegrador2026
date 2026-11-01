# Guía de la API para el Frontend

Contrato de la API REST del backend (Spring Boot). La documentación interactiva, siempre actualizada, está en **Swagger UI**: `http://localhost:8080/swagger-ui.html` (botón *Authorize* para pegar el token).

- **URL base local:** `http://localhost:8080`
- **Formato:** JSON en UTF-8. Fechas `yyyy-MM-dd`, horas `HH:mm:ss` (también se acepta `HH:mm` al enviar), fecha-hora ISO-8601 con zona (`2026-10-29T16:36:00-03:00`).
- **Enums:** se envían y reciben como texto en MAYÚSCULAS (ver [Valores de enumeraciones](#valores-de-enumeraciones)).

## 1. Autenticación

```http
POST /api/auth/login
{ "nombreUsuario": "admin", "password": "Admin2026!" }
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tipo": "Bearer",
  "expiraEnSegundos": 28800,
  "usuario": { "id": 1, "nombreUsuario": "admin", "nombre": "Administrador", "apellido": "del Sistema", "rol": "ADMIN_SISTEMA", "estado": "ACTIVO" }
}
```

En cada request al sistema interno se envía el header `Authorization: Bearer <token>`. Con `GET /api/auth/me` se recupera el usuario al recargar la página. El rol (`usuario.rol`) sirve para armar el menú.

**Usuarios de prueba** (perfil `demo`, contraseña `Demo2026!`): `coordinador`, `administrativo`, `ingreso`, `profesor1`, `ayudante1`, `autoridad`. Además siempre existe `admin` / `Admin2026!`.

## 2. Errores

Todos los errores tienen el mismo formato:

```json
{
  "timestamp": "2026-10-29T16:40:00-03:00",
  "status": 400,
  "error": "Bad Request",
  "mensaje": "Hay datos inválidos en la solicitud",
  "path": "/api/public/preinscripciones",
  "errores": { "dni": "El DNI debe tener solo números (7 a 15 dígitos)", "email": "debe ser una dirección de correo electrónico con formato correcto" }
}
```

| Código | Cuándo |
| --- | --- |
| 400 | Validación de campos (`errores` trae el detalle por campo) o dato mal formado. |
| 401 | Sin token, token vencido o credenciales incorrectas → redirigir al login. |
| 403 | El rol no tiene permiso para esa operación. |
| 404 | Recurso inexistente. |
| 409 | Regla de negocio incumplida (por ejemplo: seguro ya registrado en el período, cupo menor a los inscriptos). Mostrar `mensaje` al usuario. |

## 3. Permisos por rol

| Área | Roles |
| --- | --- |
| Portal público `/api/public/**` | Sin login |
| Participantes, documentación, seguro, oferta (alta/modificación), preinscripciones, noticias, alertas | `ADMINISTRATIVO`, `COORDINADOR` |
| Apto médico (dato de salud) | `ADMINISTRATIVO`, `COORDINADOR` |
| Control de ingreso y asistencias | `RESPONSABLE_INGRESO`, `PROFESOR`*, `AYUDANTE`*, `ADMINISTRATIVO`, `COORDINADOR` |
| Inscriptos de un taller | `PROFESOR`*, `AYUDANTE`*, `ADMINISTRATIVO`, `COORDINADOR` |
| Reportes agregados | `ADMINISTRATIVO`, `COORDINADOR`, `AUTORIDAD_INSTITUCIONAL` |
| Reportes nominales (`/detalle`) | `ADMINISTRATIVO`, `COORDINADOR` |
| Usuarios y roles | `ADMIN_SISTEMA` |
| Consultar oferta interna (`GET` disciplinas, períodos, talleres) | Cualquier usuario autenticado |

\* Profesores y ayudantes solo sobre los talleres a su cargo.

## 4. Paginación

Los listados largos devuelven:

```json
{ "contenido": [ ... ], "pagina": 0, "tamanio": 20, "totalElementos": 57, "totalPaginas": 3 }
```

Parámetros: `?pagina=0&tamanio=20` (la primera página es 0).

## 5. Endpoints

### Portal público (sin token)

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/public/disciplinas` | Disciplinas. |
| GET | `/api/public/talleres?idDisciplina=&modalidad=` | Oferta vigente (RF-01) con horarios, profesor y `lugaresDisponibles`. |
| GET | `/api/public/talleres/{id}` | Detalle de un taller. |
| GET | `/api/public/noticias?tipo=&pagina=&tamanio=` | Noticias publicadas, paginadas (RF-15). |
| GET | `/api/public/noticias/{id}` | Una noticia. |
| POST | `/api/public/preinscripciones` | Preinscripción online (RF-02). |
| GET | `/api/public/preinscripciones/{id}?dni=` | Estado de la preinscripción (número + DNI). |

Preinscripción:

```http
POST /api/public/preinscripciones
{
  "idTaller": 1,
  "dni": "40123456",
  "nombre": "Ana",
  "apellido": "Pérez",
  "fechaNacimiento": "2003-05-14",
  "sexo": "FEMENINO",
  "facultad": "Ingeniería",
  "email": "ana@example.com",
  "telefono": "3885123456"
}
```

```json
{
  "idPreinscripcion": 7,
  "taller": "Vóley Femenino",
  "fechaSolicitud": "2026-10-29T16:45:12-03:00",
  "estado": "LISTA_ESPERA",
  "posicionListaEspera": 2,
  "mensaje": "El taller alcanzó su cupo. Quedaste en lista de espera y pasarás a revisión cuando se libere un lugar."
}
```

`estado` es `PENDIENTE` si hay cupo y `LISTA_ESPERA` si no (RN-13). Si el DNI ya existe, se usa el participante existente.

Taller (respuesta usada en portal y sistema interno):

```json
{
  "id": 1,
  "nombre": "Vóley Femenino",
  "modalidad": "FEMENINA",
  "cupoMaximo": 2,
  "lugaresDisponibles": 0,
  "inscriptosActivos": 2,
  "enListaEspera": 1,
  "disciplina": { "id": 1, "nombre": "Vóley" },
  "profesor": { "id": 1, "nombre": "Pablo Rodríguez" },
  "periodo": { "id": 1, "codigo": "2026-2C", "fechaInicio": "2026-08-01", "fechaFin": "2026-12-15" },
  "horarios": [ { "id": 1, "diaSemana": "LUNES", "horaInicio": "18:00:00", "horaFin": "20:00:00" } ],
  "ayudantes": [ { "id": 1, "nombre": "Ana Sosa" } ]
}
```

`cupoMaximo` y `lugaresDisponibles` en `null` significan "sin límite".

### Autenticación y usuarios

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/auth/login` | Login. |
| GET | `/api/auth/me` | Usuario autenticado. |
| GET | `/api/usuarios` | Lista de usuarios. |
| GET | `/api/usuarios/{id}` | Un usuario. |
| POST | `/api/usuarios` | `{ nombreUsuario, password, nombre, apellido, rol }` |
| PUT | `/api/usuarios/{id}` | `{ nombre, apellido, rol, estado }` (`estado`: `ACTIVO`/`INACTIVO`). |
| PUT | `/api/usuarios/{id}/password` | `{ passwordActual, passwordNueva }`. El ADMIN_SISTEMA puede omitir `passwordActual` para resetear la de otro. |
| GET | `/api/roles` | Los 7 roles. |

### Oferta deportiva (RF-13, RF-14)

| Método | Ruta | Cuerpo / parámetros |
| --- | --- | --- |
| GET/POST | `/api/disciplinas` | `{ nombre, descripcion }` |
| GET/PUT/DELETE | `/api/disciplinas/{id}` | |
| GET/POST | `/api/periodos` | `{ codigo: "2026-2C", fechaInicio, fechaFin }` |
| GET | `/api/periodos/vigente` | Período que incluye hoy (204 si no hay). |
| GET/PUT/DELETE | `/api/periodos/{id}` | |
| GET | `/api/talleres?idDisciplina=&idPeriodo=&modalidad=&idProfesor=` | |
| GET | `/api/talleres/mis-talleres` | Talleres del profesor/ayudante logueado. |
| POST | `/api/talleres` | Ver ejemplo abajo. |
| GET/PUT/DELETE | `/api/talleres/{id}` | PUT con el mismo cuerpo que POST. |
| PATCH | `/api/talleres/{id}/cupo` | `{ "cupoMaximo": 25 }`. Si se amplía, la lista de espera pasa a `PENDIENTE`. |
| GET/POST | `/api/profesores` | `{ dni, nombre, apellido, email, telefono, idUsuario }` (`idUsuario` opcional, debe tener rol PROFESOR). |
| GET/PUT/DELETE | `/api/profesores/{id}` | |
| GET/POST | `/api/ayudantes` | `{ dni, nombre, apellido, idUsuario }` (rol AYUDANTE). |
| GET/PUT/DELETE | `/api/ayudantes/{id}` | |

```json
{
  "idDisciplina": 1,
  "idProfesor": 1,
  "idPeriodo": 1,
  "nombre": "Vóley Femenino",
  "modalidad": "FEMENINA",
  "cupoMaximo": 25,
  "horarios": [ { "diaSemana": "LUNES", "horaInicio": "18:00", "horaFin": "20:00" } ],
  "idsAyudantes": [1]
}
```

`horarios` e `idsAyudantes` reemplazan los existentes en cada PUT.

### Participantes (RF-04)

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/participantes?q=&estado=&pagina=&tamanio=` | Búsqueda por DNI, nombre o apellido; filtro por `estado` de habilitación. Paginado. |
| GET | `/api/participantes/{id}` | Ficha completa. |
| POST | `/api/participantes` | Alta manual: `{ dni, nombre, apellido, fechaNacimiento, sexo, facultad, email, telefono, fotoUrl }` |
| PUT | `/api/participantes/{id}` | Mismo cuerpo. |
| POST | `/api/participantes/{id}/foto` | `multipart/form-data`, campo `foto`. |
| GET | `/api/participantes/{id}/credencial` | `{ qrCode, dni, nombre, apellido, fotoUrl, estadoHabilitacion }`. 409 si todavía no tiene inscripción aprobada. |
| GET | `/api/participantes/{id}/habilitacion` | Detalle de requisitos (RF-08). |
| GET | `/api/participantes/{id}/alertas` | Alertas del participante. |
| GET | `/api/participantes/{id}/preinscripciones` | Historial. |
| GET | `/api/participantes/{id}/inscripciones` | Historial. |

Detalle de habilitación:

```json
{
  "idParticipante": 2,
  "dni": "40000002",
  "nombre": "Lucía",
  "apellido": "Flores",
  "estadoHabilitacion": "NO_HABILITADO",
  "documentacionCompleta": true,
  "documentos": [ { "idTipoDocumento": 1, "nombre": "Constancia de alumno", "situacion": "CUMPLE", "fechaVencimiento": "2027-03-28" } ],
  "seguro": "CUMPLE",
  "seguroVigenciaHasta": "2027-09-29",
  "aptoMedico": "VENCIDO",
  "aptoMedicoVencimiento": "2026-09-24",
  "motivos": ["Apto médico vencido"]
}
```

### Documentación, seguro y apto médico (RF-05, RF-06, RF-07, RF-19)

Para adjuntar un archivo: primero `POST /api/archivos` (`multipart/form-data`, campo `archivo`, PDF/JPG/PNG/WEBP hasta 5 MB) → `{ "url": "/api/archivos/<uuid>.pdf" }`, y esa URL se envía como `archivoUrl`.

| Método | Ruta | Cuerpo |
| --- | --- | --- |
| GET/POST | `/api/tipos-documento` | `{ nombre, obligatorio, tieneVencimiento }` |
| PUT/DELETE | `/api/tipos-documento/{id}` | |
| GET/POST | `/api/participantes/{id}/documentos` | `{ idTipoDocumento, archivoUrl, fechaPresentacion, fechaVencimiento }` |
| PUT/DELETE | `/api/documentos/{id}` | |
| GET/POST | `/api/participantes/{id}/seguros` | `{ idPeriodo, numeroPoliza, fechaPago, vigenciaDesde, vigenciaHasta }`. Si se omite `idPeriodo` se usa el vigente; si se omiten las vigencias, es un año desde el pago. |
| PUT/DELETE | `/api/seguros/{id}` | |
| GET | `/api/seguros/altas-pendientes?idPeriodo=` | Altas sin informar a la productora. |
| GET | `/api/seguros/altas-pendientes/csv?idPeriodo=` | Descarga CSV (abre en Excel). |
| POST | `/api/seguros/informar-productora` | `{ "idsSeguros": [3, 4] }` o `{}` para marcar todas las pendientes. |
| GET/POST | `/api/participantes/{id}/aptos-medicos` | `{ fechaEmision, fechaVencimiento, archivoUrl }`. El vencimiento por defecto es emisión + 1 año y nunca puede superarlo. |
| PUT/DELETE | `/api/aptos-medicos/{id}` | |

Cada alta, modificación o baja de estos registros recalcula en el momento la habilitación y las alertas del participante.

### Preinscripciones e inscripciones (RF-03)

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/preinscripciones?estado=&idTaller=&idPeriodo=&pagina=&tamanio=` | Bandeja de revisión (más antiguas primero). |
| GET | `/api/preinscripciones/{id}` | Detalle. |
| POST | `/api/preinscripciones/{id}/aprobar` | Crea la inscripción y el QR. Devuelve `{ inscripcion, qrCode, requisitosPendientes: [...] }`. |
| POST | `/api/preinscripciones/{id}/rechazar` | Rechaza. Si estaba `PENDIENTE`, promueve la lista de espera. |
| GET | `/api/talleres/{id}/inscriptos?estado=ACTIVA` | Lista de inscriptos (datos mínimos). |
| POST | `/api/inscripciones/{id}/baja` | Baja: libera el lugar y promueve la lista de espera. |

Solo se aprueban preinscripciones `PENDIENTE`. Una en `LISTA_ESPERA` pasa a `PENDIENTE` sola cuando se libera un lugar o se amplía el cupo.

### Control de ingreso y asistencia (RF-10, RF-11, RF-12)

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/ingreso/talleres` | Talleres en curso para elegir en la pantalla de ingreso. |
| POST | `/api/ingreso` | Identifica, verifica y registra. |
| GET | `/api/asistencias?idTaller=&idParticipante=&resultado=&desde=&hasta=&pagina=&tamanio=` | Historial (por defecto últimos 30 días). Profesores, ayudantes y responsables de ingreso deben indicar `idTaller`. |

```http
POST /api/ingreso
{ "metodo": "QR", "valor": "b6a1f0c2-6a55-4d0e-9a4f-000000000001", "idTaller": 1 }
```

```json
{
  "resultado": "RECHAZADO",
  "motivos": ["Apto médico vencido"],
  "yaRegistradoHoy": false,
  "idAsistencia": 15,
  "participante": { "id": 2, "dni": "40000002", "nombre": "Lucía", "apellido": "Flores", "fotoUrl": null, "estadoHabilitacion": "NO_HABILITADO" },
  "idTaller": 1,
  "taller": "Vóley Femenino",
  "fecha": "2026-10-29",
  "hora": "18:05:12",
  "metodo": "QR"
}
```

Con `metodo: "DNI"`, `valor` es el número de documento. El rechazo también queda registrado en Asistencia. Si la persona ya ingresó habilitada hoy, `yaRegistradoHoy` es `true` y no se duplica.

### Alertas (RF-09)

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/alertas?estado=ACTIVA&tipo=&idParticipante=&pagina=&tamanio=` | Panel de alertas. |
| GET | `/api/alertas/contador` | `{ "activas": 12 }` para el badge del menú. |
| PATCH | `/api/alertas/{id}/resolver` | Marca como resuelta. |
| POST | `/api/habilitacion/recalcular` | Fuerza el recálculo general (también corre todos los días a las 00:05 y al iniciar). |

Las alertas se crean y se resuelven solas al cambiar los requisitos. Se generan para participantes con inscripción activa.

### Noticias (RF-15)

| Método | Ruta | Cuerpo |
| --- | --- | --- |
| GET | `/api/noticias?tipo=&pagina=&tamanio=` | Todas (incluidas las programadas a futuro). |
| POST | `/api/noticias` | `{ titulo, contenido, tipo, fechaPublicacion }` (`fechaPublicacion` opcional: si se omite, se publica en el momento). |
| PUT/DELETE | `/api/noticias/{id}` | |

### Reportes (RF-16)

Todos aceptan `?idPeriodo=` opcional.

| Ruta | Devuelve |
| --- | --- |
| `/api/reportes/resumen` | Indicadores del tablero: `participantesActivos`, `habilitados`, `noHabilitados`, `conRequisitosPendientes`, `inscripcionesActivas`, `preinscripcionesPendientes`, `enListaEspera`, `asistenciasUltimos30Dias`, `ingresosRechazadosUltimos30Dias`, `aptosPorVencer`, `alertasActivas`. |
| `/api/reportes/participantes-por-taller` | `[ { idTaller, taller, disciplina, modalidad, periodo, cupoMaximo, inscriptosActivos, pendientesRevision, enListaEspera } ]` |
| `/api/reportes/participantes-por-disciplina` | `[ { disciplina, participantes, inscripciones } ]` |
| `/api/reportes/participantes-por-facultad` | `[ { categoria, participantes } ]` |
| `/api/reportes/participantes-por-sexo` | `[ { categoria, participantes } ]` |
| `/api/reportes/evolucion-inscripciones?desde=&hasta=` | `[ { mes: "2026-09", preinscripciones, inscripciones } ]` |
| `/api/reportes/asistencia?desde=&hasta=` | `[ { idTaller, taller, habilitados, rechazados, participantesDistintos, diasConRegistro } ]` |
| `/api/reportes/aptos-por-vencer/detalle?dias=30` | Nominal: `[ { idParticipante, dni, nombre, apellido, fechaVencimiento } ]` |
| `/api/reportes/documentacion-pendiente/detalle` | Nominal: `[ { idParticipante, dni, nombre, apellido, estadoHabilitacion, pendientes } ]` |

### Archivos

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/archivos` | Sube un archivo (`multipart/form-data`, campo `archivo`). |
| GET | `/api/archivos/{nombre}` | Descarga. Requiere token. |

Como requiere token, un `<img src="/api/archivos/...">` no funciona directamente: hay que pedir el archivo con `fetch`/axios enviando el header y mostrarlo con `URL.createObjectURL(blob)`.

## 6. Valores de enumeraciones

```ts
type Rol = 'ADMINISTRATIVO' | 'COORDINADOR' | 'ADMIN_SISTEMA' | 'RESPONSABLE_INGRESO' | 'PROFESOR' | 'AYUDANTE' | 'AUTORIDAD_INSTITUCIONAL';
type Sexo = 'FEMENINO' | 'MASCULINO' | 'X';
type Modalidad = 'FEMENINA' | 'MASCULINA' | 'MIXTA';
type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';
type EstadoHabilitacion = 'HABILITADO' | 'NO_HABILITADO' | 'PENDIENTE';
type EstadoPreinscripcion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'LISTA_ESPERA';
type EstadoInscripcion = 'ACTIVA' | 'BAJA';
type EstadoDocumentacion = 'VIGENTE' | 'VENCIDO' | 'PENDIENTE';
type EstadoSeguro = 'VIGENTE' | 'VENCIDO';
type EstadoAptoMedico = 'VIGENTE' | 'VENCIDO';
type MetodoVerificacion = 'QR' | 'DNI';
type ResultadoHabilitacion = 'HABILITADO' | 'RECHAZADO';
type TipoAlerta = 'DOCUMENTACION_VENCIDA' | 'DOCUMENTACION_PENDIENTE' | 'APTO_MEDICO_POR_VENCER' | 'SEGURO_VENCIDO' | 'SEGURO_PROXIMO_A_VENCER';
type EstadoAlerta = 'ACTIVA' | 'RESUELTA';
type TipoNoticia = 'NOTICIA' | 'NOVEDAD' | 'AVISO';
type Situacion = 'CUMPLE' | 'FALTA' | 'VENCIDO'; // detalle de habilitación
type EstadoUsuario = 'ACTIVO' | 'INACTIVO';
```

## 7. Ejemplo de cliente (axios)

```ts
// src/services/api.ts
import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
```

Para mostrar el QR de la credencial se puede usar una librería como `qrcode.react` con el valor `qrCode`. Para leerlo con la cámara en el control de ingreso, una librería de escaneo (por ejemplo `html5-qrcode`) y enviar el texto leído a `POST /api/ingreso` con `metodo: "QR"`.
