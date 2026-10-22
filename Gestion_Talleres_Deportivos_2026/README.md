# Sistema Web para la Gestión de los Talleres Deportivos - UNJu

Trabajo Final Integrador de la **Tecnicatura Universitaria en Programación a Distancia**. El proyecto propone un sistema web para centralizar y mejorar la gestión de los talleres deportivos de la Universidad Nacional de Jujuy.

## Descripción de la problemática

Actualmente, la Coordinación de Talleres Deportivos trabaja con un proceso fragmentado y predominantemente manual que combina planillas de Excel, Google Drive, documentación física y redes sociales. Esto genera:

- Demoras en la búsqueda y carga de datos de los participantes.
- Dificultades para verificar requisitos como el seguro anual, el apto médico y la constancia de alumno.
- Inscripciones que requieren gestiones presenciales.
- Falta de una herramienta integrada para controlar el ingreso, registrar asistencias y consultar indicadores de gestión.

La solución propuesta contempla un proceso que va desde la consulta de la oferta y la preinscripción online hasta la revisión administrativa, el control de requisitos, el registro de asistencia y la elaboración de reportes.

## Equipo

**Tutora:** Sofía Raia

**Grupo 182:**

- Diana Falla
- Natalia Gutiérrez
- Yohanna Díaz Monroy

## Estado del proyecto

**Segunda entrega: diseño cerrado. El desarrollo todavía no comenzó.**

En esta etapa quedaron definidos los requisitos, las reglas de negocio, los módulos, los diagramas y el diseño de la base de datos. El frontend y el backend todavía no están implementados. El despliegue en Render y Vercel es el despliegue previsto para la etapa de entrega final; todavía no hay ningún componente desplegado.

## Tecnologías seleccionadas

| Componente | Tecnología | Despliegue previsto |
| --- | --- | --- |
| Frontend | React + TypeScript | Vercel |
| Backend | Java + Spring Boot (API REST) | Render |
| Base de datos | PostgreSQL | Render PostgreSQL, con Supabase como alternativa |
| Autenticación | JWT y autorización basada en roles | Integrada en el backend |

## Segunda entrega: documentación realizada

Esta entrega reúne las definiciones necesarias antes de comenzar a codificar:

- **Requisitos:** 19 requisitos funcionales y 9 requisitos no funcionales.
- **Reglas de negocio:** 13 reglas que establecen condiciones de inscripción, habilitación, lista de espera, control de ingreso y acceso a la información.
- **Módulos:** responsabilidades definidas para organizar el desarrollo del sistema, incluido el módulo Habilitación.
- **Diagramas:** casos de uso, flujo del proceso integrado y modelo entidad-relación.
- **Base de datos:** motor seleccionado, entidades (incluida Periodo), diccionario de datos, relaciones, cardinalidades, restricciones y criterios de normalización.
- **Trazabilidad:** relación entre los 19 requisitos funcionales, las reglas de negocio y las entidades del modelo de datos.

El documento de diseño está en `Documentos/2-Diseno-y-Modulos/`.

### Módulos a desarrollar

| Módulo | Responsabilidad principal |
| --- | --- |
| Autenticación y usuarios | Gestionar el acceso interno, los roles y los permisos. |
| Participantes | Registrar datos personales y fotografía. |
| Documentación | Registrar y controlar la documentación requerida. |
| Seguro | Registrar el pago, la vigencia del seguro anual y el informe de altas a la productora. |
| Apto médico | Registrar el apto médico y controlar su vencimiento. |
| Habilitación | Determinar y mantener el estado de habilitación a partir de la documentación, el seguro y el apto médico. |
| Oferta deportiva | Administrar disciplinas, talleres, horarios, modalidades, períodos, profesores y ayudantes. |
| Preinscripciones e inscripciones | Recibir solicitudes online, incluida la lista de espera, y permitir su revisión administrativa. |
| Control de ingreso y asistencia | Identificar por QR o DNI, verificar la habilitación y registrar asistencias. |
| Alertas | Avisar sobre requisitos pendientes o vencidos. |
| Portal público y noticias | Mostrar la oferta deportiva, noticias y avisos. |
| Reportes e indicadores | Presentar información agregada para la gestión. |

Estos módulos representan la organización **prevista** para el desarrollo en el repositorio.

### Reglas de negocio principales

- El seguro anual y la constancia de alumno son requisitos para participar según las condiciones definidas en el proyecto.
- El seguro se abona una vez por período y puede cubrir la participación en más de una disciplina mientras esté vigente.
- El apto médico tiene una vigencia de un año.
- Un participante se considera habilitado cuando tiene completa la documentación requerida, el seguro vigente y el apto médico vigente.
- Antes de registrar una asistencia, el sistema debe verificar el estado de habilitación.
- La identificación en el control de ingreso puede realizarse mediante código QR o número de documento.
- Cuando un taller alcanza su cupo máximo, las nuevas preinscripciones quedan en lista de espera.
- El acceso a los datos personales y de salud se restringe según el rol del usuario. Las autoridades institucionales consultan información agregada.

## Diseño de la base de datos

Se seleccionó **PostgreSQL** porque el sistema contiene entidades relacionadas que requieren integridad referencial y transaccional.

El modelo incluye la gestión de:

- Participantes y sus requisitos: documentación, seguros, aptos médicos y alertas.
- Oferta deportiva: disciplinas, talleres, horarios, períodos, profesores y ayudantes.
- Participación: preinscripciones, inscripciones y asistencias.
- Administración del sistema: roles, usuarios internos y noticias.

El diseño se plantea en tercera forma normal. Como excepción documentada, el estado de habilitación del participante, y los estados de documentación, seguro y apto médico, se almacenan como datos derivados para agilizar el control de ingreso. Durante la implementación deberán mantenerse actualizados cuando cambie la documentación, el seguro o el apto médico.

El código del modelo está en `Database/der.mmd` y el diccionario completo en la sección 6.2 del documento de la segunda entrega.

## Documentación

| Carpeta | Contenido |
| --- | --- |
| `Documentos/1-Definicion-del-Problema/` | Propuesta de la 1.ª entrega. |
| `Documentos/2-Diseno-y-Modulos/` | Documento de diseño de la 2.ª entrega, su PDF y el changelog de correcciones. |
| `Database/` | Código e imagen del modelo entidad-relación. |
| `Backend/` | Organización prevista del API en Java y Spring Boot. |
| `Frontend/` | Organización prevista de la aplicación en React y TypeScript. |

## Próxima etapa

A partir de la tercera etapa se prevé implementar el backend con **Java y Spring Boot**, la base de datos en **PostgreSQL** y el frontend con **React y TypeScript**.

Las instrucciones de instalación, configuración y ejecución se agregarán a este README cuando el repositorio cuente con una versión ejecutable del sistema.
