package unju.talleres.common.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;

/**
 * Centraliza "hoy" y "ahora" en la zona horaria de la institución (Jujuy),
 * para que los vencimientos no dependan de la zona del servidor (Render usa UTC).
 */
@Component
public class Fechas {

    private final ZoneId zona;

    public Fechas(@Value("${app.zona-horaria:America/Argentina/Jujuy}") String zona) {
        this.zona = ZoneId.of(zona);
    }

    public LocalDate hoy() {
        return LocalDate.now(zona);
    }

    public LocalTime horaActual() {
        return LocalTime.now(zona).withNano(0);
    }

    public OffsetDateTime ahora() {
        return OffsetDateTime.now(zona);
    }
}
