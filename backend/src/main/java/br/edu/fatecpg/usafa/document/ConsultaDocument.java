package br.edu.fatecpg.usafa.document;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaRequestDTO;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.models.User;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Representa uma solicitação de consulta no banco de dados MongoDB.
 * Esta coleção armazena os dados de forma desnormalizada.
 */
@Data
@NoArgsConstructor
@Document(collection = "solicitacoes_consulta") // Nome da coleção no MongoDB
public class ConsultaDocument {

    @Id
    private String id; // ID automático do MongoDB

    // Dados da Requisição
    private String sintomas;
    private LocalDate dia;
    private LocalTime horario;
    private String status;

    // IDs de referência do banco SQL
    private String userPublicId;
    private String medicoPublicId;
    private String tipoConsultaPublicId;

    // Dados desnormalizados (para evitar JOINS)
    private String nomePaciente;
    private String nomeMedico;
    private String nomeTipoConsulta;

    /**
     * Construtor auxiliar para criar o Documento a partir dos dados validados.
     */
    public ConsultaDocument(ConsultaRequestDTO request, User user, Medico medico, TipoConsulta tipo) {
        this.sintomas = request.getSintomas();
        this.dia = LocalDate.parse(request.getDia()); // Convertendo String para LocalDate
        this.horario = LocalTime.parse(request.getHorario()); // Convertendo String para LocalTime
        this.status = "PENDENTE"; // Status inicial no MongoDB

        // Referências
        this.userPublicId = user.getPublicId().toString();
        this.medicoPublicId = medico.getPublicId().toString();
        this.tipoConsultaPublicId = tipo.getPublicId().toString();

        // Desnormalização
        this.nomePaciente = user.getName();
        this.nomeMedico = medico.getNome();
        this.nomeTipoConsulta = tipo.getNome();
    }
}