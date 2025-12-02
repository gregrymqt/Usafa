package br.edu.fatecpg.usafa.features.consulta.services;

import br.edu.fatecpg.usafa.document.RequestAppointment;
import br.edu.fatecpg.usafa.features.admin.dtos.appointment.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.consulta.utils.ConsultaConsumerHelper;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;
import br.edu.fatecpg.usafa.shared.exceptions.MongoConnectionException;
import br.edu.fatecpg.usafa.shared.webSockets.interfaces.INotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.MongoException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.consulta.dtos.RequestAppointmentResponseDto;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IConsultaConsumerService;
import br.edu.fatecpg.usafa.features.consulta.repositories.IConsultaDocumentRepository;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataAccessException;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConsultaConsumerService implements IConsultaConsumerService {

    private final IConsultaDocumentRepository mongoRepository; 
    private final ICacheService cacheService; 
    private final INotificationService notificationService; 
    private final ConsultaConsumerHelper helper; 
    private final ObjectMapper objectMapper; // Para converter o JSON do Redis

    /**
     * Método invocado pelo RedisMessageListenerContainer (via Adapter).
     * Recebe a mensagem bruta (JSON).
     */
    public void receiveMessage(String messageJson) {
        log.info("Redis: Mensagem recebida na fila de solicitações.");
        // Chama o processamento assíncrono para não travar o listener do Redis
        processarSolicitacaoAsync(messageJson);
    }

    /**
     * Processa a solicitação em uma thread separada.
     */
    @Async
    @Transactional // Garante consistência nas leituras do SQL
    public void processarSolicitacaoAsync(String messageJson) {
        AppointmentRequestDto request = null;
        try {
            // 1. Deserializa o JSON para o DTO novo (que tem horarioSlotId)
            request = objectMapper.readValue(messageJson, AppointmentRequestDto.class);
            log.info("Processando solicitação para o usuário: {}", request.getPatientId());

            // 2. Valida e Busca dados (SQL) usando o Helper
            User user = helper.findUserOrThrow(request.getPatientId());
            
            // Busca o Slot (que contém Médico e Data/Hora)
            HorarioSlot slot = helper.findSlotOrThrow(request.getHorarioSlotId());
            
            TipoConsulta tipo = helper.findTipoConsultaOrThrow(request.getTipoConsultaId());

            // 3. Executa Regras de Negócio
            // Verifica se o médico do slot atende o tipo de consulta solicitado
            if (!slot.getMedico().getTipoConsulta().getId().equals(tipo.getId())) {
                throw new BusinessRuleException("O médico selecionado não pertence a esta especialidade.");
            }
            
            // Verifica se o slot ainda está disponível (Proteção extra)
            helper.validateSlotAvailability(slot);

            // 4. Mapeia para o Documento Mongo (Staging Area)
            // O helper extrai os dados do Slot para preencher o documento corretamente
            RequestAppointment consultaDoc = helper.createDocumentFromSlot(request, user, slot, tipo);

            // 5. Salva no MongoDB
            RequestAppointment savedDoc = mongoRepository.save(consultaDoc); 
            log.info("Solicitação salva no MongoDB com ID: {}", savedDoc.getId());

            // 6. Invalida Caches
            cacheService.delete(helper.getConsultasCacheKey(user.getPublicId().toString()));

            // 7. Notifica o Usuário (Recebimento)
            // Usa o serviço genérico "send"
            notificationService.send(
                request.getPatientId(),
                "SOLICITACAO_RECEBIDA", 
                "Recebemos seu pedido! Aguardando confirmação da secretaria.",
                savedDoc,
                "/queue/consultas" // <--- ADICIONADO: Garante que vai para a fila que o React ouve
            );

        } catch (BusinessRuleException e) {
            log.warn("Regra de negócio violada (consumidor): {}", e.getMessage());
            if (request != null) {
                notificationService.send(
                    request.getPatientId(),
                    "SOLICITACAO_FALHOU",
                    e.getMessage(),
                    null,
                    "/queue/consultas"
                );
            }
        } catch (DataAccessException e) {
            if (e instanceof DataAccessResourceFailureException || e.getCause() instanceof MongoException) {
                log.error("Erro de conexão com o MongoDB ao salvar solicitação de agendamento.", e);
                throw new MongoConnectionException("Falha de comunicação com o banco de dados ao salvar a solicitação.", e);
            } else {
                log.error("Erro de banco de dados ao salvar solicitação de agendamento: {}", e.getMessage(), e);
                throw new DatabaseOperationException("Erro ao salvar a solicitação de agendamento.", e);
            }
        } catch (Exception e) {
            log.error("Erro crítico ao processar solicitação do Redis", e);
        }
    }
    
    public Page<RequestAppointmentResponseDto> findByUserPublicIdAndStatus(String userPublicId, String status, Pageable pageable) {
        
        Page<RequestAppointment> pageResult;

        // 1. Decide qual query usar (com ou sem filtro de status)
        if (status != null && !status.trim().isEmpty()) {
            pageResult = mongoRepository.findByUserPublicIdAndStatus(userPublicId, status, pageable);
        } else {
            pageResult = mongoRepository.findByUserPublicId(userPublicId, pageable);
        }

        // 2. Converte (Map) de Documento Mongo para DTO de Resposta
        return pageResult.map(helper::mapToDto);
    }


}