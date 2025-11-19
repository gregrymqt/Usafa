package br.edu.fatecpg.usafa.features.profile.services;

import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.profile.dtos.UserProfileResponseDTO;
import br.edu.fatecpg.usafa.features.profile.dtos.UserProfileUpdateDTO;
import br.edu.fatecpg.usafa.features.profile.interfaces.IUserProfileService;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor // Injeção de dependência via construtor (Melhor prática)
@Slf4j
public class UserProfileService implements IUserProfileService {

    private final IUserRepository userRepository;
    private final ICacheService cacheService; // Seu serviço de cache corrigido
    
    // Prefixo para organizar as chaves no Redis (ex: user:profile:lucas@gmail.com)
    private static final String CACHE_PREFIX = "user:profile:";

    /**
     * Busca os dados de perfil.
     * Estratégia: Read-Through (Cache -> Banco -> Cache)
     */
    @Override
    @Transactional(readOnly = true)
    public UserProfileResponseDTO getUserProfile(String email) {
        String cacheKey = CACHE_PREFIX + email;

        // 1. Tenta buscar do Cache
        UserProfileResponseDTO cachedProfile = cacheService.get(cacheKey, UserProfileResponseDTO.class);
        if (cachedProfile != null) {
            log.info("Perfil recuperado do cache para: {}", email);
            return cachedProfile;
        }

        // 2. Se não está no cache, busca no banco
        log.info("Perfil não encontrado no cache. Buscando no banco para: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessRuleException("Usuário não encontrado."));

        UserProfileResponseDTO response = new UserProfileResponseDTO(user);

        // 3. Salva no Cache (TTL de 1 hora, por exemplo, já que perfil muda pouco)
        cacheService.saveWithTtl(cacheKey, response, 1, TimeUnit.HOURS);

        return response;
    }

    /**
     * Atualiza o perfil.
     * Estratégia: Write-Through / Cache Invalidation (Atualiza Banco -> Remove do Cache)
     */
    @Override
    @Transactional
    public UserProfileResponseDTO updateUserProfile(String email, UserProfileUpdateDTO updateDTO) {
        // 1. Busca usuário (Fail-fast)
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessRuleException("Usuário não encontrado para atualização."));

        // 2. Atualiza os campos
        user.setName(updateDTO.name());
        user.setCep(updateDTO.cep());
        
        // Só atualiza a foto se vier algo diferente de null/vazio
        if (updateDTO.picture() != null && !updateDTO.picture().isBlank()) {
            user.setPicture(updateDTO.picture());
        }

        // 3. Salva no banco
        User updatedUser = userRepository.save(user);
        log.info("Perfil atualizado no banco para: {}", email);

        // 4. INVALIDA O CACHE (Crucial!)
        // Como o dado mudou, o cache antigo é inválido. Deletamos para forçar uma nova busca no próximo get.
        String cacheKey = CACHE_PREFIX + email;
        cacheService.delete(cacheKey);
        log.info("Cache invalidado para: {}", email);

        return new UserProfileResponseDTO(updatedUser);
    }
}