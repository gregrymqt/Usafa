package br.edu.fatecpg.usafa.features.consulta.utils;

import br.edu.fatecpg.usafa.document.ConsultaDocument;
import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.Admin.repositories.ITipoConsultaRepository;
import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.consulta.repositories.IHorarioSlotRepository;
import br.edu.fatecpg.usafa.models.HorarioSlot;
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
    private final IHorarioSlotRepository horarioSlotRepository; // Substitui IMedicoRepository direto

    public User findUserOrThrow(String publicId) {
        return userRepository.findByPublicId(UUID.fromString(publicId))
                .orElseThrow(() -> new BusinessRuleException("Usuário não encontrado: " + publicId));
    }

    /**
     * Busca o Slot de Horário pelo ID.
     * Substitui a busca manual de Médico, pois o Slot já contém o médico.
     */
    public HorarioSlot findSlotOrThrow(Long slotId) {
        return horarioSlotRepository.findById(slotId)
                .orElseThrow(() -> new BusinessRuleException("Horário selecionado não encontrado ou inválido."));
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

    public String getConsultasCacheKey(String userPublicId) {
        return "CONSULTAS_USER_" + userPublicId;
    }

    /**
     * Cria o Documento MongoDB extraindo dados do Slot SQL.
     */
    public ConsultaDocument createDocumentFromSlot(AppointmentRequestDto request, User user, HorarioSlot slot,
            TipoConsulta tipo) {
        ConsultaDocument doc = new ConsultaDocument();

        // Dados da Requisição
        doc.setSintomas(request.getSintomas());
        doc.setStatus("PENDENTE"); // Status inicial no Mongo

        // Dados Relacionais (SQL -> Mongo Flat)
        doc.setUserPublicId(user.getPublicId().toString());
        doc.setNomePaciente(user.getName());

        doc.setMedicoPublicId(slot.getMedico().getPublicId());
        doc.setNomeMedico(slot.getMedico().getNome());

        doc.setTipoConsultaPublicId(tipo.getPublicId());
        doc.setNomeTipoConsulta(tipo.getNome());

        // Dados Temporais (Vêm do Slot)
        doc.setDia(slot.getDataHoraInicio().toLocalDate());
        doc.setHorario(slot.getDataHoraInicio().toLocalTime());

        return doc;
    }
}