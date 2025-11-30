package br.edu.fatecpg.usafa.features.admin.utils.appointment;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import org.springframework.stereotype.Component;

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

@RequiredArgsConstructor
@Component
@Slf4j
public class AppointmentConsumerHelper {

    private final IUserRepository userRepository;
    private final IHorarioSlotRepository horarioSlotRepository;
    private final INotificationService notificationService;
    private final IConsultaDocumentRepository mongoRepository;
    private final IAppointmentService appointmentService;


    public User buscarUsuarioNoSql(String userPublicId) {
        return userRepository.findByPublicId(UUID.fromString(userPublicId))
                .orElseThrow(() -> new BusinessRuleException("Usuário não encontrado na base de dados SQL."));
    }

    public HorarioSlot buscarSlotDisponivel(String medicoPublicId, LocalDate dia, LocalTime horario) {
        LocalDateTime dataHora = LocalDateTime.of(dia, horario);
        return horarioSlotRepository.findByMedicoPublicIdAndDataHoraInicio(medicoPublicId, dataHora)
                .orElseThrow(() -> new BusinessRuleException(
                        String.format("Agenda não encontrada para o médico na data %s às %s. Crie o horário antes de aceitar.", dia, horario)
                ));
    }

    public AppointmentRequestDto montarRequestSql(RequestAppointment doc, HorarioSlot slot) {
        AppointmentRequestDto sqlRequest = new AppointmentRequestDto();
        sqlRequest.setPatientId(doc.getUserPublicId());
        sqlRequest.setHorarioSlotId(slot.getId());
        sqlRequest.setTipoConsultaId(doc.getTipoConsultaPublicId());
        sqlRequest.setSintomas(doc.getSintomas());
        return sqlRequest;
    }

    public void enviarNotificacaoSucesso(String userPublicId, AppointmentResponseDto summary) {
        notificationService.send(
                userPublicId,
                "CONSULTA_CONFIRMADA",
                "Sua consulta foi agendada com sucesso!",
                summary
        );
    }


    public boolean isSameStatusAndDate(RequestAppointment doc, String status, LocalDate dia, LocalTime horario) {
        return doc.getStatus().equals(status) &&
               doc.getDia().equals(dia) &&
               doc.getHorario().equals(horario);
    }

    /**
     * Orquestra a migração do MongoDB (Staging) para o SQL (Produção)
     */
    public RequestAppointment processarAceite(RequestAppointment doc, LocalDate dia, LocalTime horario) {
        log.info("Status 'ACEITA'. Iniciando migração do ID {} para SQL.", doc.getId());

        try {
            // 1. Validações Prévias (Busca dados necessários antes de tentar gravar)
            User user = buscarUsuarioNoSql(doc.getUserPublicId());
            HorarioSlot slot = buscarSlotDisponivel(doc.getMedicoPublicId(), dia, horario);

            // 2. Prepara DTO
            AppointmentRequestDto sqlRequest = montarRequestSql(doc, slot);

            // 3. Executa Gravação no SQL (Core Business)
            AppointmentResponseDto summary = appointmentService.createAppointment(sqlRequest, user);
            log.info("Consulta persistida no SQL. Protocolo: {}", summary.getId());

            // 4. Limpeza e Notificação
            mongoRepository.delete(doc);
            enviarNotificacaoSucesso(doc.getUserPublicId(), summary);

            // Atualiza objeto em memória apenas para retorno da API
            doc.setStatus("ACEITA");
            return doc;

        } catch (BusinessRuleException be) {
            throw be; // Re-lança exceções de negócio conhecidas
        } catch (Exception e) {
            log.error("Erro crítico ao migrar consulta ID {} para SQL: {}", doc.getId(), e.getMessage(), e);
            // Encapsula erro genérico em regra de negócio legível
            throw new BusinessRuleException("Erro ao confirmar consulta no sistema principal. Verifique a disponibilidade do médico.");
        }
    }

    public RequestAppointment processarAtualizacaoMongo(RequestAppointment doc, LocalDate dia, LocalTime horario, String status) {
        log.info("Atualizando apenas MongoDB ID {} para status {}", doc.getId(), status);
        doc.setStatus(status);
        doc.setDia(dia);
        doc.setHorario(horario);
        return mongoRepository.save(doc);
    }

}


