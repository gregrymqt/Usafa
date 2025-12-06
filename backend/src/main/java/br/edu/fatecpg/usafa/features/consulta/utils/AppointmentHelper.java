package br.edu.fatecpg.usafa.features.consulta.utils;

import java.util.Collections;
import java.util.List;


import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import br.edu.fatecpg.usafa.features.admin.repositories.IHorarioSlotRepository;
import br.edu.fatecpg.usafa.features.admin.repositories.IMedicoRepository;
import br.edu.fatecpg.usafa.features.admin.repositories.ITipoConsultaRepository;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.Options.FormOptionsDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.Options.SelectOptionDTO;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AppointmentHelper {

    private final IHorarioSlotRepository slotRepository;
    private final ITipoConsultaRepository tipoRepository;
    private final IMedicoRepository medicoRepository; 
    private final AppointmentMapper mapper;

    /**
     * Gera a chave de cache única por usuário e paginação.
     */
    public String getConsultasCacheKey(String userPublicId) {
        return "CONSULTAS_USER_" + userPublicId;
    }

    /**
     * Busca Slots disponíveis formatados para o Select do Frontend.
     */
    public List<SelectOptionDTO> findSlotsByTipo(String tipoPublicId) {
        // Busca slots disponíveis no banco
        List<HorarioSlot> slots = slotRepository.findDisponiveisPorTipoConsulta(tipoPublicId);
        
        if (slots == null || slots.isEmpty()) {
            return Collections.emptyList();
        }
        // O Mapper já cuida de formatar "Médico - Data - Hora"
        return mapper.toSlotOptions(slots);
    }

    /**
     * Retorna opções estáticas (Médicos e Tipos) para os selects iniciais.
     * Cacheado para evitar hits desnecessários no banco.
     */
    @Cacheable(value = "formOptions", key = "'static_options'")
    public FormOptionsDTO getFormOptionsCached() {
        // Busca Tipos
        List<SelectOptionDTO> tipos = tipoRepository.findAll().stream()
                .map(mapper::toOption)
                .toList();
                
        // Busca Médicos Ativos
        List<SelectOptionDTO> medicos = mapper.toMedicoOptions(
            medicoRepository.findByActiveTrue(Pageable.unpaged()).getContent()
        );

        return FormOptionsDTO.builder()
                .tipos(tipos)
                .medicos(medicos) 
                // Horários vêm vazios aqui, pois dependem da seleção do Tipo (carregamento dinâmico)
                .horarios(Collections.emptyList()) 
                .build();
    }
}