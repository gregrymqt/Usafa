package br.edu.fatecpg.usafa.features.Admin.utils.appointment;


import br.edu.fatecpg.usafa.features.consulta.enums.ConsultaStatus;
import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.repository.IConsultaRepository;
import br.edu.fatecpg.usafa.repository.IMedicoRepository;
import br.edu.fatecpg.usafa.repository.IUserRepository;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Classe auxiliar para o AppointmentService.
 * Responsável por buscar entidades relacionadas, validar regras de negócio
 * e fazer parsing de dados de entrada.
 */
@Component // É um Bean do Spring que pode ser injetado
@RequiredArgsConstructor
public class AppointmentHelper {

    // Repositórios necessários para as validações
    private final IUserRepository userRepository;
    private final IMedicoRepository medicoRepository;
    private final IConsultaRepository consultaRepository;

    /**
     * Busca um Paciente (User) pelo seu ID público ou lança exceção.
     */
    public User findPatientByPublicId(String publicId) {
        return userRepository.findByPublicId(UUID.fromString(publicId))
                .orElseThrow(() -> new BusinessRuleException("Paciente com ID " + publicId + " não encontrado"));
    }

    /**
     * Busca um Médico (Medico) pelo seu ID público ou lança exceção.
     */
    public Medico findDoctorByPublicId(String publicId) {
        return medicoRepository.findByPublicId(publicId)
                .orElseThrow(() -> new BusinessRuleException("Médico com ID " + publicId + " não encontrado"));
    }

    /**
     * Busca uma Consulta (Consulta) pelo seu ID público ou lança exceção.
     */
    public Consulta findConsultaByPublicId(String publicId) {
        return consultaRepository.findByPublicId(publicId)
                .orElseThrow(() -> new BusinessRuleException("Consulta com ID " + publicId + " não encontrada"));
    }

    /**
     * Verifica se uma consulta existe pelo ID.
     */
    public void validateAppointmentExists(String publicId) {
        if (consultaRepository.existsByPublicId(publicId)) {
            throw new BusinessRuleException("Consulta com ID " + publicId + " não encontrada");
        }
    }

    /**
     * Converte um String ISO "2025-11-12T14:30:00" em LocalDateTime.
     */
    public LocalDateTime parseDateTime(String dateTime) {
        try {
            return LocalDateTime.parse(dateTime);
        } catch (Exception e) {
            throw new BusinessRuleException("Formato de data/hora inválido. Use o padrão ISO (YYYY-MM-DDTHH:MM:SS)", e);
        }
    }

    /**
     * Converte um String "Agendada" no Enum ConsultaStatus.AGENDADA.
     */
    public ConsultaStatus parseStatus(String status) {
        try {
            return ConsultaStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("Status de consulta inválido: " + status, e);
        }
    }

    /**
     * REGRA DE NEGÓCIO: Verifica se o médico já tem uma consulta nesse horário.
     */
    public void validateAppointmentSlot(Medico medico, LocalDate dia, LocalTime horario) {
        boolean slotTaken = consultaRepository.existsByMedicoAndDiaAndHorario(medico, dia, horario);
        if (slotTaken) {
            throw new BusinessRuleException("Este médico já possui uma consulta agendada para este dia e horário.");
        }
    }
}
