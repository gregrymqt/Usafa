package br.edu.fatecpg.usafa.features.consulta.utils;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

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
    // 1. VISUALIZAÇÃO (Tabelas e Listas de Histórico)
    // ========================================================================

    // Mapeia a entidade Consulta completa para um DTO detalhado
    @Mapping(source = "publicId", target = "id")
    @Mapping(source = "medico.nome", target = "medico")
    @Mapping(source = "tipoConsulta.nome", target = "tipo") // [cite: 32, 50]
    @Mapping(source = "horarioSlot.dataHoraInicio", target = "dia", qualifiedByName = "localDateTimeToDateString")
    @Mapping(source = "horarioSlot.dataHoraInicio", target = "horario", qualifiedByName = "localDateTimeToTimeString")
    @Mapping(source = "status", target = "status", qualifiedByName = "statusToString") // [cite: 34]
    ConsultaDTO toDTO(Consulta consulta);

    // Mapeia a entidade para um resumo (ideal para listas rápidas no painel do usuário)
    @Mapping(source = "publicId", target = "protocolo")
    @Mapping(source = "medico.nome", target = "medico") // [cite: 31, 44]
    @Mapping(source = "tipoConsulta.nome", target = "tipo")
    @Mapping(source = "horarioSlot.dataHoraInicio", target = "dia", qualifiedByName = "localDateTimeToDateString")
    @Mapping(source = "horarioSlot.dataHoraInicio", target = "horario", qualifiedByName = "localDateTimeToTimeString")
    ConsultaSummaryDTO toSummaryDTO(Consulta consulta);

    List<ConsultaSummaryDTO> toSummaryDTOs(List<Consulta> consultas);


    // ========================================================================
    // 2. FORMULÁRIOS E SELEÇÃO (Melhoria de UX)
    // ========================================================================

    // Converte Medico em Opção de Select (Value = ID, Label = Nome)
    @Mapping(source = "publicId", target = "value") // [cite: 43]
    @Mapping(source = "nome", target = "label") // [cite: 44]
    FormSelectOptionDTO medicoToOption(Medico medico);
    List<FormSelectOptionDTO> medicosToOptions(List<Medico> medicos);

    // Converte TipoConsulta em Opção de Select (Value = ID, Label = Nome)
    @Mapping(source = "publicId", target = "value") // [cite: 50]
    @Mapping(source = "nome", target = "label")
    FormSelectOptionDTO tipoToOption(TipoConsulta tipoConsulta);
    List<FormSelectOptionDTO> tiposToOptions(List<TipoConsulta> tiposConsulta);

    // NOVO: Converte HorarioSlot LIVRE em Opção de Select
    // Isso substitui a lógica hardcoded do ConsultaHelper para mostrar horários REAIS do banco
    @Mapping(source = "id", target = "value") // O value precisa ser o ID do slot para salvar no banco
    @Mapping(source = "dataHoraInicio", target = "label", qualifiedByName = "slotToLabel") // Label amigável: "25/10 - 14:00"
    FormSelectOptionDTO slotToOption(HorarioSlot slot);
    List<FormSelectOptionDTO> slotsToOptions(List<HorarioSlot> slots);


    // ========================================================================
    // 3. MÉTODOS AUXILIARES DE FORMATAÇÃO (@Named)
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
        // Transforma "AGENDADA" em "Agendada"
        String name = status.name().toLowerCase(LOCALE_BR);
        return name.substring(0, 1).toUpperCase(LOCALE_BR) + name.substring(1);
    }

    // Cria um label bonito para o select de horários: "25/10 (Terça) às 14:00"
    @Named("slotToLabel")
    default String slotToLabel(LocalDateTime dataHora) {
        if (dataHora == null) return "Data inválida";
        String diaSemana = dataHora.getDayOfWeek().getDisplayName(TextStyle.SHORT, LOCALE_BR);
        String dataFormatada = dataHora.format(DateTimeFormatter.ofPattern("dd/MM", LOCALE_BR));
        String horaFormatada = dataHora.format(TIME_FORMATTER);
        return String.format("%s (%s) às %s", dataFormatada, diaSemana, horaFormatada);
    }
}