package br.edu.fatecpg.usafa.features.consulta.utils;

import br.edu.fatecpg.usafa.features.admin.dtos.appointment.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.admin.repositories.ITipoConsultaRepository;
import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.consulta.dtos.RequestAppointmentResponseDto;
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
public class ConsultaConsumerHelper {

    private final IUserRepository userRepository;
    private final ITipoConsultaRepository tipoConsultaRepository;
    private final IHorarioSlotRepository horarioSlotRepository;

    public User findUserOrThrow(String publicId) {
        return userRepository.findByPublicId(UUID.fromString(publicId))
                .orElseThrow(() -> new BusinessRuleException("Usuário não encontrado: " + publicId));
    }

    public HorarioSlot findSlotOrThrow(String slotPublicId) {
        return horarioSlotRepository.findByPublicId(slotPublicId)
                .orElseThrow(() -> new BusinessRuleException("Horário selecionado não encontrado ou inválido."));
    }

    public TipoConsulta findTipoConsultaOrThrow(String publicId) {
        return tipoConsultaRepository.findByPublicId(publicId)
                .orElseThrow(() -> new BusinessRuleException("Tipo de consulta não encontrado."));
    }

    public void validateSlotAvailability(HorarioSlot slot) {
        // [cite: 51] Lógica mantida
        if (slot.getStatus() != StatusHorario.DISPONIVEL) {
            throw new BusinessRuleException("Este horário não está mais disponível.");
        }
    }

    public String getConsultasCacheKey(String userPublicId) {
        return "CONSULTAS_USER_" + userPublicId;
    }

    /**
     * [MUDANÇA] Cria a Entidade SQL (SolicitacaoConsulta).
     * Preenche os dados usando setters ou construtor.
     */
    public SolicitacaoConsulta createEntityFromSlot(AppointmentRequestDto request, User user, HorarioSlot slot, TipoConsulta tipo) {
        SolicitacaoConsulta entity = new SolicitacaoConsulta();
        
        // Dados da Requisição
        entity.setSintomas(request.getSintomas());
        entity.setStatus("PENDENTE");

        // Dados Temporais (Vêm do Slot SQL)
        entity.setDia(slot.getDataHoraInicio().toLocalDate());
        entity.setHorario(slot.getDataHoraInicio().toLocalTime());

        // Relacionamentos (JPA)
        entity.setUser(user);
        entity.setMedico(slot.getMedico());
        entity.setTipoConsulta(tipo);

        return entity;
    }

    /**
     * [MUDANÇA] Mapeia uma Entidade SQL para o DTO de Resposta.
     * Agora acessamos os nomes através dos relacionamentos do objeto (getMedico().getNome()).
     */
    public RequestAppointmentResponseDto mapToDto(SolicitacaoConsulta entity) {
        return RequestAppointmentResponseDto.builder()
            .id(entity.getId().toString()) // O ID SQL é Long, convertemos para String para o DTO
            .sintomas(entity.getSintomas())
            .dia(entity.getDia())
            .horario(entity.getHorario())
            .status(entity.getStatus())
            
            // IDs Públicos (Navegando pelos objetos relacionados)
            .userPublicId(entity.getUser().getPublicId().toString())
            .medicoPublicId(entity.getMedico().getPublicId())
            .tipoConsultaPublicId(entity.getTipoConsulta().getPublicId())
            
            // Nomes (Desnormalização para o Frontend)
            // CUIDADO: Isso exige que as entidades estejam carregadas (Session aberta/Transactional)
            .patientName(entity.getUser().getName())
            .doctorName(entity.getMedico().getNome())
            .appointmentTypeName(entity.getTipoConsulta().getNome())
            .build();
    }
}