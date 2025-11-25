package br.edu.fatecpg.usafa.features.consulta.services;

import br.edu.fatecpg.usafa.document.RequestAppointment;
import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.consulta.utils.ConsultaConsumerHelper;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.webSockets.interfaces.INotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.consulta.repositories.IConsultaDocumentRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConsultaConsumerService {

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
        try {
            // 1. Deserializa o JSON para o DTO novo (que tem horarioSlotId)
            AppointmentRequestDto request = objectMapper.readValue(messageJson, AppointmentRequestDto.class);
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
            // Aqui você poderia notificar o usuário sobre o erro via WebSocket também
        } catch (Exception e) {
            log.error("Erro crítico ao processar solicitação do Redis", e);
        }
    }
}