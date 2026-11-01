package unju.talleres.ingreso.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import unju.talleres.auth.model.UsuarioSistema;
import unju.talleres.oferta.model.Taller;
import unju.talleres.participantes.model.Participante;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Guarda tanto los ingresos HABILITADOS como los RECHAZADOS. Índice único parcial:
 * no puede haber dos HABILITADOS para la misma persona, taller y fecha.
 */
@Entity
@Table(name = "asistencia")
@Getter
@Setter
@NoArgsConstructor
public class Asistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asistencia")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_participante", nullable = false)
    private Participante participante;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_taller", nullable = false)
    private Taller taller;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario_registro", nullable = false)
    private UsuarioSistema usuarioRegistro;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_ingreso", nullable = false)
    private LocalTime horaIngreso;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_verificacion", nullable = false, length = 10)
    private MetodoVerificacion metodoVerificacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "resultado_habilitacion", nullable = false, length = 20)
    private ResultadoHabilitacion resultadoHabilitacion;
}
