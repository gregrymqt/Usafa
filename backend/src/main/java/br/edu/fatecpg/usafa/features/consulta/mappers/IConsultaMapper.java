package br.edu.fatecpg.usafa.features.consulta.mappers;

import java.time.LocalDate;
import java.time.LocalTime;
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
import br.edu.fatecpg.usafa.features.Admin.dtos.patient.PatientResponseDto;
import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.models.User;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface IConsultaMapper {

    // --- Formatadores de Data/Hora ---
    // (Pode ser movido para uma classe de utilidade se preferir)
    DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    Locale LOCALE_BR = Locale.of("pt", "BR");
    
    // === DTO para a Tabela ===

    @Mapping(source = "publicId", target = "id")
    @Mapping(source = "medico.nome", target = "medico")
    @Mapping(source = "tipoConsulta.nome", target = "tipo")
    @Mapping(source = "dia", target = "dia", qualifiedByName = "localDateToString")
    @Mapping(source = "horario", target = "horario", qualifiedByName = "localTimeToString")
    @Mapping(source = "status", target = "status", qualifiedByName = "statusToString")
    ConsultaDTO toDTO(Consulta consulta);
    List<ConsultaDTO> toDTOList(List<Consulta> consultas);

    // === DTO para o Modal de Sucesso ===

    @Mapping(source = "publicId", target = "protocolo")
    @Mapping(source = "medico.nome", target = "medico")
    @Mapping(source = "tipoConsulta.nome", target = "tipo")
    @Mapping(source = "dia", target = "dia", qualifiedByName = "localDateToString")
    @Mapping(source = "horario", target = "horario", qualifiedByName = "localTimeToString")
    @Mapping(source = "user.name", target = "paciente")
    @Mapping(source = "sintomas", target = "sintomas")
    ConsultaSummaryDTO toSummaryDTO(Consulta consulta);

    // === DTOs para Opções do Formulário ===

    @Mapping(source = "publicId", target = "value")
    @Mapping(source = "nome", target = "label")
    FormSelectOptionDTO medicoToOption(Medico medico);
    List<FormSelectOptionDTO> medicosToOptions(List<Medico> medicos);

    @Mapping(source = "publicId", target = "value")
    @Mapping(source = "nome", target = "label")
    FormSelectOptionDTO tipoToOption(TipoConsulta tipoConsulta);
    @Mapping(source = "publicId", target = "value")
    @Mapping(source = "name", target = "label")
    FormSelectOptionDTO pacienteToOption(User paciente);
    List<FormSelectOptionDTO> pacientesToOptions(List<User> pacientes);
    List<FormSelectOptionDTO> tiposToOptions(List<TipoConsulta> tipos);

    // --- Conversores (qualifiedByName) ---

    @Named("localDateToString")
    default String localDateToString(LocalDate date) {
        if (date == null) return null;
        return date.format(DATE_FORMATTER);
    }

    @Named("localTimeToString")
    default String localTimeToString(LocalTime time) {
        if (time == null) return null;
        return time.format(TIME_FORMATTER);
    }

    @Named("stringToLocalDate")
    default LocalDate stringToLocalDate(String date) {
        if (date == null) return null;
        return LocalDate.parse(date, DATE_FORMATTER);
    }

    @Named("stringToLocalTime")
    default LocalTime stringToLocalTime(String time) {
        if (time == null) return null;
        return LocalTime.parse(time, TIME_FORMATTER);
    }
    
    @Named("statusToString")
    default String statusToString(ConsultaStatus status) {
        if (status == null) return null;
        // Capitaliza a primeira letra e deixa o resto minúsculo (ex: PENDENTE -> "Pendente")
        String name = status.name().toLowerCase(LOCALE_BR);
        return name.substring(0, 1).toUpperCase(LOCALE_BR) + name.substring(1);
    }

    // Mapeamento para PatientResponseDto (para o módulo Admin)
    @Mapping(source = "publicId", target = "id")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "email", target = "email")
    @Mapping(source = "cpf", target = "cpf")
    @Mapping(source = "phone", target = "phone")
    @Mapping(source = "birthDate", target = "birthDate", qualifiedByName = "localDateToIsoString")
    PatientResponseDto userToPatientResponseDto(User user);

    @Named("localDateToIsoString")
    default String localDateToIsoString(LocalDate date) {
        if (date == null) {
            return null;
        }
        // Formato ISO "1990-10-25T00:00:00Z"
        // Adiciona uma hora padrão para o formato ISO completo, se a data for apenas LocalDate
        return date.atStartOfDay().format(DateTimeFormatter.ISO_DATE_TIME) + "Z";
    }
}
