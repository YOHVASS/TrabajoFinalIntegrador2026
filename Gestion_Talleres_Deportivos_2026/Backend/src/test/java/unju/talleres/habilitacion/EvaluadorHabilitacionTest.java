package unju.talleres.habilitacion;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import unju.talleres.aptomedico.model.AptoMedico;
import unju.talleres.documentacion.model.Documentacion;
import unju.talleres.documentacion.model.TipoDocumento;
import unju.talleres.habilitacion.service.EvaluadorHabilitacion;
import unju.talleres.habilitacion.service.EvaluadorHabilitacion.Evaluacion;
import unju.talleres.habilitacion.service.EvaluadorHabilitacion.Situacion;
import unju.talleres.participantes.model.EstadoHabilitacion;
import unju.talleres.seguro.model.Seguro;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** Pruebas de la regla RN-05 (habilitación) y RN-04 (vigencia del apto médico). */
class EvaluadorHabilitacionTest {

    private static final LocalDate HOY = LocalDate.of(2026, 10, 29);
    private TipoDocumento constancia;

    @BeforeEach
    void setUp() {
        constancia = new TipoDocumento();
        constancia.setId(1L);
        constancia.setNombre("Constancia de alumno");
        constancia.setObligatorio(true);
        constancia.setTieneVencimiento(true);
    }

    private Documentacion constancia(LocalDate vencimiento) {
        Documentacion d = new Documentacion();
        d.setTipoDocumento(constancia);
        d.setArchivoUrl("/api/archivos/x.pdf");
        d.setFechaPresentacion(HOY.minusMonths(2));
        d.setFechaVencimiento(vencimiento);
        return d;
    }

    private Seguro seguro(LocalDate desde, LocalDate hasta) {
        Seguro s = new Seguro();
        s.setFechaPago(desde);
        s.setVigenciaDesde(desde);
        s.setVigenciaHasta(hasta);
        return s;
    }

    private AptoMedico apto(LocalDate emision) {
        AptoMedico a = new AptoMedico();
        a.setFechaEmision(emision);
        a.setFechaVencimiento(emision.plusYears(1));
        return a;
    }

    @Test
    void habilitadoCuandoCumpleLosTresRequisitos() {
        Evaluacion ev = EvaluadorHabilitacion.evaluar(List.of(constancia),
                List.of(constancia(HOY.plusMonths(3))),
                List.of(seguro(HOY.minusMonths(1), HOY.plusMonths(11))),
                List.of(apto(HOY.minusMonths(6))), HOY);

        assertThat(ev.estado()).isEqualTo(EstadoHabilitacion.HABILITADO);
        assertThat(ev.motivos()).isEmpty();
    }

    @Test
    void pendienteCuandoFaltanRequisitosSinVencidos() {
        Evaluacion ev = EvaluadorHabilitacion.evaluar(List.of(constancia), List.of(), List.of(), List.of(), HOY);

        assertThat(ev.estado()).isEqualTo(EstadoHabilitacion.PENDIENTE);
        assertThat(ev.seguro()).isEqualTo(Situacion.FALTA);
        assertThat(ev.aptoMedico()).isEqualTo(Situacion.FALTA);
        assertThat(ev.motivos()).hasSize(3);
    }

    @Test
    void noHabilitadoCuandoElAptoVencioHaceMasDeUnAnio() {
        Evaluacion ev = EvaluadorHabilitacion.evaluar(List.of(constancia),
                List.of(constancia(HOY.plusMonths(3))),
                List.of(seguro(HOY.minusMonths(1), HOY.plusMonths(11))),
                List.of(apto(HOY.minusYears(1).minusDays(1))), HOY);

        assertThat(ev.estado()).isEqualTo(EstadoHabilitacion.NO_HABILITADO);
        assertThat(ev.aptoMedico()).isEqualTo(Situacion.VENCIDO);
        assertThat(ev.motivos()).containsExactly("Apto médico vencido");
    }

    @Test
    void aptoVigenteHastaElUltimoDiaInclusive() {
        Evaluacion ev = EvaluadorHabilitacion.evaluar(List.of(),
                List.of(),
                List.of(seguro(HOY.minusMonths(1), HOY.plusMonths(11))),
                List.of(apto(HOY.minusYears(1))), HOY);

        assertThat(ev.aptoMedico()).isEqualTo(Situacion.CUMPLE);
        assertThat(ev.estado()).isEqualTo(EstadoHabilitacion.HABILITADO);
    }

    @Test
    void noHabilitadoConSeguroVencido() {
        Evaluacion ev = EvaluadorHabilitacion.evaluar(List.of(constancia),
                List.of(constancia(HOY.plusMonths(3))),
                List.of(seguro(HOY.minusYears(1).minusMonths(1), HOY.minusMonths(1))),
                List.of(apto(HOY.minusMonths(1))), HOY);

        assertThat(ev.estado()).isEqualTo(EstadoHabilitacion.NO_HABILITADO);
        assertThat(ev.seguro()).isEqualTo(Situacion.VENCIDO);
    }

    @Test
    void constanciaSinFechaDeVencimientoNoCuentaComoPresentada() {
        Evaluacion ev = EvaluadorHabilitacion.evaluar(List.of(constancia),
                List.of(constancia(null)),
                List.of(seguro(HOY.minusMonths(1), HOY.plusMonths(11))),
                List.of(apto(HOY.minusMonths(1))), HOY);

        assertThat(ev.estado()).isEqualTo(EstadoHabilitacion.PENDIENTE);
        assertThat(ev.documentacionCompleta()).isFalse();
    }

    @Test
    void noHabilitadoCuandoLaConstanciaEstaVencida() {
        Evaluacion ev = EvaluadorHabilitacion.evaluar(List.of(constancia),
                List.of(constancia(HOY.minusDays(1))),
                List.of(seguro(HOY.minusMonths(1), HOY.plusMonths(11))),
                List.of(apto(HOY.minusMonths(1))), HOY);

        assertThat(ev.estado()).isEqualTo(EstadoHabilitacion.NO_HABILITADO);
        assertThat(ev.documentacionCompleta()).isFalse();
        assertThat(ev.motivos()).isNotEmpty();
    }

    @Test
    void usaElSeguroVigenteAunqueHayaUnoVencidoAnterior() {
        Evaluacion ev = EvaluadorHabilitacion.evaluar(List.of(constancia),
                List.of(constancia(HOY.plusMonths(3))),
                List.of(
                        seguro(HOY.minusYears(2), HOY.minusYears(1)),
                        seguro(HOY.minusMonths(1), HOY.plusMonths(11))),
                List.of(apto(HOY.minusMonths(2))), HOY);

        assertThat(ev.seguro()).isEqualTo(Situacion.CUMPLE);
        assertThat(ev.estado()).isEqualTo(EstadoHabilitacion.HABILITADO);
    }
}
