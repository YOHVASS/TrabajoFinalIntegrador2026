package unju.talleres;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * API REST del Sistema Web de Gestión de Talleres Deportivos (UNJu).
 * Cada paquete de primer nivel corresponde a un módulo del documento de diseño (Etapa 2).
 */
@SpringBootApplication
@EnableScheduling
public class TalleresApplication {

    public static void main(String[] args) {
        SpringApplication.run(TalleresApplication.class, args);
    }
}
