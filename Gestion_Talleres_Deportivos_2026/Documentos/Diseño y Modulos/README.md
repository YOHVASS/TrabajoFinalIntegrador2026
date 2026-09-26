# 2 - Diseño y Módulos

Contenido de la **segunda entrega** del Trabajo Final Integrador: diseño y documentación previa al desarrollo. Esta versión ya incorpora las correcciones obligatorias de la devolución.

## Archivos

- `Segunda_Entrega_UNJu_Talleres_Deportivos.docx` — **archivo fuente editable** (versión corregida). Cada apartado modificado está marcado con **[CORREGIDO]** junto al título.
- `Segunda_Entrega_UNJu_Talleres_Deportivos.pdf` — exportación en PDF del documento anterior, para lectura.
- `Correcciones_Segunda_Entrega.docx` — changelog: detalla, corrección por corrección, qué se cambió y por qué, para que la cátedra pueda verificar rápido cada punto de la devolución.

El código Mermaid del modelo entidad-relación vive en [`Database/der.mmd`](../../Database/der.mmd) (con el diccionario de datos y las decisiones de diseño), y el del diagrama de flujo en [`flujo.mmd`](../flujo.mmd), en la carpeta `Documentos`.

## Estado de las correcciones

Todas las correcciones obligatorias (A a F, puntos 1–24) están aplicadas: módulo Habilitación y RF-19 agregados, RNF-01/RNF-09 cuantificados, RN-13 (lista de espera), diagramas de casos de uso y de flujo corregidos y con las relaciones «include»/«extend» que faltaban, modelo de datos con TipoDocumento, HorarioTaller, qr_code, id_preinscripcion y restricciones de integridad, y trazabilidad completa para los 19 RF.

Pendiente (sugerencias no obligatorias, puntos 25–30): compactar el ancho de las Figuras 1a/1b para que ocupen mejor la página, y evaluar la entidad `Periodo` a futuro.
