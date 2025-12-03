package br.edu.fatecpg.usafa.features.admin.utils.appointment;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.admin.dtos.appointment.AppointmentResponseDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.Appointment.IAppointmentService;
import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.consulta.dtos.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.consulta.repositories.IHorarioSlotRepository;
import br.edu.fatecpg.usafa.features.consulta.repositories.ISolicitacaoConsultaRepository;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.SolicitacaoConsulta;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.webSockets.interfaces.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentMigrationService {

    // [MUDANÇA] Apenas repositórios SQL
    private final ISolicitacaoConsultaRepository sqlRepository;
    private final IHorarioSlotRepository horarioSlotRepository;
    private final INotificationService notificationService;
    private final IAppointmentService appointmentService; 
    // UserRepository removido pois já temos o User dentro da entidade SolicitacaoConsulta (JPA)

    /**
     * Transforma uma Solicitação SQL Pendente em uma Consulta Confirmada.
     */
    @Transactional
    public SolicitacaoConsulta processarAceite(SolicitacaoConsulta solicitacao, LocalDate dia, LocalTime horario) {
        log.info("Processando aceite da solicitação ID SQL {}.", solicitacao.getId());
        
        try {
            // 1. Valida Slot (SQL)
            LocalDateTime dataHora = LocalDateTime.of(dia, horario);
            HorarioSlot slot = horarioSlotRepository.findByMedicoPublicIdAndDataHoraInicio(
                    solicitacao.getMedico().getPublicId(), 
                    dataHora
            ).orElseThrow(() -> new BusinessRuleException("Slot de horário não encontrado ou indisponível para confirmação."));

            // 2. Prepara DTO para criar o agendamento oficial
            // Usamos os dados da própria entidade Solicitacao carregada
            AppointmentRequestDto sqlRequest = new AppointmentRequestDto();
            sqlRequest.setPatientId(solicitacao.getUser().getPublicId().toString());
            sqlRequest.setHorarioSlotId(slot.getPublicId().toString());
            sqlRequest.setTipoConsultaId(solicitacao.getTipoConsulta().getPublicId());
            sqlRequest.setSintomas(solicitacao.getSintomas());

            // 3. Cria a Consulta Oficial (Tabela Agendamentos/Consultas)
            // Passamos o usuário que já está carregado na solicitação
            AppointmentResponseDto summary = appointmentService.createAppointment(sqlRequest, solicitacao.getUser());
            
            log.info("Consulta criada com sucesso. Protocolo: {}", summary.getId());

            // 4. Atualiza a Solicitação original para ACEITA
            solicitacao.setStatus("ACEITA");
            solicitacao.setDia(dia);
            solicitacao.setHorario(horario);
            
            // [MUDANÇA] Salvamos a alteração no SQL
            SolicitacaoConsulta saved = sqlRepository.save(solicitacao);

            // 5. Notificação
            notificationService.send(
                solicitacao.getUser().getPublicId().toString(), 
                "CONSULTA_CONFIRMADA", 
                "Sua consulta foi agendada com sucesso!", 
                summary
            );

            return saved;

        } catch (BusinessRuleException be) {
            log.warn("Regra violada ao aceitar solicitação: {}", be.getMessage());
            notificationService.send(
                solicitacao.getUser().getPublicId().toString(),
                "AGENDAMENTO_FALHOU",
                be.getMessage(),
                null,
                "/queue/consultas"
            );
            throw be; 
        } catch (Exception e) {
            log.error("Erro crítico ao processar aceite da solicitação ID {}: {}", solicitacao.getId(), e.getMessage());
            throw new BusinessRuleException("Erro ao confirmar agendamento. Tente novamente.");
        }
    }

    /**
     * Apenas atualiza dados da solicitação (Ex: Recusa, ou mudança de horário sem aceite)
     */
    @Transactional
    public SolicitacaoConsulta atualizarSolicitacao(SolicitacaoConsulta solicitacao, LocalDate dia, LocalTime horario, String status) {
        solicitacao.setStatus(status);
        solicitacao.setDia(dia);
        solicitacao.setHorario(horario);
        return sqlRepository.save(solicitacao);
    }

    // Verifica se os dados são iguais para evitar processamento desnecessário
    public boolean isSameStatusAndDate(SolicitacaoConsulta entity, String status, LocalDate dia, LocalTime horario) {
        return entity.getStatus().equals(status) &&
               entity.getDia().equals(dia) &&
               entity.getHorario().equals(horario);
    }
}