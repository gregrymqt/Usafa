package br.edu.fatecpg.usafa.features.admin.interfaces.timeSlot;

import java.util.List;

import br.edu.fatecpg.usafa.features.admin.dtos.timeSlot.AtualizarSlotDTO;
import br.edu.fatecpg.usafa.features.admin.dtos.timeSlot.GerarAgendaDTO;
import br.edu.fatecpg.usafa.models.HorarioSlot;

public interface IHorarioSlotService {
    void gerarAgenda(GerarAgendaDTO dados);
    void atualizarSlot(Long idSlot, AtualizarSlotDTO dados);
    void excluirSlot(Long idSlot);
    List<HorarioSlot> listarSlotsPorMedico(String medicoId, String dataOpcional);
}
