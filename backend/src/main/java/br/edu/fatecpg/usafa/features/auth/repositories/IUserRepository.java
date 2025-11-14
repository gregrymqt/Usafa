// src/main/java/br/edu/fatecpg/usafa/features/auth/repository/UserRepository.java

package br.edu.fatecpg.usafa.features.auth.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.models.User;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IUserRepository extends JpaRepository<User, Long> {

    /**
     * Busca um usuário pelo seu endereço de e-mail.
     * (Este método será o principal para o perfil do usuário logado)
     */
    Optional<User> findByEmail(String email);

    /**
     * (MÉTODO ADICIONADO)
     * Busca um usuário pelo seu ID público (UUID).
     * Útil para endpoints que expõem perfis publicamente de forma segura.
     */
    Optional<User> findByPublicId(UUID publicId);


    boolean existsByPublicId(UUID publicId);
    void deleteByPublicId(UUID publicId);

}