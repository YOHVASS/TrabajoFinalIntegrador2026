package unju.talleres.seguro;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import unju.talleres.common.exception.NegocioException;
import unju.talleres.common.util.Fechas;
import unju.talleres.habilitacion.service.HabilitacionService;
import unju.talleres.oferta.model.Periodo;
import unju.talleres.oferta.repository.PeriodoRepository;
import unju.talleres.oferta.service.PeriodoService;
import unju.talleres.participantes.model.Participante;
import unju.talleres.participantes.service.ParticipanteService;
import unju.talleres.seguro.dto.SeguroRequest;
import unju.talleres.seguro.model.Seguro;
import unju.talleres.seguro.repository.SeguroRepository;
import unju.talleres.seguro.service.SeguroService;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Pruebas de RN-02 / RF-06: un solo seguro por participante y período. */
@ExtendWith(MockitoExtension.class)
class SeguroServiceTest {

    @Mock private SeguroRepository seguros;
    @Mock private PeriodoRepository periodos;
    @Mock private PeriodoService periodoService;
    @Mock private ParticipanteService participanteService;
    @Mock private HabilitacionService habilitacionService;
    @Mock private Fechas fechas;

    private SeguroService service;
    private Participante participante;
    private Periodo periodo;

    @BeforeEach
    void setUp() {
        service = new SeguroService(seguros, periodos, periodoService, participanteService,
                habilitacionService, fechas);

        participante = new Participante();
        participante.setId(1L);
        participante.setDni("40000001");
        participante.setNombre("María");
        participante.setApellido("Quispe");

        periodo = new Periodo();
        periodo.setId(1L);
        periodo.setCodigo("ACTUAL");
        periodo.setFechaInicio(LocalDate.of(2026, 9, 10));
        periodo.setFechaFin(LocalDate.of(2027, 3, 9));
    }

    private SeguroRequest request() {
        return new SeguroRequest(1L, "POL-1", LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 1), LocalDate.of(2027, 10, 1));
    }

    @Test
    void rechazaSegundoSeguroEnElMismoPeriodo() {
        when(participanteService.buscar(1L)).thenReturn(participante);
        when(periodoService.buscar(1L)).thenReturn(periodo);
        when(seguros.existsByParticipanteIdAndPeriodoId(1L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> service.registrar(1L, request()))
                .isInstanceOf(NegocioException.class)
                .hasMessageContaining("ya tiene registrado el seguro del período ACTUAL");

        verify(seguros, never()).save(any(Seguro.class));
        verify(habilitacionService, never()).recalcular(any(Participante.class));
    }

    @Test
    void registraSeguroCuandoElPeriodoEstaLibre() {
        when(participanteService.buscar(1L)).thenReturn(participante);
        when(periodoService.buscar(1L)).thenReturn(periodo);
        when(seguros.existsByParticipanteIdAndPeriodoId(1L, 1L)).thenReturn(false);
        when(seguros.save(any(Seguro.class))).thenAnswer(inv -> {
            Seguro s = inv.getArgument(0);
            s.setId(10L);
            return s;
        });
        when(fechas.hoy()).thenReturn(LocalDate.of(2026, 11, 10));

        var resp = service.registrar(1L, request());

        assertThat(resp.id()).isEqualTo(10L);
        assertThat(resp.idPeriodo()).isEqualTo(1L);
        assertThat(resp.numeroPoliza()).isEqualTo("POL-1");
        verify(habilitacionService).recalcular(participante);
    }

    @Test
    void noEliminaSeguroYaInformadoALaProductora() {
        Seguro s = new Seguro();
        s.setId(3L);
        s.setInformadoProductora(true);
        s.setParticipante(participante);
        when(seguros.findById(3L)).thenReturn(java.util.Optional.of(s));

        assertThatThrownBy(() -> service.eliminar(3L))
                .isInstanceOf(NegocioException.class)
                .hasMessageContaining("informado a la productora");

        verify(seguros, never()).delete(any(Seguro.class));
    }
}
