package br.edu.fatecpg.usafa.features.profile.services;

import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.picture.interfaces.IPictureService;
import br.edu.fatecpg.usafa.features.profile.dtos.UserProfileResponseDTO;
import br.edu.fatecpg.usafa.features.profile.dtos.UserProfileUpdateDTO;
import br.edu.fatecpg.usafa.features.profile.interfaces.IUserProfileService;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.models.Picture;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileService implements IUserProfileService {

    private final IUserRepository userRepository;
    private final ICacheService cacheService;
    
    // INJEÇÃO DA SERVICE DE IMAGEM
    private final IPictureService pictureService;

    private static final String CACHE_PREFIX = "user:profile:";

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponseDTO getUserProfile(String email) {
        String cacheKey = CACHE_PREFIX + email;

        UserProfileResponseDTO cachedProfile = cacheService.get(cacheKey, UserProfileResponseDTO.class);
        if (cachedProfile != null) {
            log.info("Perfil recuperado do cache para: {}", email);
            return cachedProfile;
        }

        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new BusinessRuleException("Usuário não encontrado."));

        UserProfileResponseDTO response = new UserProfileResponseDTO(user);
        cacheService.saveWithTtl(cacheKey, response, 1, TimeUnit.HOURS);

        return response;
    }

    /**
     * Agora aceita MultipartFile para fazer o upload real
     */
    @Override
    @Transactional
    public UserProfileResponseDTO updateUserProfile(String email, UserProfileUpdateDTO updateDTO, MultipartFile file) {
        // 1. Busca usuário
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new BusinessRuleException("Usuário não encontrado para atualização."));

        // 2. Atualiza dados textuais
        user.setName(updateDTO.name());
        user.setCep(updateDTO.cep());

        // 3. Lógica da Foto usando PictureService
        if (file != null && !file.isEmpty()) {
            log.info("Processando nova foto de perfil para: {}", email);
            
            // Faz o upload físico e gera a URL
            Picture uploadedPicture = pictureService.uploadAndGetPicture(file, "perfil_usuario");

            Picture currentPicture = user.getPicture();
            if (currentPicture != null) {
                // Atualiza existente
                currentPicture.setUrl(uploadedPicture.getUrl());
                currentPicture.setTitle("Foto de " + user.getName());
            } else {
                // Cria nova entidade Picture
                Picture newPicture = Picture.builder()
                        .url(uploadedPicture.getUrl())
                        .group("perfil_usuario")
                        .title("Foto de " + user.getName())
                        .build();
                user.setPicture(newPicture);
            }
        }

        // 4. Salva e Invalida Cache
        User updatedUser = userRepository.save(user);
        
        String cacheKey = CACHE_PREFIX + email;
        cacheService.delete(cacheKey);
        
        return new UserProfileResponseDTO(updatedUser);
    }
}