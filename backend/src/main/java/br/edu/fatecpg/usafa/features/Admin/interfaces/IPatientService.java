package br.edu.fatecpg.usafa.features.Admin.interfaces;


import java.util.List;

import br.edu.fatecpg.usafa.features.Admin.dtos.patient.PatientRequestDto;
import br.edu.fatecpg.usafa.features.Admin.dtos.patient.PatientResponseDto;

// A interface define O QUE o serviço deve fazer
public interface IPatientService {

    List<PatientResponseDto> getAllPatients();

    PatientResponseDto createPatient(PatientRequestDto patientDto);

    PatientResponseDto updatePatient(String id, PatientRequestDto patientDto);

    void deletePatient(String id);

    // Você pode adicionar outros métodos de contrato aqui, ex:
    // PatientResponseDto getPatientById(String id);
}
