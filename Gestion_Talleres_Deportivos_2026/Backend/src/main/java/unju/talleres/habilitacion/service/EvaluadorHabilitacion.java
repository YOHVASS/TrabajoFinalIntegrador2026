package unju.talleres.habilitacion.service;

import unju.talleres.aptomedico.model.AptoMedico;
import unju.talleres.documentacion.model.Documentacion;
import unju.talleres.documentacion.model.EstadoDocumentacion;
import unju.talleres.documentacion.model.TipoDocumento;
import unju.talleres.participantes.model.EstadoHabilitacion;
import unju.talleres.seguro.model.Seguro;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Regla RN-05 como función pura (sin base de datos), para poder probarla con tests unitarios.
 * <p>
 * Un participante está HABILITADO si cumple simultáneamente:
 * documentación obligatoria completa y vigente, seguro vigente y apto médico vigente.
 * Si algún requisito está vencido queda NO_HABILITADO; si solo faltan presentar requisitos, PENDIENTE.
 */
public final class EvaluadorHabilitacion {

    private EvaluadorHabilitacion() {
    }

    public enum Situacion { CUMPLE, FALTA, VENCIDO }

    public record ResultadoDocumento(TipoDocumento tipo, Situacion situacion, LocalDate fechaVencimiento) {
    }

    public record Evaluacion(
            EstadoHabilitacion estado,
            List<ResultadoDocumento> documentos,
            Situacion seguro,
            Seguro seguroVigente,
            Seguro ultimoSeguro,
            Situacion aptoMedico,
            AptoMedico aptoVigente,
            AptoMedico ultimoApto,
            List<String> motivos) {

        public boolean documentacionCompleta() {
            return documentos.stream().allMatch(d -> d.situacion() == Situacion.CUMPLE);
        }
    }

    public static Evaluacion evaluar(List<TipoDocumento> tiposObligatorios, List<Documentacion> documentos,
                                     List<Seguro> seguros, List<AptoMedico> aptos, LocalDate hoy) {
        List<String> motivos = new ArrayList<>();

        // Documentación obligatoria (RN-03, RN-05)
        List<ResultadoDocumento> resultadosDoc = new ArrayList<>();
        for (TipoDocumento tipo : tiposObligatorios) {
            List<Documentacion> delTipo = documentos.stream()
                    .filter(d -> d.getTipoDocumento().getId().equals(tipo.getId())).toList();
            Optional<Documentacion> vigente = delTipo.stream()
                    .filter(d -> d.calcularEstado(hoy) == EstadoDocumentacion.VIGENTE)
                    .max(Comparator.comparing(Documentacion::getFechaPresentacion));
            if (vigente.isPresent()) {
                resultadosDoc.add(new ResultadoDocumento(tipo, Situacion.CUMPLE, vigente.get().getFechaVencimiento()));
            } else if (delTipo.stream().anyMatch(d -> d.calcularEstado(hoy) == EstadoDocumentacion.VENCIDO)) {
                LocalDate ultimoVto = delTipo.stream().map(Documentacion::getFechaVencimiento)
                        .filter(f -> f != null).max(LocalDate::compareTo).orElse(null);
                resultadosDoc.add(new ResultadoDocumento(tipo, Situacion.VENCIDO, ultimoVto));
                motivos.add("Documento vencido: " + tipo.getNombre());
            } else {
                resultadosDoc.add(new ResultadoDocumento(tipo, Situacion.FALTA, null));
                motivos.add("Falta presentar: " + tipo.getNombre());
            }
        }

        // Seguro anual (RN-01, RN-02)
        Seguro seguroVigente = seguros.stream().filter(s -> s.cubre(hoy))
                .max(Comparator.comparing(Seguro::getVigenciaHasta)).orElse(null);
        Seguro ultimoSeguro = seguros.stream().max(Comparator.comparing(Seguro::getVigenciaHasta)).orElse(null);
        Situacion sitSeguro;
        if (seguroVigente != null) {
            sitSeguro = Situacion.CUMPLE;
        } else if (seguros.stream().anyMatch(s -> s.getVigenciaHasta().isBefore(hoy))) {
            sitSeguro = Situacion.VENCIDO;
            motivos.add("Seguro anual vencido");
        } else {
            sitSeguro = Situacion.FALTA;
            motivos.add("Falta el pago del seguro anual");
        }

        // Apto médico (RN-04)
        AptoMedico aptoVigente = aptos.stream().filter(a -> a.cubre(hoy))
                .max(Comparator.comparing(AptoMedico::getFechaVencimiento)).orElse(null);
        AptoMedico ultimoApto = aptos.stream().max(Comparator.comparing(AptoMedico::getFechaVencimiento)).orElse(null);
        Situacion sitApto;
        if (aptoVigente != null) {
            sitApto = Situacion.CUMPLE;
        } else if (aptos.stream().anyMatch(a -> a.getFechaVencimiento().isBefore(hoy))) {
            sitApto = Situacion.VENCIDO;
            motivos.add("Apto médico vencido");
        } else {
            sitApto = Situacion.FALTA;
            motivos.add("Falta presentar el apto médico");
        }

        boolean docOk = resultadosDoc.stream().allMatch(d -> d.situacion() == Situacion.CUMPLE);
        boolean algunVencido = sitSeguro == Situacion.VENCIDO || sitApto == Situacion.VENCIDO
                || resultadosDoc.stream().anyMatch(d -> d.situacion() == Situacion.VENCIDO);

        EstadoHabilitacion estado;
        if (docOk && sitSeguro == Situacion.CUMPLE && sitApto == Situacion.CUMPLE) {
            estado = EstadoHabilitacion.HABILITADO;
        } else if (algunVencido) {
            estado = EstadoHabilitacion.NO_HABILITADO;
        } else {
            estado = EstadoHabilitacion.PENDIENTE;
        }
        return new Evaluacion(estado, resultadosDoc, sitSeguro, seguroVigente, ultimoSeguro,
                sitApto, aptoVigente, ultimoApto, motivos);
    }
}
