package br.edu.fatecpg.usafa.features.admin.dtos.timeSlot;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record GerarAgendaDTO(
    String medicoId,         // PublicID do médico
    LocalDateTime inicio,    // Ex: 2025-12-05T08:00:00
    LocalDateTime fim,       // Ex: 2025-12-05T12:00:00
    Integer duracaoMinutos   // Ex: 30
) {}
