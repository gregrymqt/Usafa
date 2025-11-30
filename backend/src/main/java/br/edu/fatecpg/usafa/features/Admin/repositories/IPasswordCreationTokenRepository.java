package br.edu.fatecpg.usafa.features.admin.repositories;

import br.edu.fatecpg.usafa.document.PasswordCreationToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IPasswordCreationTokenRepository extends MongoRepository<PasswordCreationToken, String> {

    /**
     * Busca um token de criação de senha pelo ID público do usuário associado.
     * @param userPublicId o ID público do usuário.
     * @return um Optional contendo o token, se encontrado.
     */
    Optional<PasswordCreationToken> findByUserPublicId(String userPublicId);

}
