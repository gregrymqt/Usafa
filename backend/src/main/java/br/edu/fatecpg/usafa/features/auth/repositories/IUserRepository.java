// src/main/java/br/edu/fatecpg/usafa/features/auth/repository/UserRepository.java

package br.edu.fatecpg.usafa.features.auth.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.models.User;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IUserRepository extends JpaRepository<User, Long> {

    Optional<User> findUserByEmail(String email);

    Optional<User> findByPublicId(UUID publicId);

    boolean existsByPublicId(UUID publicId);

    void deleteByPublicId(UUID publicId);

    /**
     * Busca paginada APENAS de pacientes (quem NÃO tem a role ROLE_ADMIN).
     * Usa NOT EXISTS para verificar dentro da lista de roles.
     */
    @Query("SELECT u FROM User u WHERE NOT EXISTS (SELECT r FROM u.roles r WHERE r.name = 'ROLE_ADMIN')")
    Page<User> findAllPatients(Pageable pageable);

    /**
     * Busca usuários por nome ou email, excluindo administradores.
     */
    @Query("SELECT u FROM User u WHERE (LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND NOT EXISTS (SELECT r FROM u.roles r WHERE r.name = 'ROLE_ADMIN')")
    Page<User> searchPatients(@Param("search") String search, Pageable pageable);

    /**
     * Busca um usuário específico pelo CPF, mas somente se ele NÃO for admin.
     */
    @Query("SELECT u FROM User u WHERE u.cpf = :cpf AND NOT EXISTS (SELECT r FROM u.roles r WHERE r.name = 'ROLE_ADMIN')")
    Optional<User> findPatientByCpf(@Param("cpf") String cpf);

}