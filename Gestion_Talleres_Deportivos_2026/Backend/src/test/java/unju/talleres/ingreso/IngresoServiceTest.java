package unju.talleres.ingreso;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import unju.talleres.auth.model.RolNombre;
import unju.talleres.auth.model.UsuarioSistema;
import unju.talleres.auth.repository.UsuarioSistemaRepository;
import unju.talleres.common.exception.NoEncontradoException;
import unju.talleres.common.security.UsuarioActual;
import unju.talleres.common.security.UsuarioPrincipal;
import unju.talleres.common.util.Fechas;
import unju.talleres.habilitacion.service.EvaluadorHabilitacion.Evaluacion;
import unju.talleres.habilitacion.service.EvaluadorHabilitacion.Situacion;
import unju.talleres.habilitacion.service.HabilitacionService;
import unju.talleres.ingreso.dto.IngresoRequest;
import unju.talleres.ingreso.dto.IngresoResponse;
import unju.talleres.ingreso.model.Asistencia;
import unju.talleres.ingreso.model.MetodoVerificacion;
import unju.talleres.ingreso.model.ResultadoHabilitacion;
import unju.talleres.ingreso.repository.AsistenciaRepository;
import unju.talleres.ingreso.service.IngresoService;
import unju.talleres.oferta.model.Taller;
import unju.talleres.oferta.repository.TallerRepository;
import unju.talleres.oferta.service.TallerService;
import unju.talleres.participantes.model.EstadoHabilitacion;
import unju.talleres.participantes.model.Participante;
import unju.talleres.participantes.repository.ParticipanteRepository;
import unju.talleres.preinscripcion.model.EstadoInscripcion;
import unju.talleres.preinscripcion.repository.InscripcionRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Pruebas de RN-06 / RF-11: el ingreso verifica habilitación antes de registrar asistencia. */
@ExtendWith(MockitoExtension.class)
class IngresoServiceTest {

    @Mock private ParticipanteRepository participantes;
    @Mock private TallerRepository talleres;
    @Mock private TallerService tallerService;
    @Mock private InscripcionRepository inscripciones;
    @Mock private AsistenciaRepository asistencias;
    @Mock private UsuarioSistemaRepository usuarios;
    @Mock private HabilitacionService habilitacionService;
    @Mock private UsuarioActual usuarioActual;
    @Mock private Fechas fechas;

    private IngresoService service;
    private Taller taller;
    private Participante participante;

    @BeforeEach
    void setUp() {
        service = new IngresoService(participantes, talleres, tallerService, inscripciones, asistencias,
                usuarios, habilitacionService, usuarioActual, fechas);

        taller = new Taller();
        taller.setId(1L);
        taller.setNombre("Vóley Femenino");

        participante = new Participante();
        participante.setId(2L);
        participante.setDni("40000002");
        participante.setNombre("Lucía");
        participante.setApellido("Flores");

        lenient().when(usuarioActual.get()).thenReturn(
                new UsuarioPrincipal(9L, "ingreso", "x", RolNombre.RESPONSABLE_INGRESO, true));
        lenient().when(talleres.findById(1L)).thenReturn(Optional.of(taller));
        lenient().when(fechas.hoy()).thenReturn(LocalDate.of(2026, 11, 10));
        lenient().when(fechas.horaActual()).thenReturn(LocalTime.of(8, 30));
        lenient().when(usuarios.getReferenceById(9L)).thenReturn(new UsuarioSistema());
        lenient().when(asistencias.save(any(Asistencia.class))).thenAnswer(inv -> {
            Asistencia a = inv.getArgument(0);
            a.setId(100L);
            return a;
        });
    }

    private IngresoRequest dni() {
        return new IngresoRequest(MetodoVerificacion.DNI, "40000002", 1L);
    }

    @Test
    void rechazaIngresoSiElParticipanteNoEstaHabilitado() {
        participante.setEstadoHabilitacion(EstadoHabilitacion.NO_HABILITADO);
        when(participantes.findByDni("40000002")).thenReturn(Optional.of(participante));
        when(asistencias.findFirstByParticipanteIdAndTallerIdAndFechaAndResultadoHabilitacion(
                2L, 1L, LocalDate.of(2026, 11, 10), ResultadoHabilitacion.HABILITADO))
                .thenReturn(Optional.empty());
        when(habilitacionService.recalcular(participante)).thenReturn(new Evaluacion(
                EstadoHabilitacion.NO_HABILITADO,
                List.of(),
                Situacion.CUMPLE,
                null,
                null,
                Situacion.VENCIDO,
                null,
                null,
                List.of("Apto médico vencido")));
        when(inscripciones.existsByParticipanteIdAndTallerIdAndEstado(
                2L, 1L, EstadoInscripcion.ACTIVA)).thenReturn(true);

        IngresoResponse resp = service.registrarIngreso(dni());

        assertThat(resp.resultado()).isEqualTo(ResultadoHabilitacion.RECHAZADO);
        assertThat(resp.motivos()).contains("Apto médico vencido");
        assertThat(resp.yaRegistradoHoy()).isFalse();

        ArgumentCaptor<Asistencia> captor = ArgumentCaptor.forClass(Asistencia.class);
        verify(asistencias).save(captor.capture());
        assertThat(captor.getValue().getResultadoHabilitacion()).isEqualTo(ResultadoHabilitacion.RECHAZADO);
    }

    @Test
    void habilitaIngresoSiCumpleRequisitosYTieneInscripcionActiva() {
        participante.setEstadoHabilitacion(EstadoHabilitacion.HABILITADO);
        when(participantes.findByDni("40000002")).thenReturn(Optional.of(participante));
        when(asistencias.findFirstByParticipanteIdAndTallerIdAndFechaAndResultadoHabilitacion(
                2L, 1L, LocalDate.of(2026, 11, 10), ResultadoHabilitacion.HABILITADO))
                .thenReturn(Optional.empty());
        when(inscripciones.existsByParticipanteIdAndTallerIdAndEstado(
                2L, 1L, EstadoInscripcion.ACTIVA)).thenReturn(true);

        IngresoResponse resp = service.registrarIngreso(dni());

        assertThat(resp.resultado()).isEqualTo(ResultadoHabilitacion.HABILITADO);
        assertThat(resp.motivos()).isEmpty();
        verify(habilitacionService, never()).recalcular(any(Participante.class));
        ArgumentCaptor<Asistencia> captor = ArgumentCaptor.forClass(Asistencia.class);
        verify(asistencias).save(captor.capture());
        assertThat(captor.getValue().getResultadoHabilitacion()).isEqualTo(ResultadoHabilitacion.HABILITADO);
    }

    @Test
    void rechazaSiEstaHabilitadoPeroSinInscripcionEnElTaller() {
        participante.setEstadoHabilitacion(EstadoHabilitacion.HABILITADO);
        when(participantes.findByDni("40000002")).thenReturn(Optional.of(participante));
        when(asistencias.findFirstByParticipanteIdAndTallerIdAndFechaAndResultadoHabilitacion(
                2L, 1L, LocalDate.of(2026, 11, 10), ResultadoHabilitacion.HABILITADO))
                .thenReturn(Optional.empty());
        when(inscripciones.existsByParticipanteIdAndTallerIdAndEstado(
                2L, 1L, EstadoInscripcion.ACTIVA)).thenReturn(false);

        IngresoResponse resp = service.registrarIngreso(dni());

        assertThat(resp.resultado()).isEqualTo(ResultadoHabilitacion.RECHAZADO);
        assertThat(resp.motivos()).contains("No tiene una inscripción activa en este taller");
    }

    @Test
    void noDuplicaAsistenciaSiYaIngresoHabilitadoHoy() {
        participante.setEstadoHabilitacion(EstadoHabilitacion.HABILITADO);
        when(participantes.findByDni("40000002")).thenReturn(Optional.of(participante));
        Asistencia previa = new Asistencia();
        previa.setId(55L);
        when(asistencias.findFirstByParticipanteIdAndTallerIdAndFechaAndResultadoHabilitacion(
                2L, 1L, LocalDate.of(2026, 11, 10), ResultadoHabilitacion.HABILITADO))
                .thenReturn(Optional.of(previa));

        IngresoResponse resp = service.registrarIngreso(dni());

        assertThat(resp.resultado()).isEqualTo(ResultadoHabilitacion.HABILITADO);
        assertThat(resp.yaRegistradoHoy()).isTrue();
        assertThat(resp.idAsistencia()).isEqualTo(55L);
        verify(asistencias, never()).save(any());
    }

    @Test
    void lanzaErrorSiElDniNoExiste() {
        when(participantes.findByDni("99999999")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.registrarIngreso(
                new IngresoRequest(MetodoVerificacion.DNI, "99999999", 1L)))
                .isInstanceOf(NoEncontradoException.class)
                .hasMessageContaining("99999999");
    }
}
