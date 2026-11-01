package unju.talleres.preinscripcion.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import unju.talleres.oferta.model.Taller;
import unju.talleres.participantes.model.Participante;

import java.time.LocalDate;

@Entity
@Table(name = "inscripcion")
@Getter
@Setter
@NoArgsConstructor
public class Inscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inscripcion")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_participante", nullable = false)
    private Participante participante;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_taller", nullable = false)
    private Taller taller;

    /** Una preinscripción origina como máximo una inscripción (UNIQUE). */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_preinscripcion", nullable = false, unique = true)
    private Preinscripcion preinscripcion;

    @Column(name = "fecha_inscripcion", nullable = false)
    private LocalDate fechaInscripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoInscripcion estado = EstadoInscripcion.ACTIVA;
}
