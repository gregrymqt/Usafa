package br.edu.fatecpg.usafa.features.consulta.services;

import br.edu.fatecpg.usafa.features.admin.dtos.appointment.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.consulta.utils.ConsultaConsumerHelper;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.SolicitacaoConsulta;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;
import br.edu.fatecpg.usafa.shared.webSockets.interfaces.INotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.consulta.dtos.RequestAppointmentResponseDto;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IConsultaConsumerService;
import br.edu.fatecpg.usafa.features.consulta.repositories.ISolicitacaoConsultaRepository;


import java.util.UUID;

import org.springframework.dao.DataAccessException;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IConsultaService;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConsultaConsumerService implements IConsultaConsumerService {

    // [MUDANÇA] Injetamos o repositório SQL em vez do Mongo [cite: 1]
    private final ISolicitacaoConsultaRepository sqlRepository; 
    private final ICacheService cacheService;
    private final INotificationService notificationService; 
    private final ConsultaConsumerHelper helper; 
    private final ObjectMapper objectMapper;

    public void receiveMessage(String messageJson) {
        log.info("Redis: Mensagem recebida na fila de solicitações.");
        processarSolicitacaoAsync(messageJson);
    }

    @Async
    @Transactional // Essencial para o JPA/SQL
    public void processarSolicitacaoAsync(String messageJson) {
        AppointmentRequestDto request = null;
        try {
            // 1. Deserializa
            request = objectMapper.readValue(messageJson, AppointmentRequestDto.class);
            log.info("Processando solicitação para o usuário: {}", request.getPatientId());

            // 2. Valida e Busca dados (SQL) - Mantém a lógica existente do Helper [cite: 11, 12, 13]
            User user = helper.findUserOrThrow(request.getPatientId());
            HorarioSlot slot = helper.findSlotOrThrow(request.getHorarioSlotId());
            TipoConsulta tipo = helper.findTipoConsultaOrThrow(request.getTipoConsultaId());

            // 3. Executa Regras de Negócio [cite: 14]
            if (!slot.getMedico().getTipoConsulta().getId().equals(tipo.getId())) {
                throw new BusinessRuleException("O médico selecionado não pertence a esta especialidade.");
            }
            helper.validateSlotAvailability(slot);

            // [MUDANÇA] 4. Cria a Entidade SQL (não mais Documento Mongo)
            SolicitacaoConsulta novaSolicitacao = helper.createEntityFromSlot(request, user, slot, tipo);

            // [MUDANÇA] 5. Salva no Banco SQL (Postgres/MySQL)
            SolicitacaoConsulta savedEntity = sqlRepository.save(novaSolicitacao);
            log.info("Solicitação salva no SQL com ID: {}", savedEntity.getId());

            // 6. Invalida Caches
            cacheService.delete(helper.getConsultasCacheKey(user.getPublicId().toString()));

            // [MUDANÇA] 7. Notifica o Usuário
            // Convertemos para DTO aqui para evitar enviar a Entidade JPA bruta (que pode dar erro de Lazy Loading no JSON)
            RequestAppointmentResponseDto responseDto = helper.mapToDto(savedEntity);

            notificationService.send(
                request.getPatientId(),
                "SOLICITACAO_RECEBIDA", 
                "Recebemos seu pedido! Aguardando confirmação da secretaria.",
                responseDto, // Envia o DTO formatado
                "/queue/consultas"
            );

        } catch (BusinessRuleException e) {
            log.warn("Regra de negócio violada (consumidor): {}", e.getMessage());
            if (request != null) {
                notificationService.send(
                    request.getPatientId(), "SOLICITACAO_FALHOU", e.getMessage(), null, "/queue/consultas"
                );
            }
        } catch (DataAccessException e) {
            log.error("Erro de banco de dados ao salvar solicitação: {}", e.getMessage(), e);
            throw new DatabaseOperationException("Erro ao salvar a solicitação de agendamento.", e);
        } catch (Exception e) {
            log.error("Erro crítico ao processar solicitação do Redis", e);
        }
    }
    
    // [MUDANÇA] Lógica de busca adaptada para SQL e conversão de UUID
    public Page<RequestAppointmentResponseDto> findByUserPublicIdAndStatus(String userPublicId, String status, Pageable pageable) {
        
        Page<SolicitacaoConsulta> pageResult;
        UUID uuidUser = UUID.fromString(userPublicId); // O repositório SQL espera UUID 

        if (status != null && !status.trim().isEmpty()) {
            pageResult = sqlRepository.findByUser_PublicIdAndStatus(uuidUser, status, pageable);
        } else {
            pageResult = sqlRepository.findByUser_PublicId(uuidUser, pageable);
        }

        // Converte de Entidade SQL para DTO de Resposta
        return pageResult.map(helper::mapToDto);
    }
}