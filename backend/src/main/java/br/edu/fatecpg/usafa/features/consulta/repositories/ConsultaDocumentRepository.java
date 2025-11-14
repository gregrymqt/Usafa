package br.edu.fatecpg.usafa.features.consulta.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.document.ConsultaDocument;

import java.util.List;

/**
 * Interface de Repositório para o MongoDB.
 * Ela gerencia o Documento 'ConsultaDocument' e usa String como ID.
 */
@Repository
public interface ConsultaDocumentRepository extends MongoRepository<ConsultaDocument, String> {

    List<ConsultaDocument> findByUserPublicId(String userPublicId);
}
