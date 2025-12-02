package br.edu.fatecpg.usafa.features.admin.utils.timeSlot;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;

@Component
public class HorarioSlotHelper {

    public void validarIntervaloTempo(LocalDateTime inicio, LocalDateTime fim, Integer duracao) {
        if (inicio == null || fim == null) {
            throw new BusinessRuleException("As datas de início e fim são obrigatórias.");
        }
        
        if (inicio.isAfter(fim)) {
            throw new BusinessRuleException("A data de início não pode ser posterior à data de fim.");
        }

        if (inicio.isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("Não é possível gerar agenda para datas passadas.");
        }

        if (duracao == null || duracao < 15) {
            throw new BusinessRuleException("A duração mínima da consulta deve ser de 15 minutos.");
        }
    }
}