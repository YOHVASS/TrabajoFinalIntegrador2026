package unju.talleres.aptomedico.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import unju.talleres.participantes.model.Participante;

import java.time.LocalDate;

/** Apto médico: vigencia de un año desde la emisión (RN-04). Dato de salud: acceso restringido (RN-11). */
@Entity
@Table(name = "apto_medico")
@Getter
@Setter
@NoArgsConstructor
public class AptoMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_apto_medico")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_participante", nullable = false)
    private Participante participante;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDate fechaEmision;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(name = "archivo_url", length = 255)
    private String archivoUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoAptoMedico estado = EstadoAptoMedico.VIGENTE;

    public EstadoAptoMedico calcularEstado(LocalDate hoy) {
        return fechaVencimiento.isBefore(hoy) ? EstadoAptoMedico.VENCIDO : EstadoAptoMedico.VIGENTE;
    }

    public boolean cubre(LocalDate fecha) {
        return !fecha.isBefore(fechaEmision) && !fecha.isAfter(fechaVencimiento);
    }
}
