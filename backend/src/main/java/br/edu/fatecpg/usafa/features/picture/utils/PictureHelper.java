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
            String safeGroup = group.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
            Path groupPath = this.rootLocation.resolve(Paths.get("images", safeGroup)).normalize().toAbsolutePath();
            if (!Files.exists(groupPath)) {
                Files.createDirectories(groupPath);
            }
        } catch (IOException e) {
            throw new IOException("Could not create directory for group: " + group, e);
        }
    }

    public String saveFile(MultipartFile file, String group) throws IOException {
        if (file == null || file.isEmpty()) return null;

        createGroupDirectory(group);
        
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        String safeGroup = group.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
        
        Path destination = this.rootLocation.resolve(Paths.get("images", safeGroup, filename)).normalize().toAbsolutePath();

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
        }

        // Retorna ex: /uploads/images/grupo/arquivo.jpg
        return "/uploads/images/" + safeGroup + "/" + filename;
    }

    /**
     * [NOVO MÉTODO] Deleta o arquivo físico do disco baseado na URL salva.
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;

        try {
            // Remove a barra inicial "/" para o sistema entender que é um caminho relativo à pasta do projeto
            // De: "/uploads/images/..." -> Para: "uploads/images/..."
            String relativePath = fileUrl.startsWith("/") ? fileUrl.substring(1) : fileUrl;
            
            Path filePath = Paths.get(relativePath).toAbsolutePath().normalize();
            
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Apenas loga o erro, não para a execução, pois o foco é limpar
            System.err.println("Aviso: Não foi possível deletar o arquivo físico: " + fileUrl);
        }
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