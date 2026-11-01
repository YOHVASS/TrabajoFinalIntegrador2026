package unju.talleres.preinscripcion.dto;

import unju.talleres.preinscripcion.model.EstadoPreinscripcion;

import java.time.OffsetDateTime;

/** Comprobante que ve el participante al enviar el formulario o consultar el estado. */
public record PreinscripcionPublicaResponse(
        Long idPreinscripcion,
        String taller,
        OffsetDateTime fechaSolicitud,
        EstadoPreinscripcion estado,
        Integer posicionListaEspera,
        String mensaje) {
}
