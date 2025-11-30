package br.edu.fatecpg.usafa.features.admin.utils.doctor;


import org.springframework.stereotype.Component;

import br.edu.fatecpg.usafa.features.admin.dtos.doctor.DoctorResponseDto;
import br.edu.fatecpg.usafa.models.Medico;

/**
 * Responsável por mapear a entidade Medico para seus DTOs de resposta.
 */
@Component
public class DoctorMapper {

    public DoctorResponseDto toDto(Medico medico) {
        if (medico == null) {
            return null;
        }

        DoctorResponseDto dto = new DoctorResponseDto();
        dto.setId(medico.getPublicId());
        dto.setName(medico.getNome());
        
        // Assume que você adicionou 'email' e 'crm' à entidade Medico
        dto.setEmail(medico.getEmail()); 
        dto.setCrm(medico.getCrm());

        // Busca o nome da especialidade a partir da entidade relacionada
        if (medico.getTipoConsulta() != null) { 
            dto.setSpecialty(medico.getTipoConsulta().getNome());
        } else {
            dto.setSpecialty(null); // Ou um valor padrão
        }

        // Mapeia a URL da foto de perfil a partir da entidade Picture relacionada
        if (medico.getPicture() != null) {
            dto.setPicture(medico.getPicture().getUrl());
        } else {
            dto.setPicture(null);
        }

        return dto;
    }
}
