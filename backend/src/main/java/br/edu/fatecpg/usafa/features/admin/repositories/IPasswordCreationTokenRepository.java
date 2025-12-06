package br.edu.fatecpg.usafa.features.admin.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.models.PasswordCreationToken;
import br.edu.fatecpg.usafa.models.User;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IPasswordCreationTokenRepository extends JpaRepository<PasswordCreationToken, Long> {

    @Query("SELECT t FROM PasswordCreationToken t JOIN FETCH t.user WHERE t.token = :token")
    Optional<PasswordCreationToken> findByTokenWithUser(@Param("token") String token);

    // [CORREÇÃO] Método necessário para busca complexa (Usuario + Validade)
    Optional<PasswordCreationToken> findByUserAndExpiryDateAfter(User user, LocalDateTime now);

    // [CORREÇÃO] Método necessário para buscar pelo id do usuário (Join)
    @Query("SELECT t FROM PasswordCreationToken t JOIN FETCH t.user WHERE t.user.id = :userId")
    Optional<PasswordCreationToken> findByUser_Id(@Param("userId") long userId);

    // [CORREÇÃO] Método para deletar token antigo
    void deleteByUser(User user);

    boolean existsByUser(User user);
} 