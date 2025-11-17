package br.edu.fatecpg.usafa.features.Admin.services;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.document.ConsultaDocument;
import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.UpdateAppointmentDTO;
import br.edu.fatecpg.usafa.features.Admin.interfaces.IAppointmentConsumerService;
import br.edu.fatecpg.usafa.features.Admin.interfaces.IAppointmentService;
import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaRequestDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaSummaryDTO;
import br.edu.fatecpg.usafa.features.consulta.notifications.NotificationService;
import br.edu.fatecpg.usafa.features.consulta.repositories.IConsultaDocumentRepository;
import br.edu.fatecpg.usafa.features.consulta.utils.ConsultaConsumerHelper;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentConsumerServiceImpl implements IAppointmentConsumerService { // Nome atualizado

    // Repositórios
    private final IConsultaDocumentRepository mongoRepository; // O "Staging" (Mongo)
    private final IUserRepository userRepository; // O "Oficial" (SQL)

    // Serviços
    private final IAppointmentService appointmentService; // Serviço que salva no SQL
    private final INotificationService notificationService;
    private final ConsultaConsumerHelper consultaHelper;

    /**
     * Gets all the as solicitaions of consulta from the MongoDB.
     * Orders by dia and horario to descend the most recent ones first.
     * Returns a List of ConsultaDocument objects.
     */

    @Override
    public List<ConsultaDocument> getAllConsultaRequests() {
        log.info("Admin: buscando todas as solicitações de consulta do MongoDB");
        // Ordena por dia e horário descendente (mais novos primeiro)
        return mongoRepository.findAll(Sort.by(Sort.Direction.DESC, "dia", "horario"));
    }

    @Override
    @Transactional // Garante que a operação (criar no SQL + deletar no Mongo) seja atômica
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
            log.info("Nenhuma mudança detectada para a solicitação ID: {}. Nenhuma ação tomada.", consultaId);
            return doc;
        }

        // 3. REGRA 2: STATUS "ACEITA" (Mover do Mongo para o SQL)
        if ("ACEITA".equals(dtoStatus)) {
            log.info("Status 'ACEITA' detectado. Movendo solicitação {} para o banco SQL.", consultaId);

            User user = userRepository.findByPublicId(UUID.fromString(doc.getUserPublicId()))
                    .orElseThrow(() -> new BusinessRuleException(
                            "Usuário da solicitação não encontrado no banco SQL: " + doc.getUserPublicId()));

            // Cria o DTO que o `appointmentService.createConsulta` espera
            ConsultaRequestDTO sqlRequest = new ConsultaRequestDTO();
            sqlRequest.setMedicoId(doc.getMedicoPublicId());
            sqlRequest.setTipoId(doc.getTipoConsultaPublicId());
            sqlRequest.setSintomas(doc.getSintomas());
            sqlRequest.setDia(dto.dia()); // Usa os dados ATUALIZADOS do DTO
            sqlRequest.setHorario(dto.horario()); // Usa os dados ATUALIZADOS do DTO

            try {
                // CHAMA O SERVIÇO DO SQL (que já lida com HorarioSlot)
                ConsultaSummaryDTO summary = appointmentService.createAppointment(sqlRequest, user);
                log.info("Consulta ID {} criada com sucesso no SQL.", consultaId);

                mongoRepository.delete(doc); // Limpa a solicitação do Mongo
                log.info("Solicitação ID {} removida do MongoDB.", consultaId);

                notificationService.sendConsultaConfirmation(doc.getUserPublicId(), summary);

                doc.setStatus("ACEITA"); // Apenas para retornar o DTO correto
                return doc;

            } catch (Exception e) {
                log.error("Falha ao mover consulta para SQL: {}", e.getMessage());
                throw new BusinessRuleException("Falha ao aceitar consulta (SQL): " + e.getMessage(), e);
            }
        }

        // 4. REGRA 3: STATUS "RECUSADA" OU "PENDENTE"
        // (Não apagamos, apenas atualizamos o Mongo)
        log.info("Atualizando documento {} no MongoDB para status: {}", consultaId, dtoStatus);
        doc.setStatus(dtoStatus);
        doc.setDia(dtoDia);
        doc.setHorario(dtoHorario);

        ConsultaDocument savedDoc = mongoRepository.save(doc);

        // Notifica o usuário sobre a mudança (ex: "RECUSADA")
        ConsultaSummaryDTO summary = consultaHelper.createSummaryFromDocument(savedDoc);
        notificationService.sendConsultaConfirmation(savedDoc.getUserPublicId(), summary);

        return savedDoc;
    }

    @Override
    public void deleteConsultaRequest(String consultaId) {
        if (!mongoRepository.existsById(consultaId)) {
            throw new BusinessRuleException("Solicitação não encontrada: " + consultaId);
        }
        mongoRepository.deleteById(consultaId);
        log.info("Solicitação ID: {} deletada com sucesso.", consultaId);
    }
}