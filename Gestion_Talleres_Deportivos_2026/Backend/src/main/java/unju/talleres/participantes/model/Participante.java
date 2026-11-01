package unju.talleres.participantes.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "participante")
@Getter
@Setter
@NoArgsConstructor
public class Participante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_participante")
    private Long id;

    @Column(name = "dni", nullable = false, unique = true, length = 15)
    private String dni;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "apellido", nullable = false, length = 100)
    private String apellido;

    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    @Enumerated(EnumType.STRING)
    @Column(name = "sexo", nullable = false, length = 20)
    private Sexo sexo;

    @Column(name = "facultad", length = 100)
    private String facultad;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "telefono", length = 30)
    private String telefono;

    @Column(name = "foto_url", length = 255)
    private String fotoUrl;

    /** Token UUID del QR (RN-07). Se genera al aprobarse la primera inscripción. */
    @Column(name = "qr_code", unique = true, length = 100)
    private String qrCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_habilitacion", nullable = false, length = 20)
    private EstadoHabilitacion estadoHabilitacion = EstadoHabilitacion.PENDIENTE;

    @Column(name = "fecha_alta", nullable = false)
    private OffsetDateTime fechaAlta;
}
