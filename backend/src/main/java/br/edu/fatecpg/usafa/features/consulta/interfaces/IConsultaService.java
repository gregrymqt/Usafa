package br.edu.fatecpg.usafa.features.consulta.interfaces;




import java.util.List;

import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaFormOptionsDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaRequestDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaSummaryDTO;
import br.edu.fatecpg.usafa.models.User;

/**
 * Interface para o serviço de Consultas.
 * Define os contratos que o Controller espera.
 */
public interface IConsultaService {

    /**
     * Busca todas as consultas de um usuário específico.
     * (Consumido por 'getConsultas' do front-end)
     *
     * @param user O usuário autenticado.
     * @return Uma lista de ConsultaDTO.
     */
    List<ConsultaDTO> findConsultasByUser(User user);

    /**
     * Busca as opções para preencher os selects do formulário.
     * (Consumido por 'getFormOptions' do front-end)
     *
     * @return Um DTO contendo listas de médicos, tipos, dias e horários.
     */
    ConsultaFormOptionsDTO getFormOptions();

    /**
     * Cria uma nova solicitação de consulta.
     * (Consumido por 'requestConsulta' do front-end)
     *
     * @param requestDTO Os dados do formulário.
     * @param user O usuário autenticado que está fazendo a solicitação.
     * @return Um DTO de resumo (summary) para o modal de sucesso.
     */
    ConsultaSummaryDTO createConsulta(ConsultaRequestDTO requestDTO, User user);
}
