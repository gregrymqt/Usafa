package br.edu.fatecpg.usafa.features.admin.services.AppointmentType;


import br.edu.fatecpg.usafa.features.admin.dtos.appointmentType.AppointmentTypeRequestDto;
import br.edu.fatecpg.usafa.features.admin.dtos.appointmentType.AppointmentTypeResponseDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.AppointmentType.IAppointmentTypeService;
import br.edu.fatecpg.usafa.features.admin.repositories.ITipoConsultaRepository;
import br.edu.fatecpg.usafa.features.admin.utils.appointmentType.AppointmentTypeHelper;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentTypeServiceImpl implements IAppointmentTypeService {

    private final ITipoConsultaRepository tipoConsultaRepository;
    private final AppointmentTypeHelper appointmentTypeHelper;

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentTypeResponseDto> getAll() {
        return tipoConsultaRepository.findAll().stream()
                .map(appointmentTypeHelper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppointmentTypeResponseDto create(AppointmentTypeRequestDto requestDto) {
        if (tipoConsultaRepository.findByNomeIgnoreCase(requestDto.getNome()).isPresent()) {
            throw new BusinessRuleException("Este tipo de consulta já existe.");
        }
        TipoConsulta tipoConsulta = new TipoConsulta();
        tipoConsulta.setNome(requestDto.getNome());
        tipoConsulta.setPublicId(UUID.randomUUID().toString());

        TipoConsulta saved = tipoConsultaRepository.save(tipoConsulta);
        return appointmentTypeHelper.toDto(saved);
    }

    @Override
    @Transactional
    public AppointmentTypeResponseDto update(String publicId, AppointmentTypeRequestDto requestDto) {
        TipoConsulta tipoConsulta = tipoConsultaRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Tipo de consulta não encontrado."));

        tipoConsultaRepository.findByNomeIgnoreCase(requestDto.getNome()).ifPresent(existing -> {
            if (!existing.getPublicId().equals(publicId)) {
                throw new BusinessRuleException("Outro tipo de consulta com este nome já existe.");
            }
        });

        tipoConsulta.setNome(requestDto.getNome());
        TipoConsulta updated = tipoConsultaRepository.save(tipoConsulta);
        return appointmentTypeHelper.toDto(updated);
    }

    @Override
    @Transactional
    public void delete(String publicId) {
        TipoConsulta tipoConsulta = tipoConsultaRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Tipo de consulta não encontrado."));

        // Adicionar validação para não deletar se estiver em uso por algum médico
        if (!tipoConsulta.getMedicos().isEmpty()) {
            throw new BusinessRuleException("Não é possível deletar. Este tipo de consulta está sendo usado por médicos.");
        }

        tipoConsultaRepository.delete(tipoConsulta);
    }
}