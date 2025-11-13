package br.edu.fatecpg.usafa.features.Admin.utils.patient;

import java.time.LocalDate;

import org.springframework.stereotype.Component;

import br.edu.fatecpg.usafa.features.Admin.dtos.patient.PatientRequestDto;
import br.edu.fatecpg.usafa.features.Admin.dtos.patient.PatientResponseDto;
import br.edu.fatecpg.usafa.models.User;

@Component
public class PatientMapper {

    /**
     * Converte a entidade User para um DTO de resposta.
     */
    public PatientResponseDto toDto(User user) {
        if (user == null) {
            return null;
        }

        PatientResponseDto dto = new PatientResponseDto();
        dto.setId(user.getPublicId().toString()); 
        dto.setName(user.getName()); 
        dto.setEmail(user.getEmail());
        dto.setCpf(user.getCpf());
        dto.setPhone(user.getPhone());
        
        // Converte LocalDate para String ISO
        if (user.getBirthDate() != null) {
            dto.setBirthDate(user.getBirthDate().toString());
        }

        return dto;
    }

    /**
     * Atualiza uma entidade User (existente) a partir de um DTO de requisição.
     * Nota: A senha não é gerenciada aqui.
     */
    public void updateEntity(PatientRequestDto dto, User user, LocalDate parsedBirthDate) {
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setCpf(dto.getCpf());
        user.setCep(dto.getCep());
        user.setPhone(dto.getPhone());
        user.setBirthDate(parsedBirthDate);
    }
}
