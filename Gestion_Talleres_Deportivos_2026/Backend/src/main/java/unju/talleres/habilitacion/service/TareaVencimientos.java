package unju.talleres.habilitacion.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Tarea programada diaria (sección 6.4 del diseño): revisa vencimientos de documentación,
 * seguro y apto médico, actualiza la habilitación y genera/resuelve alertas.
 * También se ejecuta al iniciar la aplicación (en Render el servicio gratuito se duerme y
 * puede no estar despierto a la hora programada).
 */
@Component
public class TareaVencimientos {

    private static final Logger log = LoggerFactory.getLogger(TareaVencimientos.class);

    private final HabilitacionService habilitacionService;

    public TareaVencimientos(HabilitacionService habilitacionService) {
        this.habilitacionService = habilitacionService;
    }

    @Scheduled(cron = "${app.tareas.cron-vencimientos}", zone = "${app.zona-horaria}")
    public void ejecutarDiaria() {
        ejecutar();
    }

    @EventListener(ApplicationReadyEvent.class)
    public void alIniciar() {
        ejecutar();
    }

    private void ejecutar() {
        try {
            habilitacionService.recalcularTodos();
        } catch (Exception e) {
            log.error("Falló el recálculo de vencimientos", e);
        }
    }
}
