package unju.talleres.common.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import unju.talleres.common.exception.NegocioException;
import unju.talleres.common.exception.NoEncontradoException;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * Guarda los archivos digitalizados (fotos, constancias, aptos) en disco y devuelve la URL
 * que se guarda en foto_url / archivo_url. En Render el disco es efímero: para producción
 * conviene montar un Persistent Disk en UPLOAD_DIR o reemplazar esta clase por un bucket (S3/Supabase Storage).
 */
@Service
public class AlmacenamientoService {

    public static final String PREFIJO_URL = "/api/archivos/";
    private static final Set<String> EXTENSIONES = Set.of("pdf", "jpg", "jpeg", "png", "webp");

    private final Path directorio;

    public AlmacenamientoService(@Value("${app.archivos.directorio}") String directorio) throws IOException {
        this.directorio = Path.of(directorio).toAbsolutePath().normalize();
        Files.createDirectories(this.directorio);
    }

    public String guardar(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new NegocioException(HttpStatus.BAD_REQUEST, "Debe adjuntar un archivo");
        }
        String extension = extension(archivo.getOriginalFilename());
        if (!EXTENSIONES.contains(extension)) {
            throw new NegocioException(HttpStatus.BAD_REQUEST, "Formato no admitido. Use PDF, JPG, PNG o WEBP");
        }
        String nombre = UUID.randomUUID() + "." + extension;
        try (InputStream in = archivo.getInputStream()) {
            Files.copy(in, directorio.resolve(nombre), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new NegocioException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar el archivo");
        }
        return PREFIJO_URL + nombre;
    }

    public Resource cargar(String nombre) {
        Path ruta = directorio.resolve(nombre).normalize();
        if (!ruta.startsWith(directorio) || !Files.isRegularFile(ruta)) {
            throw new NoEncontradoException("Archivo inexistente: " + nombre);
        }
        try {
            return new UrlResource(ruta.toUri());
        } catch (MalformedURLException e) {
            throw new NoEncontradoException("Archivo inexistente: " + nombre);
        }
    }

    public String tipoContenido(String nombre) {
        return switch (extension(nombre)) {
            case "pdf" -> "application/pdf";
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            default -> "image/jpeg";
        };
    }

    private static String extension(String nombre) {
        if (nombre == null || !nombre.contains(".")) {
            return "";
        }
        return nombre.substring(nombre.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }
}
