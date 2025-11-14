package br.edu.fatecpg.usafa.features.consulta.services;

import java.util.UUID;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import br.edu.fatecpg.usafa.config.queues.ConsultaQueueConfig;
import br.edu.fatecpg.usafa.document.ConsultaDocument;
import br.edu.fatecpg.usafa.features.Admin.repositories.IMedicoRepository;
import br.edu.fatecpg.usafa.features.Admin.repositories.ITipoConsultaRepository;
import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaMessageDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaRequestDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaSummaryDTO;
import br.edu.fatecpg.usafa.features.consulta.notifications.NotificationService;
import br.edu.fatecpg.usafa.features.consulta.repositories.ConsultaDocumentRepository;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Serviço Consumidor do RabbitMQ.
 * Escuta a fila de solicitações de consulta, valida os dados
 * (cruzando com o banco SQL) e salva no MongoDB.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ConsultaConsumerService {

    // Repositório Mongo
    private final ConsultaDocumentRepository mongoRepository;

    // Repositórios SQL (para validação)
    private final IUserRepository userRepository;
    private final IMedicoRepository medicoRepository;
    private final ITipoConsultaRepository tipoConsultaRepository;

    // Serviço de Cache (para invalidar)
    private final ICacheService cacheService;

    // Serviço de notifacação 
    private final NotificationService notificationService; 

    /**
     * Escuta a fila de solicitações de consulta.
     */
    @RabbitListener(queues = ConsultaQueueConfig.CONSULTA_QUEUE_NAME)
    public void handleConsultaRequest(ConsultaMessageDTO message) {
        log.info("Mensagem recebida da fila para o usuário: {}", message.getUserPublicId());
        ConsultaRequestDTO request = message.getRequestData();

        try {
            // 1. Validar e Buscar dados do banco SQL
            User user = findUserOrThrow(message.getUserPublicId());
            Medico medico = findMedicoOrThrow(UUID.fromString(request.getMedicoId()));
            TipoConsulta tipo = findTipoConsultaOrThrow(UUID.fromString(request.getTipoId()));

            // 2. Executar Regras de Negócio (ex: lógica do 'consultaService' )
            if (!medico.getTipoConsulta().getId().equals(tipo.getId())) {
                throw new BusinessRuleException("O médico selecionado não pertence a esta especialidade.");
            }
            // (Adicione outras validações, ex: horário vago, etc.)

            // 3. Mapear para o Documento Mongo
            ConsultaDocument consultaDoc = new ConsultaDocument(request, user, medico, tipo);

            // 4. Salvar no MongoDB
            ConsultaDocument savedDoc = mongoRepository.save(consultaDoc);
            log.info("Solicitação de consulta salva no MongoDB com ID: {}", savedDoc.getId());

            // 5. Invalidar Caches (se necessário)
            // (Ex: se o usuário tem um cache das suas consultas pendentes)
            cacheService.delete(getConsultasCacheKey(user.getPublicId().toString()));
            
            // 6. !! ENVIAR NOTIFICAÇÃO VIA WEBSOCKET !!
            // (Crie um método para mapear o 'savedDoc' para o 'ConsultaSummaryDTO')
            ConsultaSummaryDTO summary = createSummaryFromDocument(savedDoc);
            
            notificationService.sendConsultaConfirmation(
                message.getUserPublicId(), 
                summary
            );
        } catch (BusinessRuleException e) {
            log.warn("Falha na regra de negócio ao processar consulta da fila: {}. Mensagem: {}",
                    message, e.getMessage());
            // A mensagem será rejeitada e (se configurado) irá para uma Dead Letter Queue
        } catch (Exception e) {
            log.error("Erro inesperado ao processar consulta da fila. Mensagem: {}", message, e);
            // Rejeita a mensagem para possível nova tentativa
        }
    }

    // --- Métodos Auxiliares de Validação (SQL) ---

    private User findUserOrThrow(String publicId) {
        return userRepository.findByPublicId(UUID.fromString(publicId))
                .orElseThrow(() -> new BusinessRuleException("Usuário não encontrado: " + publicId));
    }

    private Medico findMedicoOrThrow(UUID publicId) {
        return medicoRepository.findByPublicId(publicId.toString())
                .orElseThrow(() -> new BusinessRuleException("Médico não encontrado: " + publicId));
    }

    private TipoConsulta findTipoConsultaOrThrow(UUID publicId) {
        return tipoConsultaRepository.findByPublicId(publicId.toString())
                .orElseThrow(() -> new BusinessRuleException("Tipo de consulta não encontrado: " + publicId));
    }

    private String getConsultasCacheKey(String userPublicId) {
        return "CONSULTAS_USER_" + userPublicId;
    }
    private ConsultaSummaryDTO createSummaryFromDocument(ConsultaDocument doc) {
        // Este protocolo é gerado pelo Mongo (o ID)
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
