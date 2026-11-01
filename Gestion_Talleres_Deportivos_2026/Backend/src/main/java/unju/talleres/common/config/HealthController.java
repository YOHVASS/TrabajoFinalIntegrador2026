package unju.talleres.common.config;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** Endpoint simple para el health check de Render y para "despertar" el servicio. */
@RestController
@Tag(name = "Health")
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of("estado", "OK");
    }
}
