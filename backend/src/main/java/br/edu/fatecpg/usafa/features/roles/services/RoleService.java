package br.edu.fatecpg.usafa.features.roles.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Importante

import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.roles.interfaces.IRoleService;
import br.edu.fatecpg.usafa.features.roles.repositories.IRolesRepository;
import br.edu.fatecpg.usafa.models.Role;
import br.edu.fatecpg.usafa.models.User;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class RoleService implements IRoleService {

    // Nossos "pontos de acesso" ao banco de dados
    private final IRolesRepository roleRepository;
    private final IUserRepository userRepository;

    @Autowired
    public RoleService(IRolesRepository roleRepository, IUserRepository userRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    /**
     * Método para pegar todas as roles existentes do banco.
     */
    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    /**
     * Método para pegar as roles referente aquele usuário.
     */
    @Override
    @Transactional(readOnly = true) // Boa prática para operações de leitura
    public Set<Role> getUserRoles(String userPublicId) {
        // 1. Encontra o usuário pelo ID público
        User user = userRepository.findByPublicId(UUID.fromString(userPublicId))
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + userPublicId));

        // 2. Retorna o Set de roles dele
        // (Graças ao FetchType.EAGER no @ManyToMany, as roles já vêm juntas)
        return user.getRoles();
    }

    /**
     * Método para adicionar roles a um usuário.
     */
    @Override
    @Transactional // Essencial, pois estamos modificando o banco
    public void addRoleToUser(String userPublicId, String roleName) {
        // 1. Encontra a role que queremos adicionar
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role não encontrada: " + roleName));

        // 2. Encontra o usuário que vai receber a role
        User user = userRepository.findByPublicId(UUID.fromString(userPublicId))
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + userPublicId));

        // 3. Adiciona a role ao Set do usuário
        user.getRoles().add(role);

        // 4. Salva a entidade usuário
        // (O @Transactional cuida de salvar a relação na tabela 'user_roles')
        userRepository.save(user);
    }

    /**
     * Método bônus para criar uma nova role (ex: "ROLE_ADMIN")
     */
    @Override
    public Role createRole(String roleName) {
        // Verifica se a role já existe para não duplicar
        if (roleRepository.findByName(roleName).isPresent()) {
            throw new IllegalStateException("Role já existe: " + roleName);
        }

        Role newRole = new Role();
        newRole.setName(roleName);
        return roleRepository.save(newRole);
    }
}
