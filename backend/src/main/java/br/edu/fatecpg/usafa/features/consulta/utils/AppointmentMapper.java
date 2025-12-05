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

import br.edu.fatecpg.usafa.features.consulta.dtos.Admin.AppointmentAdminResponseDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.Options.SelectOptionDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.User.AppointmentUserResponseDTO;
import br.edu.fatecpg.usafa.features.consulta.enums.ConsultaStatus;
import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.SolicitacaoConsulta;
import br.edu.fatecpg.usafa.models.TipoConsulta;
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AppointmentMapper {

    DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    Locale LOCALE_BR = Locale.of("pt", "BR");

    // --- VISÃO USER ---
    @Mapping(source = "publicId", target = "id")
    @Mapping(source = "medico.nome", target = "medicoNome")
    @Mapping(source = "tipoConsulta.nome", target = "especialidade")
    @Mapping(source = "horarioSlot.dataHoraInicio", target = "data", qualifiedByName = "toDateString")
    @Mapping(source = "horarioSlot.dataHoraInicio", target = "horario", qualifiedByName = "toTimeString")
    @Mapping(source = "status", target = "status", qualifiedByName = "statusToString")
    AppointmentUserResponseDTO toUserDto(Consulta entity);

    // Mapeamento de Solicitação (usado no AppointmentRequestService)
    @Mapping(source = "id", target = "id")
    @Mapping(source = "medico.nome", target = "medicoNome")
    @Mapping(source = "tipoConsulta.nome", target = "especialidade")
    @Mapping(source = "dia", target = "data", dateFormat = "dd/MM/yyyy")
    @Mapping(source = "horario", target = "horario", dateFormat = "HH:mm")
    @Mapping(source = "status", target = "status")
    AppointmentUserResponseDTO requestToUserDto(SolicitacaoConsulta entity);

    // --- VISÃO ADMIN ---
    @Mapping(source = "publicId", target = "id")
    @Mapping(source = "user.publicId", target = "pacienteId")
    @Mapping(source = "user.name", target = "pacienteNome")
    @Mapping(source = "medico.publicId", target = "medicoId")
    @Mapping(source = "medico.nome", target = "medicoNome")
    @Mapping(source = "horarioSlot.publicId", target = "horarioSlotId")
    @Mapping(source = "tipoConsulta.publicId", target = "tipoConsultaId")
    @Mapping(source = "tipoConsulta.nome", target = "especialidadeNome")
    @Mapping(source = "horarioSlot.dataHoraInicio", target = "data", qualifiedByName = "toDateString")
    @Mapping(source = "horarioSlot.dataHoraInicio", target = "horario", qualifiedByName = "toTimeString")
    @Mapping(source = "status", target = "status", qualifiedByName = "statusToString")
    AppointmentAdminResponseDTO toAdminDto(Consulta entity);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "user.publicId", target = "pacienteId")
    @Mapping(source = "user.name", target = "pacienteNome")
    @Mapping(source = "medico.publicId", target = "medicoId")
    @Mapping(source = "medico.nome", target = "medicoNome")
    @Mapping(source = "tipoConsulta.publicId", target = "tipoConsultaId")
    @Mapping(source = "tipoConsulta.nome", target = "especialidadeNome")
    @Mapping(source = "dia", target = "data", dateFormat = "dd/MM/yyyy")
    @Mapping(source = "horario", target = "horario", dateFormat = "HH:mm")
    @Mapping(source = "status", target = "status")
    AppointmentAdminResponseDTO requestToAdminDto(SolicitacaoConsulta entity);

    // --- OPTIONS & UX ---
    @Mapping(source = "publicId", target = "value")
    @Mapping(source = "nome", target = "label")
    SelectOptionDTO toOption(Medico medico);

    @Mapping(source = "publicId", target = "value")
    @Mapping(source = "nome", target = "label")
    SelectOptionDTO toOption(TipoConsulta tipo);

    @Mapping(source = "publicId", target = "value")
    @Mapping(source = ".", target = "label", qualifiedByName = "slotToLabel")
    SelectOptionDTO toOption(HorarioSlot slot);

    List<SelectOptionDTO> toSlotOptions(List<HorarioSlot> slots);
    List<SelectOptionDTO> toMedicoOptions(List<Medico> medicos);

    // --- FORMATTERS ---
    @Named("toDateString")
    default String toDateString(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.toLocalDate().format(DATE_FORMATTER) : null;
    }

    @Named("toTimeString")
    default String toTimeString(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.toLocalTime().format(TIME_FORMATTER) : null;
    }

    @Named("statusToString")
    default String statusToString(ConsultaStatus status) {
        return status != null ? status.name() : null;
    }

    @Named("slotToLabel")
    default String slotToLabel(HorarioSlot slot) {
        if (slot == null || slot.getDataHoraInicio() == null) return "Horário inválido";

        LocalDateTime dt = slot.getDataHoraInicio();
        String diaSemana = dt.getDayOfWeek().getDisplayName(TextStyle.SHORT, LOCALE_BR);
        diaSemana = diaSemana.substring(0, 1).toUpperCase() + diaSemana.substring(1);

        String nomeMedico = (slot.getMedico() != null) ? slot.getMedico().getNome() : "Médico Indefinido";

        // Formato: "Dr. João - 04/12 (Qui) às 14:00"
        return String.format("%s - %s (%s) às %s", 
            nomeMedico,
            dt.format(DateTimeFormatter.ofPattern("dd/MM")),
            diaSemana,
            dt.format(TIME_FORMATTER)
        );
    }
}