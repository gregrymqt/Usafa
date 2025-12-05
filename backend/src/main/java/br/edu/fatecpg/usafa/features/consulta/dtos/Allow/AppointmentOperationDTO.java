package br.edu.fatecpg.usafa.features.consulta.dtos.Allow;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentOperationDTO {

    // "Quem": Obrigatório se for Admin criando. Se for User, pega do token.
    private String patientId; 

    // "Quando/Com Quem": O Slot resolve Data + Hora + Médico.
    @NotBlank(message = "O horário (slot) é obrigatório")
    private String horarioSlotId; 

    // "O Quê": Especialidade.
    @NotBlank(message = "O tipo de consulta é obrigatório")
    private String tipoConsultaId; 

    // "Descrição"
    @Size(max = 500, message = "Máximo de 500 caracteres")
    private String sintomas; 

    // Usado na edição (para Confirmar/Cancelar/Concluir)
    private String status; 
}
