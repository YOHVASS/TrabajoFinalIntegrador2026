package unju.talleres.documentacion.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import unju.talleres.participantes.model.Participante;

import java.time.LocalDate;

@Entity
@Table(name = "documentacion")
@Getter
@Setter
@NoArgsConstructor
public class Documentacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_documentacion")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_participante", nullable = false)
    private Participante participante;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_tipo_documento", nullable = false)
    private TipoDocumento tipoDocumento;

    @Column(name = "archivo_url", nullable = false, length = 255)
    private String archivoUrl;

    @Column(name = "fecha_presentacion", nullable = false)
    private LocalDate fechaPresentacion;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoDocumentacion estado = EstadoDocumentacion.VIGENTE;

    /** Calcula el estado derivado para la fecha indicada. */
    public EstadoDocumentacion calcularEstado(LocalDate hoy) {
        if (fechaVencimiento == null) {
            return tipoDocumento.isTieneVencimiento() ? EstadoDocumentacion.PENDIENTE : EstadoDocumentacion.VIGENTE;
        }
        return fechaVencimiento.isBefore(hoy) ? EstadoDocumentacion.VENCIDO : EstadoDocumentacion.VIGENTE;
    }
}
