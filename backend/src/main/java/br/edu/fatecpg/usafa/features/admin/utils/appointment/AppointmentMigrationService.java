package br.edu.fatecpg.usafa.features.admin.utils.appointment;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.document.RequestAppointment;
import br.edu.fatecpg.usafa.features.admin.dtos.appointment.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.admin.dtos.appointment.AppointmentResponseDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.Appointment.IAppointmentService;
import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.consulta.repositories.IConsultaDocumentRepository;
import br.edu.fatecpg.usafa.features.consulta.repositories.IHorarioSlotRepository;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.webSockets.interfaces.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service // Mudamos de @Component para @Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentMigrationService {

    private final IUserRepository userRepository;
    private final IHorarioSlotRepository horarioSlotRepository;
    private final INotificationService notificationService;
    private final IConsultaDocumentRepository mongoRepository; // [cite: 2]
    private final IAppointmentService appointmentService;

    /**
     * Orquestra a migração do MongoDB (Staging) para o SQL (Produção)
     * Antigo método 'processarAceite' [cite: 8]
     */
    @Transactional // Garante atomicidade nas operações SQL
    public RequestAppointment migrarParaSql(RequestAppointment doc, LocalDate dia, LocalTime horario) {
        log.info("Iniciando migração da solicitação ID {} para SQL.", doc.getId());

        try {
            // 1. Buscas e Validações (SQL)
            User user = userRepository.findByPublicId(UUID.fromString(doc.getUserPublicId()))
                    .orElseThrow(() -> new BusinessRuleException("Usuário não encontrado na base SQL.")); // [cite: 3]

            LocalDateTime dataHora = LocalDateTime.of(dia, horario);
            HorarioSlot slot = horarioSlotRepository.findByMedicoPublicIdAndDataHoraInicio(doc.getMedicoPublicId(), dataHora)
                    .orElseThrow(() -> new BusinessRuleException("Slot de horário não encontrado ou indisponível.")); // [cite: 4]

            // 2. Prepara DTO para o SQL Service
            AppointmentRequestDto sqlRequest = new AppointmentRequestDto();
            sqlRequest.setPatientId(doc.getUserPublicId());
            sqlRequest.setHorarioSlotId(slot.getId());
            sqlRequest.setTipoConsultaId(doc.getTipoConsultaPublicId());
            sqlRequest.setSintomas(doc.getSintomas()); // [cite: 6]

            // 3. Executa Gravação no SQL (Core Business)
            AppointmentResponseDto summary = appointmentService.createAppointment(sqlRequest, user); // [cite: 11]
            log.info("Consulta persistida no SQL com sucesso. Protocolo: {}", summary.getId()); // [cite: 12]

            // 4. Notificação
            notificationService.send(doc.getUserPublicId(), "CONSULTA_CONFIRMADA", 
                "Sua consulta foi agendada com sucesso!", summary);

            // 5. Limpeza do MongoDB (Safe Delete)
            try {
                mongoRepository.delete(doc); // [cite: 12]
            } catch (Exception e) {
                // Se falhar aqui, NÃO lançamos erro para não dar rollback no SQL (que já funcionou).
                // O ideal é ter um Job que limpa registros duplicados depois.
                log.error("ATENÇÃO: Consulta agendada no SQL, mas falha ao deletar do Mongo ID: {}", doc.getId());
                // Opcional: doc.setStatus("MIGRADO_COM_ERRO_DELETE"); mongoRepository.save(doc);
            }

            // Retorna o objeto atualizado apenas para a resposta da API (visual)
            doc.setStatus("ACEITA");
            return doc;

        } catch (BusinessRuleException be) {
            throw be; // Regras de negócio sobem normalmente
        } catch (Exception e) {
            log.error("Erro crítico na migração ID {}: {}", doc.getId(), e.getMessage());
            throw new BusinessRuleException("Erro ao processar agendamento. Tente novamente."); // [cite: 16]
        }
    }

    // Método utilitário mantido
    public boolean isSameStatusAndDate(RequestAppointment doc, String status, LocalDate dia, LocalTime horario) {
        return doc.getStatus().equals(status) &&
               doc.getDia().equals(dia) &&
               doc.getHorario().equals(horario); // [cite: 7]
    }
    
    // Atualização simples no Mongo (Rejeição ou mudança de horário sem aceite)
    public RequestAppointment atualizarRascunhoMongo(RequestAppointment doc, LocalDate dia, LocalTime horario, String status) {
        doc.setStatus(status);
        doc.setDia(dia);
        doc.setHorario(horario);
        return mongoRepository.save(doc); // [cite: 18]
    }
}