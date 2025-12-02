package br.edu.fatecpg.usafa.features.admin.dtos.timeSlot;

import java.math.BigDecimal;

import br.edu.fatecpg.usafa.models.enums.StatusHorario;

public record AtualizarSlotDTO(
    StatusHorario novoStatus   // Opcional: bloquear manualmente (ex: BLOQUEADO)
) {}
