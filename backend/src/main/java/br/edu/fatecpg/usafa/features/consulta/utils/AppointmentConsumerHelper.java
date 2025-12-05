package br.edu.fatecpg.usafa.features.consulta.utils;

import br.edu.fatecpg.usafa.features.admin.repositories.ITipoConsultaRepository;
import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.consulta.dtos.Admin.AppointmentAdminResponseDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.AppointmentOperationDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.User.AppointmentUserResponseDTO;
import br.edu.fatecpg.usafa.features.consulta.repositories.IHorarioSlotRepository;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.SolicitacaoConsulta;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.models.enums.StatusHorario;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;
@Component
@RequiredArgsConstructor
public class AppointmentConsumerHelper {

    private final IUserRepository userRepository;
    private final ITipoConsultaRepository tipoConsultaRepository;
    private final IHorarioSlotRepository horarioSlotRepository;
    private final AppointmentMapper mapper;

    public User findUserOrThrow(String publicId) {
        return userRepository.findByPublicId(UUID.fromString(publicId))
                .orElseThrow(() -> new BusinessRuleException("Usuário não encontrado: " + publicId));
    }

    public HorarioSlot findSlotOrThrow(String slotPublicId) {
        return horarioSlotRepository.findByPublicId(slotPublicId)
                .orElseThrow(() -> new BusinessRuleException("Horário selecionado não encontrado."));
    }

    public TipoConsulta findTipoConsultaOrThrow(String publicId) {
        return tipoConsultaRepository.findByPublicId(publicId)
                .orElseThrow(() -> new BusinessRuleException("Tipo de consulta não encontrado."));
    }

    public void validateSlotAvailability(HorarioSlot slot) {
        if (slot.getStatus() != StatusHorario.DISPONIVEL) {
            throw new BusinessRuleException("Este horário não está mais disponível.");
        }
    }

    public SolicitacaoConsulta createEntityFromSlot(AppointmentOperationDTO request, User user, HorarioSlot slot, TipoConsulta tipo) {
        SolicitacaoConsulta entity = new SolicitacaoConsulta();
        entity.setSintomas(request.getSintomas());
        entity.setStatus("PENDENTE");
        entity.setDia(slot.getDataHoraInicio().toLocalDate());
        entity.setHorario(slot.getDataHoraInicio().toLocalTime());
        entity.setUser(user);
        entity.setMedico(slot.getMedico());
        entity.setTipoConsulta(tipo);
        
        // Se sua entidade tiver PublicId, gere aqui:
        //entity.setPublicId(UUID.randomUUID());
        return entity;
    }

    public AppointmentAdminResponseDTO mapToAdminDto(SolicitacaoConsulta entity) {
        return mapper.requestToAdminDto(entity);
    }
    
    // [NOVO] Adicionado para corrigir erro no AppointmentRequestService
    public AppointmentUserResponseDTO mapToUserDto(SolicitacaoConsulta entity) {
        return mapper.requestToUserDto(entity);
    }
}