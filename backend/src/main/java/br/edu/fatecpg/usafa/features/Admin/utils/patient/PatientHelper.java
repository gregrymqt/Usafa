package br.edu.fatecpg.usafa.features.Admin.utils.patient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.UUID;

import org.springframework.stereotype.Component;

import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.repository.IConsultaRepository;
import br.edu.fatecpg.usafa.repository.IUserRepository;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PatientHelper {

    private final IUserRepository userRepository;
    private final IConsultaRepository consultaRepository; // (Necessário para a validação de delete)

    /**
     * Busca um Paciente (User) pelo seu ID público (String) ou lança exceção.
     */
    public User findPatientByPublicId(String publicId) {
        UUID uuid = parsePublicId(publicId);
        return userRepository.findByPublicId(uuid) 
                .orElseThrow(() -> new BusinessRuleException("Paciente com ID " + publicId + " não encontrado")); 
    }

    /**
     * Valida se um paciente existe pelo seu ID público (String).
     */
    public void validatePatientExists(String publicId) {
        UUID uuid = parsePublicId(publicId);
        if (!userRepository.existsByPublicId(uuid)) { // (Método novo no IUserRepository)
            throw new BusinessRuleException("Paciente com ID " + publicId + " não encontrado"); 
        }
    }

    /**
     * Converte a String de data/hora ISO do DTO para o LocalDate da entidade.
     */
    public LocalDate parseBirthDate(String birthDateStr) {
        if (birthDateStr == null || birthDateStr.isBlank()) {
            return null;
        }
        try {
            // O front-end envia "1990-10-25T00:00:00Z" ou "1990-10-25"
            // Pega a data local, ignorando a parte da hora/fuso
            if (birthDateStr.contains("T")) {
                return LocalDateTime.parse(birthDateStr).toLocalDate();
            } else {
                return LocalDate.parse(birthDateStr);
            }
        } catch (DateTimeParseException e) {
            throw new BusinessRuleException("Formato de data de nascimento inválido. Use o padrão ISO.", e); 
        }
    }

    /**
     * REGRA DE NEGÓCIO: Verifica se o paciente possui consultas associadas.
     * (Impede a exclusão)
     */
    public void validatePatientHasNoAppointments(User user) {
        // (Requer IConsultaRepository.existsByUser(User user))
        if (consultaRepository.existsByUser(user)) {
            throw new BusinessRuleException("Este paciente não pode ser excluído pois possui consultas ativas.");
        }
    }

    /**
     * Converte e valida uma String de ID para UUID.
     */
    private UUID parsePublicId(String publicId) {
        try {
            return UUID.fromString(publicId);
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("Formato de ID inválido: " + publicId, e); 
        }
    }
}
