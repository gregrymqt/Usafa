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
        dto.setEmail(medico.getEmail());
        dto.setCrm(medico.getCrm());

        if (medico.getTipoConsulta() != null) {
            // Nome para exibição na tabela (Ex: "Cardiologista")
            dto.setSpecialty(medico.getTipoConsulta().getNome());
            // [CORREÇÃO] ID para o formulário saber qual option selecionar
            dto.setSpecialtyId(medico.getTipoConsulta().getPublicId()); 
        } else {
            dto.setSpecialty(null);
            dto.setSpecialtyId(null);
        }

        if (medico.getPicture() != null) {
            dto.setPicture(medico.getPicture().getUrl());
        } else {
            dto.setPicture(null);
        }

        return dto;
    }
}