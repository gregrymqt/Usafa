package br.edu.fatecpg.usafa.features.consulta.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.document.RequestAppointment;
import br.edu.fatecpg.usafa.features.consulta.dtos.RequestAppointmentResponseDto;

import java.util.List;

/**
 * Interface de Repositório para o MongoDB.
 * Ela gerencia o Documento 'ConsultaDocument' e usa String como ID.
 */
@Repository
public interface IConsultaDocumentRepository extends MongoRepository<RequestAppointment, String> {

    // Alterado de ResponseDto para a Entidade RequestAppointment
    Page<RequestAppointment> findByStatus(String status, Pageable pageable); 

    // Alterado de ResponseDto para a Entidade RequestAppointment
    Page<RequestAppointment> findByUserPublicId(String userPublicId, Pageable pageable);

    // Alterado de ResponseDto para a Entidade RequestAppointment
    Page<RequestAppointment> findByUserPublicIdAndStatus(String userPublicId, String status, Pageable pageable); 
}

