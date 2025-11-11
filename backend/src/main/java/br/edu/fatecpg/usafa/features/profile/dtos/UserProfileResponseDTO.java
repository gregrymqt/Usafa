package br.edu.fatecpg.usafa.features.profile.dtos;

import java.util.UUID;

import br.edu.fatecpg.usafa.models.User;

/**
 * DTO para enviar os dados do perfil do usuário para o frontend.
 * (SELECT)
 * Baseado na entity User, mas sem campos sensíveis como 'id' (Long) ou 'password'.
 */
public record UserProfileResponseDTO(
    
    // Usamos o publicId para identificação externa
    UUID publicId, 
    
    String name,
    
    String email,
    
    // Útil para o frontend saber se a conta é vinculada ao Google
    String googleId, 
    
    // URL da foto de perfil
    String picture, 
    
    String cpf,
    
    // Essencial para a funcionalidade de mapa
    String cep 
) {
    // Construtor de conveniência para facilitar o Mapeamento
    // (Ex: no seu Service, você pode fazer: new UserProfileResponseDTO(user))
    public UserProfileResponseDTO(User user) {
        this(
            user.getPublicId(),
            user.getName(),
            user.getEmail(),
            user.getGoogleId(),
            user.getPicture(),
            user.getCpf(),
            user.getCep()
        );
    }
}
