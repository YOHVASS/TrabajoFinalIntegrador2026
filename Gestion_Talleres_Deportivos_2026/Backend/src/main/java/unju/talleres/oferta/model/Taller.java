package unju.talleres.oferta.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "taller")
@Getter
@Setter
@NoArgsConstructor
public class Taller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_taller")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_disciplina", nullable = false)
    private Disciplina disciplina;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_profesor", nullable = false)
    private Profesor profesor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_periodo", nullable = false)
    private Periodo periodo;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(name = "modalidad", nullable = false, length = 20)
    private Modalidad modalidad;

    /** NULL = sin límite. Al alcanzarse, las preinscripciones quedan en LISTA_ESPERA (RN-13). */
    @Column(name = "cupo_maximo")
    private Integer cupoMaximo;

    @OneToMany(mappedBy = "taller", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HorarioTaller> horarios = new ArrayList<>();

    /** Relación N:M mediante la tabla intermedia taller_ayudante (clave compuesta). */
    @ManyToMany
    @JoinTable(name = "taller_ayudante",
            joinColumns = @JoinColumn(name = "id_taller"),
            inverseJoinColumns = @JoinColumn(name = "id_ayudante"))
    private Set<Ayudante> ayudantes = new LinkedHashSet<>();
}
