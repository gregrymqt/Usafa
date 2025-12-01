package br.edu.fatecpg.usafa.features.consulta.utils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.stereotype.Component;

import br.edu.fatecpg.usafa.features.consulta.dtos.FormSelectOptionDTO;

/**
 * Classe de utilidade (Helper) para o ConsultaService.
 * Lida com lógica de negócio pura, como geração de opções
 * de formulário (datas, horários) e chaves de cache.
    */
    @Component
    public class ConsultaHelper {

        /**
         * Gera a chave de cache padrão para as consultas de um usuário.
         * (Movido do ConsultaService) [cite: 3]
         */
        public String getConsultasCacheKey(String userPublicId) {
            return "CONSULTAS_USER_" + userPublicId;
        }

        /**
         * Gera os próximos 7 dias úteis para o formulário.
         * (Movido do ConsultaService) [cite: 34-37]
         */
        public List<FormSelectOptionDTO> gerarProximosDias() {
            // Gera os próximos 7 dias úteis
            return Stream.iterate(LocalDate.now(), d -> d.plusDays(1))
                    .filter(d -> !d.getDayOfWeek().equals(java.time.DayOfWeek.SATURDAY) &&
                                !d.getDayOfWeek().equals(java.time.DayOfWeek.SUNDAY)) 
                    .limit(7)
                    .map(d -> new FormSelectOptionDTO(
                            d.format(IConsultaMapper.DATE_FORMATTER),
                            d.format(DateTimeFormatter.ofPattern("dd/MM (EEEE)", IConsultaMapper.LOCALE_BR))
                    )) 
                    .collect(Collectors.toList());
        }

        /**
         * Gera os horários disponíveis para o formulário.
         * (Movido do ConsultaService) [cite: 37-39]
         */
        public List<FormSelectOptionDTO> gerarHorarios() {
            // Gera horários (ex: 09:00, 10:00, ... 16:00)
            return Arrays.asList(
                    new FormSelectOptionDTO("09:00", "09:00"),
                    new FormSelectOptionDTO("10:00", "10:00"),
                    new FormSelectOptionDTO("11:00", "11:00"),
                    new FormSelectOptionDTO("13:00", "13:00 (Tarde)"), 
                    new FormSelectOptionDTO("14:00", "14:00"),
                    new FormSelectOptionDTO("15:00", "15:00"),
                    new FormSelectOptionDTO("16:00", "16:00")
            );
        }
    }
