package br.edu.fatecpg.usafa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.models.Role;

import java.util.Optional;

@Repository
public interface IRolesRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}
