package br.edu.fatecpg.usafa.features.admin.utils.patient;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Component;

import br.edu.fatecpg.usafa.features.admin.dtos.patient.Password.PasswordTokenCacheDto;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.models.PasswordCreationToken;
import br.edu.fatecpg.usafa.models.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class PatientPasswordHelper {

    private final ICacheService cacheService;
    private static final String CACHE_PREFIX = "auth:password-token:";

    public PasswordTokenCacheDto toCacheDto(PasswordCreationToken entity) {
        if (entity == null) return null;
        
        // Proteção extra caso o user venha nulo, embora não deva acontecer
        Long userId = (entity.getUser() != null) ? entity.getUser().getId() : null;
        UUID userPublicId = (entity.getUser() != null) ? entity.getUser().getPublicId() : null;

        return new PasswordTokenCacheDto(
            entity.getId(),
            entity.getToken(),
            entity.getFullUrl(),
            entity.getExpiryDate(),
            entity.isActive(),
            userId,        
            userPublicId   
        ); // [cite: 38]
    }

    public PasswordCreationToken toEntity(PasswordTokenCacheDto dto) {
        if (dto == null) return null;
        
        PasswordCreationToken entity = new PasswordCreationToken();
        entity.setId(dto.id());
        entity.setToken(dto.token());
        entity.setFullUrl(dto.fullUrl());
        entity.setExpiryDate(dto.expiryDate());
        entity.setActive(dto.active());

        // Reconstrói o objeto User com os dados do Cache
        User user = new User();
        user.setId(dto.userId());           // Setamos o ID numérico
        user.setPublicId(dto.userPublicId()); // Setamos o UUID
        entity.setUser(user);

        return entity; // [cite: 44]
    }

    public void updateCache(PasswordCreationToken token, String userPublicId) {
        try {
            if (token.getExpiryDate().isAfter(LocalDateTime.now())) {
                long hours = java.time.Duration.between(LocalDateTime.now(), token.getExpiryDate()).toHours();
                if (hours > 0) {
                    String cacheKey = CACHE_PREFIX + userPublicId;
                    PasswordTokenCacheDto dto = toCacheDto(token);
                    
                    // Agora vai funcionar porque adicionamos as anotações @JsonSerialize no DTO
                    cacheService.saveWithTtl(cacheKey, dto, hours, TimeUnit.HOURS); // [cite: 46]
                    log.info("Cache atualizado para chave: {}", cacheKey);
                }
            }
        } catch (Exception e) {
            //  O erro de data JSR310 vai sumir com as anotações no DTO
            //  O erro de Proxy vai sumir com o ajuste no Service
            log.error("Erro ao salvar no cache Redis: {}", e.getMessage()); 
        }
    }
}