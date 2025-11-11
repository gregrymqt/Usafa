// src/main/java/br/edu/fatecpg/usafa/features/roles/IRoleService.java
package br.edu.fatecpg.usafa.features.roles.interfaces;

import java.util.List;
import java.util.Set;

import br.edu.fatecpg.usafa.models.Role;

public interface IRoleService {

    /**
     * Pega todas as roles cadastradas no banco (ex: "ROLE_USER", "ROLE_ADMIN").
     * @return Uma lista de entidades Role.
     */
    List<Role> getAllRoles();

    /**
     * Pega todas as roles de um usuário específico.
     * @param userPublicId O ID público do usuário.
     * @return Um Set (lista sem duplicados) das roles do usuário.
     */
    Set<Role> getUserRoles(String userPublicId);

    /**
     * Associa uma role existente a um usuário existente.
     * @param userPublicId O ID público do usuário.
     * @param roleName O nome da role (ex: "ROLE_ADMIN").
     */
    void addRoleToUser(String userPublicId, String roleName);

    /**
     * Cria uma nova role no banco de dados.
     * @param roleName O nome da nova role (ex: "ROLE_MODERATOR").
     * @return A entidade Role que foi criada e salva.
     */
    Role createRole(String roleName);
}