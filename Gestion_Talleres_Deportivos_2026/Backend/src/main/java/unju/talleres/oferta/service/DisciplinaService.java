package unju.talleres.oferta.service;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unju.talleres.common.exception.NegocioException;
import unju.talleres.common.exception.NoEncontradoException;
import unju.talleres.oferta.dto.DisciplinaDto;
import unju.talleres.oferta.model.Disciplina;
import unju.talleres.oferta.repository.DisciplinaRepository;
import unju.talleres.oferta.repository.TallerRepository;

import java.util.List;

@Service
public class DisciplinaService {

    private final DisciplinaRepository disciplinas;
    private final TallerRepository talleres;

    public DisciplinaService(DisciplinaRepository disciplinas, TallerRepository talleres) {
        this.disciplinas = disciplinas;
        this.talleres = talleres;
    }

    @Transactional(readOnly = true)
    public List<DisciplinaDto> listar() {
        return disciplinas.findAll(Sort.by("nombre")).stream().map(DisciplinaDto::de).toList();
    }

    @Transactional(readOnly = true)
    public DisciplinaDto obtener(Long id) {
        return DisciplinaDto.de(buscar(id));
    }

    @Transactional
    public DisciplinaDto crear(DisciplinaDto req) {
        if (disciplinas.existsByNombreIgnoreCase(req.nombre().trim())) {
            throw new NegocioException("Ya existe la disciplina '" + req.nombre() + "'");
        }
        Disciplina d = new Disciplina();
        d.setNombre(req.nombre().trim());
        d.setDescripcion(req.descripcion());
        return DisciplinaDto.de(disciplinas.save(d));
    }

    @Transactional
    public DisciplinaDto actualizar(Long id, DisciplinaDto req) {
        Disciplina d = buscar(id);
        if (disciplinas.existsByNombreIgnoreCaseAndIdNot(req.nombre().trim(), id)) {
            throw new NegocioException("Ya existe la disciplina '" + req.nombre() + "'");
        }
        d.setNombre(req.nombre().trim());
        d.setDescripcion(req.descripcion());
        return DisciplinaDto.de(d);
    }

    @Transactional
    public void eliminar(Long id) {
        Disciplina d = buscar(id);
        if (talleres.existsByDisciplinaId(id)) {
            throw new NegocioException("No se puede eliminar: la disciplina tiene talleres asociados");
        }
        disciplinas.delete(d);
        disciplinas.flush();
    }

    @Transactional(readOnly = true)
    public Disciplina buscar(Long id) {
        return disciplinas.findById(id).orElseThrow(() -> new NoEncontradoException("Disciplina", id));
    }
}
