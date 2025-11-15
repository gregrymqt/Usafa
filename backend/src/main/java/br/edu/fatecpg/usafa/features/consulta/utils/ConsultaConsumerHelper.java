package br.edu.fatecpg.usafa.features.consulta.utils;

import java.util.UUID;

import org.springframework.stereotype.Component;

import br.edu.fatecpg.usafa.document.ConsultaDocument;
import br.edu.fatecpg.usafa.features.Admin.repositories.IMedicoRepository;
import br.edu.fatecpg.usafa.features.Admin.repositories.ITipoConsultaRepository;
import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaSummaryDTO;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ConsultaConsumerHelper {
// Repositórios SQL (para validação)
    private final IUserRepository userRepository;
    private final IMedicoRepository medicoRepository;
    private final ITipoConsultaRepository tipoConsultaRepository;

    /**
     * Busca um usuário pelo ID público (String) ou lança exceção.
     */
    public User findUserOrThrow(String publicId) {
        return userRepository.findByPublicId(UUID.fromString(publicId))
                .orElseThrow(() -> new BusinessRuleException("Usuário não encontrado: " + publicId));
    }

    /**
     * Busca um médico pelo ID público (UUID) ou lança exceção.
     */
    public Medico findMedicoOrThrow(UUID publicId) {
        // Corrigido: O repositório deve buscar por UUID, não por string
        return medicoRepository.findByPublicId(publicId.toString()) 
                .orElseThrow(() -> new BusinessRuleException("Médico não encontrado: " + publicId));
    }

    /**
     * Busca um tipo de consulta pelo ID público (UUID) ou lança exceção.
     */
    public TipoConsulta findTipoConsultaOrThrow(UUID publicId) {
        // Corrigido: O repositório deve buscar por UUID, não por string
        return tipoConsultaRepository.findByPublicId(publicId.toString())
                .orElseThrow(() -> new BusinessRuleException("Tipo de consulta não encontrado: " + publicId));
    }

    /**
     * Gera a chave de cache padrão para as consultas de um usuário.
     */
    public String getConsultasCacheKey(String userPublicId) {
        return "CONSULTAS_USER_" + userPublicId;
    }

    /**
     * Mapeia um ConsultaDocument (MongoDB) para um ConsultaSummaryDTO (WebSocket).
     */
    public ConsultaSummaryDTO createSummaryFromDocument(ConsultaDocument doc) {
        // Gera um protocolo curto a partir do ID do Mongo
        String protocolo = doc.getId().substring(doc.getId().length() - 8).toUpperCase();

        return new ConsultaSummaryDTO(
                protocolo,
                doc.getNomeMedico(),
                doc.getNomeTipoConsulta(),
                doc.getDia().toString(),
                doc.getHorario().toString(),
                doc.getNomePaciente(),
                doc.getSintomas()
        );
    }
}