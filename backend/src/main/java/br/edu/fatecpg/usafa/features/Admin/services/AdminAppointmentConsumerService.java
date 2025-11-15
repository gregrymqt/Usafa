package br.edu.fatecpg.usafa.features.Admin.services;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import br.edu.fatecpg.usafa.document.ConsultaDocument;
import br.edu.fatecpg.usafa.features.Admin.interfaces.IAdminAppointmentConsumerService;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaSummaryDTO;
import br.edu.fatecpg.usafa.features.consulta.notifications.NotificationService;
import br.edu.fatecpg.usafa.features.consulta.repositories.ConsultaDocumentRepository;
import br.edu.fatecpg.usafa.features.consulta.utils.ConsultaConsumerHelper;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminAppointmentConsumerService implements IAdminAppointmentConsumerService {

    // Repositório do MongoDB
    private final ConsultaDocumentRepository mongoRepository;
    
    // Serviço de WebSocket
    private final NotificationService notificationService;
    
    // Helper (para mapear o DTO de notificação)
    private final ConsultaConsumerHelper consultaHelper;

    /**
     * (Admin) Busca todas as solicitações de consulta do MongoDB.
     * Ordena pelas mais recentes.
     */
    @Override
    public List<ConsultaDocument> getAllConsultaRequests() {
        log.info("Admin: buscando todas as solicitações de consulta do MongoDB");
        // Ordena por dia e horário descendente (mais novos primeiro) [cite: 3]
        return mongoRepository.findAll(Sort.by(Sort.Direction.DESC, "dia", "horario")); 
    }

    /**
     * (Admin) Atualiza o status de uma solicitação de consulta.
     * Também notifica o usuário sobre a mudança. [cite: 5]
     */
    @Override
    public ConsultaDocument updateConsultaStatus(String consultaId, String newStatus) {
        log.info("Admin: atualizando status da consulta {} para {}", consultaId, newStatus);
        
        // 1. Busca o documento no Mongo [cite: 8]
        ConsultaDocument doc = mongoRepository.findById(consultaId)
                .orElseThrow(() -> new BusinessRuleException("Solicitação de consulta não encontrada: " + consultaId));
        
        // 2. Atualiza o status [cite: 9]
        doc.setStatus(newStatus.toUpperCase());
        ConsultaDocument savedDoc = mongoRepository.save(doc);

        // 3. Notifica o usuário (WebSocket) [cite: 10]
        ConsultaSummaryDTO summary = consultaHelper.createSummaryFromDocument(savedDoc);
        
        notificationService.sendConsultaConfirmation(
            savedDoc.getUserPublicId(), 
            summary
        );

        return savedDoc; 
    }
}
