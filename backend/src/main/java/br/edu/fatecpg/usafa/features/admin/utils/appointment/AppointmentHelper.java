package br.edu.fatecpg.usafa.features.admin.utils.appointment;


import br.edu.fatecpg.usafa.features.admin.repositories.IMedicoRepository;
import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.consulta.enums.ConsultaStatus;
import br.edu.fatecpg.usafa.features.consulta.repositories.IConsultaRepository;
import br.edu.fatecpg.usafa.features.consulta.repositories.IHorarioSlotRepository;
import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;


/**
 * Classe auxiliar para o AppointmentService.
 * Responsável por buscar entidades relacionadas, validar regras de negócio
 * e fazer parsing de dados de entrada.
 */@Component
@RequiredArgsConstructor
public class AppointmentHelper {

    private final IUserRepository userRepository;
    private final IMedicoRepository medicoRepository; // [cite: 2]
    private final IConsultaRepository consultaRepository;
    private final IHorarioSlotRepository horarioSlotRepository; // Novo: Necessário para buscar slots

    /**
     * Busca um Paciente (User) pelo ID público (UUID).
     */
    public User findPatientByPublicId(String publicId) { // [cite: 3]
        try {
            return userRepository.findByPublicId(UUID.fromString(publicId))
                    .orElseThrow(() -> new BusinessRuleException("Paciente com ID " + publicId + " não encontrado"));
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("ID do paciente inválido (deve ser UUID).");
        }
    }

    /**
     * Busca um Médico pelo ID público (String/UUID dependendo da sua modelagem).
     */
    public Medico findDoctorByPublicId(String publicId) { // [cite: 5]
        return medicoRepository.findByPublicId(publicId)
                .orElseThrow(() -> new BusinessRuleException("Médico com ID " + publicId + " não encontrado"));
    }

    /**
     * Busca uma Consulta para edição.
     */
    public Consulta findConsultaByPublicId(String publicId) { // [cite: 7]
        return consultaRepository.findByPublicId(publicId)
                .orElseThrow(() -> new BusinessRuleException("Consulta com ID " + publicId + " não encontrada"));
    }

    /**
     * Busca um HorarioSlot pelo ID (Para o Admin trocar o horário manualmente).
     */
    public HorarioSlot findSlotById(Long slotId) {
        return horarioSlotRepository.findById(slotId)
                .orElseThrow(() -> new BusinessRuleException("Slot de horário com ID " + slotId + " não encontrado"));
    }

    /**
     * Utilitário para converter String em Enum de Status (Útil para Admin).
     */
        public ConsultaStatus parseStatus(String status) { // [cite: 14]
        if (status == null || status.isBlank()) return null;
        try {
            return ConsultaStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("Status inválido. Valores aceitos: AGENDADA, CONCLUIDA, CANCELADA.");
        }
    }
}