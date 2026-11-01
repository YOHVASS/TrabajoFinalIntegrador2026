package unju.talleres.oferta.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import unju.talleres.auth.model.UsuarioSistema;

/** RN-09: el ayudante no tiene campo de permisos; el acceso se resuelve por el rol de su usuario. */
@Entity
@Table(name = "ayudante")
@Getter
@Setter
@NoArgsConstructor
public class Ayudante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ayudante")
    private Long id;

    @Column(name = "dni", nullable = false, unique = true, length = 15)
    private String dni;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "apellido", nullable = false, length = 100)
    private String apellido;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", unique = true)
    private UsuarioSistema usuario;
}
