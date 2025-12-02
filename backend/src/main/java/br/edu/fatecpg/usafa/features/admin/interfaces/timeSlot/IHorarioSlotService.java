package br.edu.fatecpg.usafa.features.admin.interfaces.timeSlot;

import br.edu.fatecpg.usafa.features.admin.dtos.timeSlot.AtualizarSlotDTO;
import br.edu.fatecpg.usafa.features.admin.dtos.timeSlot.GerarAgendaDTO;

public interface IHorarioSlotService {
    void gerarAgenda(GerarAgendaDTO dados);
    void atualizarSlot(Long idSlot, AtualizarSlotDTO dados);
    void excluirSlot(Long idSlot);
    void excluirAgendaPorDia(String medicoId, String dataIso); // Bônus: Limpar o dia todo
}
