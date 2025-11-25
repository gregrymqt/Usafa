package br.edu.fatecpg.usafa.config;

import br.edu.fatecpg.usafa.features.roles.repositories.IRoleRepository;
import br.edu.fatecpg.usafa.models.Role;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class RoleSeederConfig {

    /**
     * Este método roda automaticamente toda vez que o Spring Boot inicia.
     * Ele garante que as roles básicas existam no banco.
     */
    @Bean
    CommandLineRunner initRoles(IRoleRepository roleRepository) {
        return args -> {
            // Lista das roles que você quer garantir que existam
            List<String> rolesPadrao = Arrays.asList("ROLE_ADMIN", "ROLE_USER", "ROLE_MANAGER");

            for (String roleName : rolesPadrao) {
                // Verifica se a role já existe para não criar duplicada
                if (roleRepository.findByName(roleName).isEmpty()) {
                    Role role = new Role();
                    role.setName(roleName);
                    roleRepository.save(role);
                    System.out.println("✅ Role criada automaticamente: " + roleName);
                } else {
                    System.out.println("ℹ️ Role já existente: " + roleName);
                }
            }
        };
    }
}