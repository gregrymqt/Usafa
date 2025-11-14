package br.edu.fatecpg.usafa.features.location.services;

import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.location.interfaces.ILocationService;
import br.edu.fatecpg.usafa.features.location.dtos.LocationCreateDTO;
import br.edu.fatecpg.usafa.features.location.dtos.LocationDTO;
import br.edu.fatecpg.usafa.features.location.dtos.LocationUpdateDTO;
import br.edu.fatecpg.usafa.features.location.mappers.LocationMapper;
import br.edu.fatecpg.usafa.features.location.repositories.ILocationRepository;
import br.edu.fatecpg.usafa.models.Usafa;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j // Para logs de erro
public class LocationService implements ILocationService {

    private final ILocationRepository locationRepository;
    private final IUserRepository userRepository; // (Assumido)
    private final ICacheService cacheService;
    private final LocationMapper locationMapper; // (Assumindo um Mapper)

    private static final String CACHE_KEY_PREFIX = "USAFA_USER_";
    private String getCacheKey(String publicId) {
        return CACHE_KEY_PREFIX + publicId;
    }

    @Async
    @Transactional(readOnly = true)
    @Override
    public Optional<LocationDTO> findByUserPublicId(String publicId) {
        final String cacheKey = getCacheKey(publicId);

        try {
            // 1. Tenta buscar do Cache primeiro
            LocationDTO cachedLocation = cacheService.get(cacheKey, LocationDTO.class);
            if (cachedLocation != null) {
                log.info("Cache HIT para a chave: {}", cacheKey);
                return Optional.of(cachedLocation);
            }
        } catch (Exception e) {
            log.warn("Falha ao ler do cache (chave: {}). Buscando no DB. Erro: {}", cacheKey, e.getMessage());
        }

        try {
            // 2. Se não achar no cache, busca no DB
            log.info("Cache MISS para a chave: {}. Buscando no DB.", cacheKey);
            Optional<Usafa> usafa = locationRepository.findByUser_PublicId(publicId);

            if (usafa.isEmpty()) {
                return Optional.empty();
            }

            // 3. Mapeia para DTO
            LocationDTO dto = locationMapper.toDTO(usafa.get());

            // 4. Salva no cache para a próxima vez (ex: expira em 10 minutos)
            // (O método 'saveWithTtl' do seu CacheService já é @Async)
            cacheService.saveWithTtl(cacheKey, dto, 10, TimeUnit.MINUTES);

            return Optional.of(dto);

        } catch (DataAccessException e) {
            log.error("Erro de acesso ao banco ao buscar USAFA por publicId: {}", publicId, e);
            throw new DatabaseOperationException("Erro ao consultar dados da localização.", e);
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar USAFA por publicId: {}", publicId, e);
            throw new RuntimeException("Erro inesperado no servidor.", e);
        }
    }

    @Async
    @Transactional
    @Override
    public LocationDTO create(LocationCreateDTO locationCreateDTO) {
        final String publicId = locationCreateDTO.getUserPublicId();

        try {
            // 1. Encontra o usuário (Assumindo que UserRepository existe)
            User user = userRepository.findByPublicId(UUID.fromString(publicId))
                    .orElseThrow(() -> new BusinessRuleException("Usuário com ID " + publicId + " não encontrado."));

            // 2. (Regra de Negócio Opcional) Verifica se o usuário já tem uma USAFA
            locationRepository.findByUser_PublicId(publicId).ifPresent(u -> {
                throw new BusinessRuleException("Este usuário já possui uma USAFA cadastrada.");
            });

            // 3. Mapeia o DTO de criação para a Entidade
            Usafa newUsafa = locationMapper.fromCreateDTO(locationCreateDTO);
            newUsafa.setUser(user); // Associa o usuário

            // 4. Salva no DB
            Usafa savedUsafa = locationRepository.save(newUsafa);

            // 5. Mapeia a entidade salva para o DTO de retorno
            return locationMapper.toDTO(savedUsafa);

        } catch (BusinessRuleException e) {
            log.warn("Regra de negócio violada ao criar USAFA: {}", e.getMessage());
            throw e; // Re-lança a exceção de negócio (será tratada como 400 Bad Request)
        } catch (DataIntegrityViolationException e) {
            log.error("Violação de integridade ao criar USAFA para {}: {}", publicId, e.getMessage());
            throw new BusinessRuleException("Dados inválidos ou duplicados.", e);
        } catch (DataAccessException e) {
            log.error("Erro de acesso ao banco ao criar USAFA para {}:", publicId, e);
            throw new DatabaseOperationException("Erro ao salvar dados da localização.", e);
        } catch (Exception e) {
            log.error("Erro inesperado ao criar USAFA para {}:", publicId, e);
            throw new RuntimeException("Erro inesperado no servidor.", e);
        }
    }

    @Async
    @Transactional
    @Override
    public Optional<LocationDTO> update(Long id, LocationUpdateDTO locationUpdateDTO) {
        try {
            // 1. Busca a USAFA existente pelo ID
            Optional<Usafa> optionalUsafa = locationRepository.findById(id);

            if (optionalUsafa.isEmpty()) {
                return Optional.empty(); // Retorna 404 no Controller
            }

            Usafa usafa = optionalUsafa.get();

            // 2. Atualiza os campos
            usafa.setNome(locationUpdateDTO.getNome());
            usafa.setCep(locationUpdateDTO.getCep());

            // 3. Salva as alterações
            Usafa updatedUsafa = locationRepository.save(usafa);

            // 4. Invalida (deleta) o cache do usuário
            // (O método 'delete' do seu CacheService já é @Async)
            final String cacheKey = getCacheKey(updatedUsafa.getUser().getPublicId().toString());
            cacheService.delete(cacheKey);
            log.info("Cache invalidado para a chave: {}", cacheKey);

            // 5. Mapeia e retorna o DTO atualizado
            return Optional.of(locationMapper.toDTO(updatedUsafa));

        } catch (DataAccessException e) {
            log.error("Erro de acesso ao banco ao atualizar USAFA ID {}:", id, e);
            throw new DatabaseOperationException("Erro ao atualizar dados da localização.", e);
        } catch (Exception e) {
            log.error("Erro inesperado ao atualizar USAFA ID {}:", id, e);
            throw new RuntimeException("Erro inesperado no servidor.", e);
        }
    }
}