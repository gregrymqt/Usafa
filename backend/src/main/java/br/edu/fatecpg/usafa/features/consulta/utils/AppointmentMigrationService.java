package br.edu.fatecpg.usafa.features.consulta.utils;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.admin.repositories.IHorarioSlotRepository;
import br.edu.fatecpg.usafa.features.consulta.dtos.Admin.AppointmentAdminResponseDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.AppointmentOperationDTO;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IAppointmentService;
import br.edu.fatecpg.usafa.features.consulta.repositories.ISolicitacaoConsultaRepository;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.SolicitacaoConsulta;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.webSockets.interfaces.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentMigrationService {

    private final ISolicitacaoConsultaRepository sqlRepository;
    private final IHorarioSlotRepository horarioSlotRepository;
    // NotificationService Removido
    private final IAppointmentService appointmentService;

    @Transactional
    public SolicitacaoConsulta processarAceite(SolicitacaoConsulta solicitacao) {
        log.info("Processando aceite da solicitação ID SQL {}.", solicitacao.getId());

        try {
            LocalDateTime dataHoraSlot = LocalDateTime.of(solicitacao.getDia(), solicitacao.getHorario());

            // Nota: Atenção para o nome do método no Repository (sem underline)
            HorarioSlot slot = horarioSlotRepository.findByMedicoPublicIdAndDataHoraInicio(
                    solicitacao.getMedico().getPublicId(),
                    dataHoraSlot).orElseThrow(
                            () -> new BusinessRuleException("Slot de horário não encontrado para a data solicitada."));

            AppointmentOperationDTO operationDTO = new AppointmentOperationDTO();
            operationDTO.setPatientId(solicitacao.getUser().getPublicId().toString());
            operationDTO.setHorarioSlotId(slot.getPublicId().toString());
            operationDTO.setTipoConsultaId(solicitacao.getTipoConsulta().getPublicId());
            operationDTO.setSintomas(solicitacao.getSintomas());
            operationDTO.setStatus("AGENDADA");

            AppointmentAdminResponseDTO summary = appointmentService.createAppointment(operationDTO, solicitacao.getUser());

            log.info("Consulta criada com sucesso. ID: {}", summary.getId());

            solicitacao.setStatus("ACEITA");
            SolicitacaoConsulta saved = sqlRepository.save(solicitacao);

            // Notificações removidas
            return saved;

        } catch (BusinessRuleException be) {
            log.warn("Regra violada ao aceitar solicitação: {}", be.getMessage());
            // Notificação de erro removida
            throw be;
        } catch (Exception e) {
            log.error("Erro crítico ao processar aceite da solicitação ID {}: {}", solicitacao.getId(), e.getMessage());
            throw new BusinessRuleException("Erro ao confirmar agendamento. Tente novamente.");
        }
    }

    @Transactional
    public SolicitacaoConsulta atualizarSolicitacao(SolicitacaoConsulta solicitacao, String novoStatus) {
        solicitacao.setStatus(novoStatus);
        return sqlRepository.save(solicitacao);
    }
}