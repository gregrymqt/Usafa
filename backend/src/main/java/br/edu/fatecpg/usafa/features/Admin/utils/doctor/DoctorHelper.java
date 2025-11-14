package br.edu.fatecpg.usafa.features.Admin.utils.doctor;

import org.springframework.stereotype.Component;

import br.edu.fatecpg.usafa.features.Admin.repositories.IMedicoRepository;
import br.edu.fatecpg.usafa.features.Admin.repositories.ITipoConsultaRepository;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DoctorHelper {

    private final IMedicoRepository medicoRepository;
    private final ITipoConsultaRepository tipoConsultaRepository; // Injetado

    /**
     * Busca um Médico (Medico) pelo seu ID público ou lança exceção.
     */
    public Medico findDoctorByPublicId(String publicId) {
        return medicoRepository.findByPublicId(publicId)
                .orElseThrow(() -> new BusinessRuleException("Médico com ID " + publicId + " não encontrado")); 
    }

    /**
     * Busca uma Especialidade (TipoConsulta) pelo seu nome ou lança exceção.
     */
    public TipoConsulta findSpecialtyByName(String specialtyName) {
        return tipoConsultaRepository.findByNome(specialtyName)
                .orElseThrow(() -> new BusinessRuleException("Especialidade '" + specialtyName + "' não encontrada")); 
    }

    /**
     * REGRA DE NEGÓCIO: Verifica se o médico possui consultas ativas.
     * Um médico com consultas não pode ser excluído.
     */
    public void validateDoctorHasNoAppointments(Medico medico) {
        // Acessa a coleção de consultas [cite: 4]
        // (Nota: Isso requer que a coleção seja carregada (EAGER) ou
        // que a sessão do Hibernate ainda esteja ativa, o que é verdade
        // dentro de um método @Transactional)
        if (medico.getConsultas() != null && !medico.getConsultas().isEmpty()) {
            throw new BusinessRuleException("Não é possível excluir o médico pois ele possui " + medico.getConsultas().size() + " consultas associadas."); 
        }
    }
}
