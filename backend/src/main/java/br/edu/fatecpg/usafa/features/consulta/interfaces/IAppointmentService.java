package br.edu.fatecpg.usafa.features.consulta.interfaces;




import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaFormOptionsDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.FormSelectOptionDTO;
import br.edu.fatecpg.usafa.models.User;

/**
 * Interface para o serviço de Consultas.
 * Define os contratos que o Controller espera.
 */
public interface IAppointmentService {

    /**
     * Busca todas as consultas de um usuário específico.
     * (Consumido por 'getConsultas' do front-end)
     *
     * @param user O usuário autenticado.
     * @return Uma lista de ConsultaDTO.
     */
    Page<ConsultaDTO> findConsultasByUser(User user, Pageable pageable);

    /**
     * Busca as opções para preencher os selects do formulário.
     * (Consumido por 'getFormOptions' do front-end)
     *
     * @return Um DTO contendo listas de médicos, tipos, dias e horários.
     */
    ConsultaFormOptionsDTO getFormOptions();


    List<FormSelectOptionDTO> getHorariosDisponiveisPorTipo(String tipoPublicId);

}
