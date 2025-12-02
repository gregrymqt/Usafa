package br.edu.fatecpg.usafa.features.admin.services.timeSlot;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.admin.dtos.timeSlot.AtualizarSlotDTO;
import br.edu.fatecpg.usafa.features.admin.dtos.timeSlot.GerarAgendaDTO;
import br.edu.fatecpg.usafa.features.admin.interfaces.timeSlot.IHorarioSlotService;
import br.edu.fatecpg.usafa.features.admin.utils.doctor.DoctorHelper;
import br.edu.fatecpg.usafa.features.admin.utils.timeSlot.HorarioSlotHelper;
import br.edu.fatecpg.usafa.features.consulta.repositories.IHorarioSlotRepository;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.enums.StatusHorario;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class HorarioSlotServiceImpl implements IHorarioSlotService {

    private final IHorarioSlotRepository slotRepository;
    private final DoctorHelper helperService; // Usa seu helper existente para buscar Médico
    private final HorarioSlotHelper slotHelper; // Usa o novo helper para validar datas

    @Override
    @Transactional
    public void gerarAgenda(GerarAgendaDTO dados) {
        log.info("Iniciando geração de agenda para o médico ID: {}", dados.medicoId());

        // 1. Validações
        slotHelper.validarIntervaloTempo(dados.inicio(), dados.fim(), dados.duracaoMinutos());

        // 2. Busca o Médico (Usa seu HelperService existente)
        Medico medico = helperService.findDoctorByPublicId(dados.medicoId());

        // 3. Algoritmo de Geração (Loop)
        LocalDateTime cursor = dados.inicio();
        int slotsCriados = 0;

        // Enquanto o horário atual + duração for menor ou igual ao fim do expediente
        while (cursor.plusMinutes(dados.duracaoMinutos()).isBefore(dados.fim()) || 
               cursor.plusMinutes(dados.duracaoMinutos()).isEqual(dados.fim())) {

            LocalDateTime fimSlot = cursor.plusMinutes(dados.duracaoMinutos());

            // Verifica se já existe slot nesse horário para evitar sobreposição
            boolean existeSlot = slotRepository
                .findByMedicoPublicIdAndDataHoraInicio(dados.medicoId(), cursor)
                .isPresent();

            if (!existeSlot) {
                HorarioSlot slot = new HorarioSlot(medico, cursor, fimSlot);
                // Define valor se foi passado, senão usa lógica padrão (ou null)
                // slot.setValor(dados.valorConsulta()); 
                
                slotRepository.save(slot);
                slotsCriados++;
            }

            // Avança o cursor para o próximo horário
            cursor = cursor.plusMinutes(dados.duracaoMinutos());
        }

        if (slotsCriados == 0) {
            log.warn("Nenhum slot foi criado. Verifique se já existiam horários ou se o intervalo é válido.");
        } else {
            log.info("Agenda gerada com sucesso! Total de slots criados: {}", slotsCriados);
        }
    }
@Override
    @Transactional
    public void atualizarSlot(Long idSlot, AtualizarSlotDTO dados) {
        HorarioSlot slot = buscarSlotPorId(idSlot);

        // REGRA: Não altera slot se já tiver consulta marcada
        if (slot.getStatus() == StatusHorario.AGENDADO || slot.getStatus() == StatusHorario.FINALIZADO) {
            throw new BusinessRuleException("Não é possível alterar um horário que já possui agendamento.");
        }
        
        if (dados.novoStatus() != null) {
            // Impede que o admin force "AGENDADO" manualmente sem passar pelo fluxo de consulta
            if (dados.novoStatus() == StatusHorario.AGENDADO) {
                 throw new BusinessRuleException("Para agendar, utilize o fluxo de criar Consulta.");
            }
            slot.setStatus(dados.novoStatus());
        }

        slotRepository.save(slot);
    }

    @Override
    @Transactional
    public void excluirSlot(Long idSlot) {
        HorarioSlot slot = buscarSlotPorId(idSlot);

        // REGRA: Não deleta slot com agendamento. O correto é cancelar a consulta antes.
        if (slot.getStatus() != StatusHorario.DISPONIVEL && slot.getStatus() != StatusHorario.BLOQUEADO) {
            throw new BusinessRuleException("Este horário possui um agendamento ativo e não pode ser excluído.");
        }

        slotRepository.delete(slot);
    }

    // Método auxiliar privado para evitar repetição de código
    private HorarioSlot buscarSlotPorId(Long id) {
        return slotRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Slot de horário não encontrado."));
    }
    
    @Override
    @Transactional
    public void excluirAgendaPorDia(String medicoId, String dataIso) {
        // Implementação bônus: Excluir todos os slots LIVRES de um dia específico
        // Necessário converter dataIso para LocalDate e buscar no repo
    }
}