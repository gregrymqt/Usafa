package br.edu.fatecpg.usafa.features.profile.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.profile.dtos.UserProfileResponseDTO;
import br.edu.fatecpg.usafa.features.profile.dtos.UserProfileUpdateDTO;
import br.edu.fatecpg.usafa.features.profile.interfaces.IUserProfileService;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.repository.IUserRepository;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;

@Service
public class UserProfileService  implements IUserProfileService {

    @Autowired
    private IUserRepository userRepository;

    /**
     * Busca os dados de perfil de um usuário com base no seu e-mail (login).
     *
     * @param email O e-mail do usuário (geralmente vindo do Principal do Spring Security).
     * @return O DTO com os dados do perfil.
     */
    @Async
    @Transactional(readOnly = true) // Otimização para operações de leitura
    public UserProfileResponseDTO getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new DatabaseOperationException("Usuário não encontrado com o e-mail: " + email));
        
        // Mapeia a Entidade User para o DTO de Resposta
        return new UserProfileResponseDTO(user);
    }

    /**
     * Atualiza os dados de perfil de um usuário.
     *
     * @param email O e-mail do usuário logado.
     * @param updateDTO O DTO contendo os dados a serem atualizados.
     * @return O DTO com os dados do perfil já atualizados.
     */
    @Async
    @Transactional // Transação de escrita
    public UserProfileResponseDTO updateUserProfile(String email, UserProfileUpdateDTO updateDTO) {
        // 1. Encontra a entidade do usuário no banco
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new DatabaseOperationException("Usuário não encontrado com o e-mail: " + email));

        // 2. Atualiza os campos permitidos
        user.setName(updateDTO.name());
        user.setCep(updateDTO.cep());
        user.setPicture(updateDTO.picture());
        
        // 3. Salva a entidade atualizada no banco
        User updatedUser = userRepository.save(user);

        // 4. Retorna o DTO com os novos dados
        return new UserProfileResponseDTO(updatedUser);
    }
}
