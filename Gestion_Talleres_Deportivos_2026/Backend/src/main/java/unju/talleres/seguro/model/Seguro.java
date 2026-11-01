package unju.talleres.seguro.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import unju.talleres.oferta.model.Periodo;
import unju.talleres.participantes.model.Participante;

import java.time.LocalDate;

/** Seguro anual: uno por participante y período (RN-02, UNIQUE id_participante + id_periodo). */
@Entity
@Table(name = "seguro")
@Getter
@Setter
@NoArgsConstructor
public class Seguro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_seguro")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_participante", nullable = false)
    private Participante participante;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_periodo", nullable = false)
    private Periodo periodo;

    @Column(name = "numero_poliza", length = 50)
    private String numeroPoliza;

    @Column(name = "fecha_pago", nullable = false)
    private LocalDate fechaPago;

    @Column(name = "vigencia_desde", nullable = false)
    private LocalDate vigenciaDesde;

    @Column(name = "vigencia_hasta", nullable = false)
    private LocalDate vigenciaHasta;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoSeguro estado = EstadoSeguro.VIGENTE;

    /** RN-10 / RF-19: si el alta ya fue informada a la productora. */
    @Column(name = "informado_productora", nullable = false)
    private boolean informadoProductora = false;

    public EstadoSeguro calcularEstado(LocalDate hoy) {
        return vigenciaHasta.isBefore(hoy) ? EstadoSeguro.VENCIDO : EstadoSeguro.VIGENTE;
    }

    public boolean cubre(LocalDate fecha) {
        return !fecha.isBefore(vigenciaDesde) && !fecha.isAfter(vigenciaHasta);
    }
}
