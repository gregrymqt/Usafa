package br.edu.fatecpg.usafa.features.admin.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.models.PasswordCreationToken;
import br.edu.fatecpg.usafa.models.User;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IPasswordCreationTokenRepository extends JpaRepository<PasswordCreationToken, Long> {

    Optional<PasswordCreationToken> findByToken(String token);

    // [CORREÇÃO] Método necessário para busca complexa (Usuario + Validade)
    Optional<PasswordCreationToken> findByUserAndExpiryDateAfter(User user, LocalDateTime now);

    // [CORREÇÃO] Método necessário para buscar pelo UUID do usuário (Join)
    Optional<PasswordCreationToken> findByUser_Id(long publicId);

    // [CORREÇÃO] Método para deletar token antigo
    void deleteByUser(User user);

    boolean existsByUser(User user);
}