package br.edu.fatecpg.usafa.features.caching;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Serviço para interagir com o cache (Redis).
 * Fornece métodos básicos de CRUD (Create, Read, Update, Delete) para
 * armazenar, recuperar e remover objetos do cache.
 */
@Service
public class CacheService implements ICacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    public CacheService(RedisTemplate<String, Object> redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Salva (ou atualiza) um valor no cache sem tempo de expiração.
     * @param key A chave única para o item no cache.
     * @param value O objeto a ser armazenado.
     */
    @Async
    public void save(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }

    /**
     * Salva (ou atualiza) um valor no cache com um tempo de expiração (TTL - Time To Live).
     * @param key A chave única para o item no cache.
     * @param value O objeto a ser armazenado.
     * @param timeout O tempo de vida do item no cache.
     * @param timeUnit A unidade de tempo (ex: TimeUnit.MINUTES).
     */
    @Async
    public void saveWithTtl(String key, Object value, long timeout, TimeUnit timeUnit) {
        redisTemplate.opsForValue().set(key, value, timeout, timeUnit);
    }

    /**
     * Busca um valor do cache e o converte para o tipo especificado.
     * @param key A chave do item a ser buscado.
     * @param clazz O tipo (classe) para o qual o resultado deve ser convertido.
     * @return O objeto encontrado e convertido, ou null se a chave não existir.
     */
    @Async
    public <T> T get(String key, Class<T> clazz) {
        Object value = redisTemplate.opsForValue().get(key);
        return objectMapper.convertValue(value, clazz);
    }

    /**
     * Deleta um valor do cache.
     * @param key A chave do item a ser removido.
     */
    @Async
    public void delete(String key) {
        redisTemplate.delete(key);
    }

    /**
     * Verifica se uma chave existe no cache.
     * @param key A chave a ser verificada.
     * @return true se a chave existir, false caso contrário.
     */
    @Async
    public boolean exists(String key) {
        Boolean hasKey = redisTemplate.hasKey(key);
        return hasKey != null && hasKey;
    }
}