package br.edu.fatecpg.usafa.features.consulta.dtos.Admin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentAdminResponseDTO {

    private String id; // ID da Consulta

    // --- Relacionamentos (IDs para Edição) ---
    private String pacienteId;   
    private String medicoId;
    private String horarioSlotId; 
    private String tipoConsultaId; 

    // --- Dados Visuais (Para a Tabela) ---
    private String pacienteNome; 
    private String medicoNome;
    private String especialidadeNome;
    
    // Mantemos Strings formatadas para exibição rápida, 
    // ou LocalDate/LocalTime se você quiser ordenar na tabela do front.
    // Sugiro String se o foco é apenas exibir.
    private String data;          
    private String horario;       
    
    private String status;
    private String sintomas;
}