package br.edu.fatecpg.usafa.features.admin.interfaces.Patient;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import br.edu.fatecpg.usafa.features.admin.dtos.patient.PatientRequestDto;
import br.edu.fatecpg.usafa.features.admin.dtos.patient.PatientResponseDto;

// A interface define O QUE o serviço deve fazer
public interface IPatientService {

    // Método antigo foi substituído por este
    Page<PatientResponseDto> getAllPatients(String search, Pageable pageable);

    // Novo método para busca por CPF
    List<PatientResponseDto> searchByCpf(String cpf);

    List<PatientResponseDto> getAllPatients();

    PatientResponseDto createPatient(PatientRequestDto patientDto);

    PatientResponseDto updatePatient(String id, PatientRequestDto patientDto);

    void deletePatient(String id);

}
