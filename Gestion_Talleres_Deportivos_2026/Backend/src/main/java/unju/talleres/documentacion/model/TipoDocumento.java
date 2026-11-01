package unju.talleres.documentacion.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Catálogo de documentos y cuáles son obligatorios para la habilitación (RN-05, RF-08). */
@Entity
@Table(name = "tipo_documento")
@Getter
@Setter
@NoArgsConstructor
public class TipoDocumento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_documento")
    private Long id;

    @Column(name = "nombre", nullable = false, unique = true, length = 50)
    private String nombre;

    @Column(name = "obligatorio", nullable = false)
    private boolean obligatorio = true;

    @Column(name = "tiene_vencimiento", nullable = false)
    private boolean tieneVencimiento = false;
}
