package br.edu.fatecpg.usafa.features.Admin.interfaces;


import java.util.List;

import br.edu.fatecpg.usafa.features.Admin.dtos.doctor.DoctorRequestDto;
import br.edu.fatecpg.usafa.features.Admin.dtos.doctor.DoctorResponseDto;

/**
 * Interface (Contrato) para o serviço de Médicos.
 * Define O QUE pode ser feito, mas não COMO é feito.
 */
public interface IDoctorService {

    List<DoctorResponseDto> getAllDoctors();

    DoctorResponseDto createDoctor(DoctorRequestDto doctorDto);

    DoctorResponseDto updateDoctor(String id, DoctorRequestDto doctorDto);

    void deleteDoctor(String id);

    // Você pode adicionar outros métodos de contrato aqui, ex:
    // DoctorResponseDto getDoctorById(String id);
}
