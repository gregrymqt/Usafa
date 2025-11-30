package br.edu.fatecpg.usafa.features.picture.utils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import br.edu.fatecpg.usafa.features.picture.dtos.PictureDto;
import br.edu.fatecpg.usafa.models.Picture;

public class PictureHelper {

    private final Path rootLocation = Paths.get("uploads");

    /**
     * Garante que o diretório para um grupo de imagens exista.
     * Ex: /uploads/images/perfil
     * 
     * @param group O nome do grupo (que será o nome da pasta).
     * @throws IOException se houver um erro ao criar os diretórios.
     */
    public void createGroupDirectory(String group) throws IOException {
        try {
            Path groupPath = this.rootLocation.resolve(Paths.get("images", group)).normalize().toAbsolutePath();
            Files.createDirectories(groupPath);
        } catch (IOException e) {
            throw new IOException("Could not create directory for group: " + group, e);
        }
    }

    /**
     * Converte uma entidade Picture para seu DTO correspondente.
     * 
     * @param picture A entidade a ser convertida.
     * @return O DTO preenchido.
     */
    public PictureDto toDto(Picture picture) {
        if (picture == null) {
            return null;
        }
        return PictureDto.builder()
                .id(String.valueOf(picture.getId())) // O ID do DTO é String
                .title(picture.getTitle())
                .url(picture.getUrl())
                .group(picture.getGroup()) // Mapeando o grupo de volta para o DTO
                .build();
    }

}
