package br.edu.fatecpg.usafa.features.admin.interfaces.Doctor;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import br.edu.fatecpg.usafa.features.admin.dtos.doctor.DoctorRequestDto;
import br.edu.fatecpg.usafa.features.admin.dtos.doctor.DoctorResponseDto;

/**
 * Interface (Contrato) para o serviço de Médicos.
 * Define O QUE pode ser feito, mas não COMO é feito.
 */
public interface IDoctorService {

    Page<DoctorResponseDto> getAllDoctors(Pageable pageable, String search);

    DoctorResponseDto createDoctor(DoctorRequestDto doctorDto, MultipartFile file);

    DoctorResponseDto updateDoctor(String id, DoctorRequestDto doctorDto, MultipartFile file);

    void deleteDoctor(String id);

}
