package br.edu.fatecpg.usafa.features.picture.utils;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import br.edu.fatecpg.usafa.features.picture.dtos.PictureDto;
import br.edu.fatecpg.usafa.models.Picture;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Component
public class PictureHelper {

    private final Path rootLocation = Paths.get("uploads");

    public void createGroupDirectory(String group) throws IOException {
        try {
            // Sanitiza o nome do grupo para evitar caminhos inválidos
            String safeGroup = group.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
            Path groupPath = this.rootLocation.resolve(Paths.get("images", safeGroup)).normalize().toAbsolutePath();
            if (!Files.exists(groupPath)) {
                Files.createDirectories(groupPath);
            }
        } catch (IOException e) {
            throw new IOException("Could not create directory for group: " + group, e);
        }
    }

    /**
     * Salva o arquivo fisicamente e retorna o caminho relativo (URL).
     */
    public String saveFile(MultipartFile file, String group) throws IOException {
        if (file == null || file.isEmpty()) return null;

        // 1. Garante que a pasta existe
        createGroupDirectory(group);

        // 2. Gera nome único
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        
        // 3. Define caminhos (Sanitiza o grupo novamente por segurança)
        String safeGroup = group.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
        Path destination = this.rootLocation.resolve(Paths.get("images", safeGroup, filename)).normalize().toAbsolutePath();

        // 4. Copia o arquivo
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
        }

        // 5. Retorna URL amigável para o banco
        // Ex: /uploads/images/CAROUSEL/foto123.jpg
        return "/uploads/images/" + safeGroup + "/" + filename;
    }

    public PictureDto toDto(Picture picture) {
        if (picture == null) return null;
        return PictureDto.builder()
                .id(String.valueOf(picture.getId()))
                .title(picture.getTitle())
                .url(picture.getUrl())
                .group(picture.getGroup())
                .build();
    }
}