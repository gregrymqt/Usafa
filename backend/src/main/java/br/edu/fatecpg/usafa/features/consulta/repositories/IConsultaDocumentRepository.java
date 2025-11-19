package br.edu.fatecpg.usafa.features.consulta.repositories;

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
}
