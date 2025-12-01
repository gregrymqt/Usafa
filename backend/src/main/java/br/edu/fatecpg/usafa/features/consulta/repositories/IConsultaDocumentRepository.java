package br.edu.fatecpg.usafa.features.consulta.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.document.RequestAppointment;

import java.util.List;

/**
 * Interface de Repositório para o MongoDB.
 * Ela gerencia o Documento 'ConsultaDocument' e usa String como ID.
 */
@Repository
public interface IConsultaDocumentRepository extends MongoRepository<RequestAppointment, String> {

    List<RequestAppointment> findByUserPublicId(String userPublicId);

    /**
     * Busca solicitações de consulta de forma paginada, permitindo uma busca
     * case-insensitive pelo nome do paciente.
     *
     * @param search O termo de busca para o nome do paciente.
     * @param pageable    O objeto de paginação (página, tamanho, ordenação).
     * @return Uma página (Page) de solicitações de consulta.
     */
    Page<RequestAppointment> findByPatientNameContainingIgnoreCase(String patientName, Pageable pageable);

    /**
     * Busca todas as solicitações de consulta que correspondem a um status específico.
     *
     * @param status O status a ser buscado (ex: "PENDING", "CONFIRMED").
     * @return Uma lista de solicitações de consulta com o status fornecido.
     */
    List<RequestAppointment> findByStatus(String status);

    /**
     * Busca paginada por status.
     */
    Page<RequestAppointment> findByStatus(String status, Pageable pageable);

    /**
     * Busca paginada combinando nome do paciente (case-insensitive) e status.
     */
    Page<RequestAppointment> findByPatientNameContainingIgnoreCaseAndStatus(String patientName, String status, Pageable pageable);

}
