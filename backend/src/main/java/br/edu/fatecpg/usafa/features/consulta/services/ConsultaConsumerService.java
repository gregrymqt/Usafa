package br.edu.fatecpg.usafa.features.consulta.services;

import java.util.UUID;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import br.edu.fatecpg.usafa.config.queues.ConsultaQueueConfig;
import br.edu.fatecpg.usafa.document.ConsultaDocument;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaMessageDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaRequestDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaSummaryDTO;
import br.edu.fatecpg.usafa.features.consulta.notifications.NotificationService;
import br.edu.fatecpg.usafa.features.consulta.repositories.IConsultaDocumentRepository;
import br.edu.fatecpg.usafa.features.consulta.utils.ConsultaConsumerHelper;
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

    // Repositórios e Serviços principais
    private final IConsultaDocumentRepository mongoRepository; 
    private final ICacheService cacheService; 
    private final NotificationService notificationService; 
    
    // Classe de utilidade injetada
    private final ConsultaConsumerHelper helper;

    /**
     * Escuta a fila de solicitações de consulta.
     */
    @RabbitListener(queues = ConsultaQueueConfig.CONSULTA_QUEUE_NAME) 
    public void handleConsultaRequest(ConsultaMessageDTO message) {
        log.info("Mensagem recebida da fila para o usuário: {}", message.getUserPublicId());
        ConsultaRequestDTO request = message.getRequestData(); 

        try {
            // 1. Validar e Buscar dados (usando o Helper)
            User user = helper.findUserOrThrow(message.getUserPublicId());
            Medico medico = helper.findMedicoOrThrow(UUID.fromString(request.getMedicoId()));
            TipoConsulta tipo = helper.findTipoConsultaOrThrow(UUID.fromString(request.getTipoId()));

            // 2. Executar Regras de Negócio
            if (!medico.getTipoConsulta().getId().equals(tipo.getId())) { 
                throw new BusinessRuleException("O médico selecionado não pertence a esta especialidade.");
            }

            // 3. Mapear para o Documento Mongo
            ConsultaDocument consultaDoc = new ConsultaDocument(request, user, medico, tipo); 
            
            // 4. Salvar no MongoDB
            ConsultaDocument savedDoc = mongoRepository.save(consultaDoc); 
            log.info("Solicitação de consulta salva no MongoDB com ID: {}", savedDoc.getId()); 
            // 5. Invalidar Caches (usando o Helper)
            cacheService.delete(helper.getConsultasCacheKey(user.getPublicId().toString())); 

            // 6. Enviar Notificação (usando o Helper)
            ConsultaSummaryDTO summary = helper.createSummaryFromDocument(savedDoc); 
            notificationService.sendConsultaConfirmation( 
                message.getUserPublicId(), 
                summary
            );
        } catch (BusinessRuleException e) {
            log.warn("Falha na regra de negócio: {}", e.getMessage()); 
        } catch (Exception e) {
            log.error("Erro inesperado ao processar consulta da fila", e); 
        }
    }
}