package unju.talleres.preinscripcion.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import unju.talleres.oferta.model.Taller;
import unju.talleres.participantes.model.Participante;

import java.time.OffsetDateTime;

@Entity
@Table(name = "preinscripcion")
@Getter
@Setter
@NoArgsConstructor
public class Preinscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_preinscripcion")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_participante", nullable = false)
    private Participante participante;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_taller", nullable = false)
    private Taller taller;

    @Column(name = "fecha_solicitud", nullable = false)
    private OffsetDateTime fechaSolicitud;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoPreinscripcion estado = EstadoPreinscripcion.PENDIENTE;
}
