package unju.talleres.preinscripcion;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import unju.talleres.oferta.model.Taller;
import unju.talleres.preinscripcion.model.EstadoInscripcion;
import unju.talleres.preinscripcion.model.EstadoPreinscripcion;
import unju.talleres.preinscripcion.model.Preinscripcion;
import unju.talleres.preinscripcion.repository.InscripcionRepository;
import unju.talleres.preinscripcion.repository.PreinscripcionRepository;
import unju.talleres.preinscripcion.service.CupoService;
import unju.talleres.preinscripcion.service.CupoService.Ocupacion;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Pruebas de RN-13: cupo máximo y promoción desde lista de espera. */
@ExtendWith(MockitoExtension.class)
class CupoServiceTest {

    @Mock
    private InscripcionRepository inscripciones;

    @Mock
    private PreinscripcionRepository preinscripciones;

    private CupoService service;
    private Taller taller;

    @BeforeEach
    void setUp() {
        service = new CupoService(inscripciones, preinscripciones);
        taller = new Taller();
        taller.setId(10L);
        taller.setCupoMaximo(3);
    }

    private void stubOcupacion(long activos, long pendientes, long espera) {
        when(inscripciones.countByTallerIdAndEstado(10L, EstadoInscripcion.ACTIVA)).thenReturn(activos);
        when(preinscripciones.countByTallerIdAndEstado(10L, EstadoPreinscripcion.PENDIENTE)).thenReturn(pendientes);
        when(preinscripciones.countByTallerIdAndEstado(10L, EstadoPreinscripcion.LISTA_ESPERA)).thenReturn(espera);
    }

    private Preinscripcion enEspera(long id) {
        Preinscripcion p = new Preinscripcion();
        p.setId(id);
        p.setEstado(EstadoPreinscripcion.LISTA_ESPERA);
        return p;
    }

    @Test
    void hayCupoCuandoQuedanLugaresLibres() {
        stubOcupacion(1, 1, 0);

        Ocupacion oc = service.ocupacion(taller);

        assertThat(oc.ocupados()).isEqualTo(2);
        assertThat(oc.lugaresDisponibles()).isEqualTo(1);
        assertThat(oc.hayCupo()).isTrue();
    }

    @Test
    void noHayCupoCuandoActivosYPendientesLlenanElMaximo() {
        stubOcupacion(2, 1, 4);

        Ocupacion oc = service.ocupacion(taller);

        assertThat(oc.ocupados()).isEqualTo(3);
        assertThat(oc.lugaresDisponibles()).isZero();
        assertThat(oc.hayCupo()).isFalse();
        assertThat(oc.enListaEspera()).isEqualTo(4);
    }

    @Test
    void cupoIlimitadoCuandoNoHayMaximo() {
        taller.setCupoMaximo(null);
        stubOcupacion(100, 50, 0);

        Ocupacion oc = service.ocupacion(taller);

        assertThat(oc.lugaresDisponibles()).isNull();
        assertThat(oc.hayCupo()).isTrue();
    }

    @Test
    void promoverListaEsperaPasaAPendienteSegunLugaresLibres() {
        stubOcupacion(1, 0, 3);
        List<Preinscripcion> espera = new ArrayList<>(List.of(
                enEspera(1L), enEspera(2L), enEspera(3L)));
        when(preinscripciones.findByTallerIdAndEstadoOrderByFechaSolicitudAscIdAsc(
                10L, EstadoPreinscripcion.LISTA_ESPERA)).thenReturn(espera);

        int promovidas = service.promoverListaEspera(taller);

        assertThat(promovidas).isEqualTo(2);
        assertThat(espera.get(0).getEstado()).isEqualTo(EstadoPreinscripcion.PENDIENTE);
        assertThat(espera.get(1).getEstado()).isEqualTo(EstadoPreinscripcion.PENDIENTE);
        assertThat(espera.get(2).getEstado()).isEqualTo(EstadoPreinscripcion.LISTA_ESPERA);
        verify(preinscripciones).flush();
    }

    @Test
    void promoverListaEsperaNoHaceNadaSiNoHayEspera() {
        when(preinscripciones.findByTallerIdAndEstadoOrderByFechaSolicitudAscIdAsc(
                10L, EstadoPreinscripcion.LISTA_ESPERA)).thenReturn(List.of());

        int promovidas = service.promoverListaEspera(taller);

        assertThat(promovidas).isZero();
    }

    @Test
    void promoverListaEsperaNoPromueveSiNoHayLugares() {
        stubOcupacion(2, 1, 2);
        List<Preinscripcion> espera = List.of(enEspera(1L), enEspera(2L));
        when(preinscripciones.findByTallerIdAndEstadoOrderByFechaSolicitudAscIdAsc(
                10L, EstadoPreinscripcion.LISTA_ESPERA)).thenReturn(espera);

        int promovidas = service.promoverListaEspera(taller);

        assertThat(promovidas).isZero();
        assertThat(espera).allMatch(p -> p.getEstado() == EstadoPreinscripcion.LISTA_ESPERA);
    }
}
