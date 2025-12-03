package br.edu.fatecpg.usafa.features.consulta.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.ArrayList;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaSummaryDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.FormSelectOptionDTO;
import br.edu.fatecpg.usafa.features.consulta.enums.ConsultaStatus;
import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.TipoConsulta;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface IConsultaMapper {

    // Definições de formatação
    DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    Locale LOCALE_BR = Locale.of("pt", "BR");

    // ========================================================================
    // 1. VISUALIZAÇÃO (DTOs) - Mantive igual ao seu arquivo original
    // ========================================================================

    @Mapping(source = "publicId", target = "id")
    @Mapping(source = "medico.nome", target = "medico")
    @Mapping(source = "tipoConsulta.nome", target = "tipo")
    @Mapping(source = "horarioSlot.dataHoraInicio", target = "dia", qualifiedByName = "localDateTimeToDateString")
    @Mapping(source = "horarioSlot.dataHoraInicio", target = "horario", qualifiedByName = "localDateTimeToTimeString")
    @Mapping(source = "status", target = "status", qualifiedByName = "statusToString")
    ConsultaDTO toDTO(Consulta consulta);
    
    List<ConsultaDTO> toDTOs(List<Consulta> consultas);

    @Mapping(source = "publicId", target = "protocolo")
    @Mapping(source = "medico.nome", target = "medico")
    @Mapping(source = "tipoConsulta.nome", target = "tipo")
    @Mapping(source = "horarioSlot.dataHoraInicio", target = "dia", qualifiedByName = "localDateTimeToDateString")
    @Mapping(source = "horarioSlot.dataHoraInicio", target = "horario", qualifiedByName = "localDateTimeToTimeString")
    ConsultaSummaryDTO toSummaryDTO(Consulta consulta);

    List<ConsultaSummaryDTO> toSummaryDTOs(List<Consulta> consultas);

    // ========================================================================
    // 2. FORMULÁRIOS E SELEÇÃO (Correção Aqui)
    // ========================================================================

    @Mapping(source = "publicId", target = "value")
    @Mapping(source = "nome", target = "label")
    FormSelectOptionDTO medicoToOption(Medico medico);
    List<FormSelectOptionDTO> medicosToOptions(List<Medico> medicos);

    @Mapping(source = "publicId", target = "value")
    @Mapping(source = "nome", target = "label")
    FormSelectOptionDTO tipoToOption(TipoConsulta tipoConsulta);
    List<FormSelectOptionDTO> tiposToOptions(List<TipoConsulta> tiposConsulta);

    // --- CORREÇÃO PRINCIPAL AQUI ---
    // source = "." significa "Passe o objeto HorarioSlot inteiro como parâmetro"
    @Mapping(source = "publicId", target = "value") 
    @Mapping(source = ".", target = "label", qualifiedByName = "slotToLabel") 
    FormSelectOptionDTO slotToOption(HorarioSlot slot);
    
    List<FormSelectOptionDTO> slotsToOptions(List<HorarioSlot> slots);

    // ========================================================================
    // 3. MÉTODOS AUXILIARES
    // ========================================================================

    @Named("localDateTimeToDateString")
    default String localDateTimeToDateString(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return dateTime.toLocalDate().format(DATE_FORMATTER);
    }

    @Named("localDateTimeToTimeString")
    default String localDateTimeToTimeString(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return dateTime.toLocalTime().format(TIME_FORMATTER);
    }

    @Named("statusToString")
    default String statusToString(ConsultaStatus status) {
        if (status == null) return null;
        String name = status.name().toLowerCase(LOCALE_BR);
        return name.substring(0, 1).toUpperCase(LOCALE_BR) + name.substring(1);
    }

    // --- CORREÇÃO DO MÉTODO DE LABEL ---
    // Agora recebe o Objeto Completo (HorarioSlot) e não apenas a Data
    @Named("slotToLabel")
    default String slotToLabel(HorarioSlot slot) {
        if (slot == null || slot.getDataHoraInicio() == null) {
            return "Horário inválido";
        }

        LocalDateTime dataHora = slot.getDataHoraInicio();
        
        // 1. Formata a data: "03/12 (Qua) às 20:30"
        String diaSemana = dataHora.getDayOfWeek().getDisplayName(TextStyle.SHORT, LOCALE_BR);
        // Deixa a primeira letra do dia maiúscula (qua -> Qua)
        diaSemana = diaSemana.substring(0, 1).toUpperCase() + diaSemana.substring(1);
        
        String dataFormatada = dataHora.format(DateTimeFormatter.ofPattern("dd/MM", LOCALE_BR));
        String horaFormatada = dataHora.format(TIME_FORMATTER);
        
        String parteData = String.format("%s (%s) às %s", dataFormatada, diaSemana, horaFormatada);

        // 2. Busca o nome do médico de forma segura
        String nomeMedico = "Médico não atribuído";
        if (slot.getMedico() != null && slot.getMedico().getNome() != null) {
            nomeMedico = slot.getMedico().getNome(); //
        }

        // 3. Concatena: "03/12 (Qua) às 20:30 - Dr. Lucas"
        return parteData + " - " + nomeMedico;
    }
}