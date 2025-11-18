package br.edu.fatecpg.usafa.features.Admin.services;



import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.document.ConsultaDocument;
import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.UpdateAppointmentDTO;
import br.edu.fatecpg.usafa.features.Admin.interfaces.IAppointmentConsumerService;
import br.edu.fatecpg.usafa.features.Admin.interfaces.IAppointmentService;
import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaSummaryDTO;
import br.edu.fatecpg.usafa.features.consulta.repositories.IConsultaDocumentRepository;
import br.edu.fatecpg.usafa.features.consulta.repositories.IHorarioSlotRepository;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.webSockets.interfaces.INotificationService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentConsumerServiceImpl implements IAppointmentConsumerService {

    // Repositórios Mongo (Staging)
    private final IConsultaDocumentRepository mongoRepository;

    // Repositórios SQL (Oficial)
    private final IUserRepository userRepository;
    private final IHorarioSlotRepository horarioSlotRepository; // ADICIONADO: Necessário para achar o slot

    // Serviços
    private final IAppointmentService appointmentService; // Serviço que salva no SQL
    private final INotificationService notificationService;
    
    // Helper (opcional, se ainda estiver usando para formatação de notificação)
    // private final ConsultaConsumerHelper consultaHelper; 

    @Override
    public List<ConsultaDocument> getAllConsultaRequests() {
        log.info("Admin: buscando todas as solicitações de consulta do MongoDB");
        return mongoRepository.findAll(Sort.by(Sort.Direction.DESC, "dia", "horario"));
    }

    @Override
    @Transactional // Garante atomicidade (SQL Insert + Mongo Delete)
    public ConsultaDocument updateConsultaStatus(String consultaId, UpdateAppointmentDTO dto) {
        log.info("Processando atualização para solicitação ID: {}", consultaId);

        // 1. Busca o documento no Mongo
        ConsultaDocument doc = mongoRepository.findById(consultaId)
                .orElseThrow(() -> new BusinessRuleException("Solicitação não encontrada: " + consultaId));

        LocalDate dtoDia = LocalDate.parse(dto.dia());
        LocalTime dtoHorario = LocalTime.parse(dto.horario());
        String dtoStatus = dto.status().toUpperCase();

        // 2. REGRA 1: VERIFICA SE HÁ MUDANÇAS
        boolean hasChanged = !(doc.getStatus().equals(dtoStatus) &&
                doc.getDia().equals(dtoDia) &&
                doc.getHorario().equals(dtoHorario));

        if (!hasChanged) {
            log.info("Nenhuma mudança detectada para ID: {}. Retornando.", consultaId);
            return doc;
        }

        // 3. REGRA 2: STATUS "ACEITA" (Mover do Mongo para o SQL)
        if ("ACEITA".equals(dtoStatus)) {
            return processarAceite(doc, dtoDia, dtoHorario);
        }

        // 4. REGRA 3: OUTROS STATUS (Apenas atualiza o Mongo)
        return processarAtualizacaoMongo(doc, dtoDia, dtoHorario, dtoStatus);
    }

    /**
     * Método auxiliar para lidar com a migração para o SQL
     */
    private ConsultaDocument processarAceite(ConsultaDocument doc, LocalDate dia, LocalTime horario) {
        log.info("Status 'ACEITA'. Movendo solicitação {} para SQL.", doc.getId());

        // 3.1 Busca Usuário
        User user = userRepository.findByPublicId(UUID.fromString(doc.getUserPublicId()))
                .orElseThrow(() -> new BusinessRuleException("Usuário não encontrado no SQL."));

        // 3.2 Busca o Slot Correspondente (A Ponte entre Mongo e SQL) [cite: 16, 17]
        // Precisamos encontrar qual HorarioSlot corresponde ao dia/hora/médico que o Admin aceitou.
        LocalDateTime dataHora = LocalDateTime.of(dia, horario);
        
        // OBS: Você precisará garantir que seu repository tenha este método ou similar
        // Long medicoId = ... (precisaria converter o PublicID do médico para ID interno ou buscar pelo PublicId no repository)
        // Assumindo que você tem um método que busca pelo PublicId do médico:
        HorarioSlot slot = horarioSlotRepository.findByMedicoPublicIdAndDataHoraInicio(doc.getMedicoPublicId(), dataHora)
                .orElseThrow(() -> new BusinessRuleException("Erro: Não existe um Slot de horário criado no sistema para " + dia + " às " + horario + ". Crie o horário na agenda do médico antes de aceitar a solicitação."));

        // 3.3 Cria o DTO correto para o serviço SQL
        AppointmentRequestDto sqlRequest = new AppointmentRequestDto();
        sqlRequest.setPatientId(doc.getUserPublicId()); // String UUID
        sqlRequest.setHorarioSlotId(slot.getId());      // ID do Slot encontrado
        sqlRequest.setTipoConsultaId(doc.getTipoConsultaPublicId());
        sqlRequest.setSintomas(doc.getSintomas());

        try {
            // 3.4 Chama o serviço SQL
            ConsultaSummaryDTO summary = appointmentService.createAppointment(sqlRequest, user);
            log.info("Consulta criada no SQL. Protocolo: {}", summary.getProtocolo());

            // 3.5 Remove do Mongo e Notifica
            mongoRepository.delete(doc);
            log.info("Solicitação removida do MongoDB.");
            
            notificationService.send(
                        doc.getUserPublicId(),              // Para quem?
                        "CONSULTA_CONFIRMADA",              // Tipo (Front usa isso no switch/case)
                        "Sua consulta foi agendada com sucesso!", // Mensagem (opcional)
                        summary                             // Payload (O DTO completo)
                    );

            // Retorna o doc atualizado apenas para feedback visual imediato (embora tenha sido deletado)
            doc.setStatus("ACEITA");
            return doc;

        } catch (Exception e) {
            log.error("Falha ao migrar para SQL: {}", e.getMessage());
            throw new BusinessRuleException("Erro ao confirmar consulta no sistema principal: " + e.getMessage());
        }
    }

    /**
     * Método auxiliar para atualizações que ficam apenas no Mongo (Recusada/Pendente)
     */
    private ConsultaDocument processarAtualizacaoMongo(ConsultaDocument doc, LocalDate dia, LocalTime horario, String status) {
        log.info("Atualizando Mongo ID {} para status {}", doc.getId(), status);
        
        doc.setStatus(status);
        doc.setDia(dia);
        doc.setHorario(horario);

        ConsultaDocument savedDoc = mongoRepository.save(doc);
        
        // Opcional: Notificar usuário sobre recusa ou mudança de horário proposta
        // notificationService.sendStatusUpdate(doc.getUserPublicId(), status);

        return savedDoc;
    }

    @Override
    public void deleteConsultaRequest(String consultaId) {
        if (!mongoRepository.existsById(consultaId)) {
            throw new BusinessRuleException("Solicitação não encontrada: " + consultaId);
        }
        mongoRepository.deleteById(consultaId);
        log.info("Solicitação ID: {} deletada.", consultaId);
    }
}