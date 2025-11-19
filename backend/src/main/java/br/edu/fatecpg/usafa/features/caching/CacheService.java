package br.edu.fatecpg.usafa.features.caching;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Serviço para interagir com o cache (Redis).
 * Fornece métodos básicos de CRUD (Create, Read, Update, Delete) para
 * armazenar, recuperar e remover objetos do cache.
 */
@Service
@Slf4j // Adiciona logs automáticos
@RequiredArgsConstructor // Cria construtor para as dependências final
public class CacheService implements ICacheService {

    // Usar <String, String> costuma ser mais seguro para garantir que seja salvo como JSON puro,
    // mas manterei <String, Object> para compatibilidade com sua config atual.
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void save(String key, Object value) {
        try {
            redisTemplate.opsForValue().set(key, value);
        } catch (Exception e) {
            log.error("Erro ao salvar no cache Redis (Key: {}): {}", key, e.getMessage());
        }
    }

    @Override
    public void saveWithTtl(String key, Object value, long timeout, TimeUnit timeUnit) {
        try {
            redisTemplate.opsForValue().set(key, value, timeout, timeUnit);
        } catch (Exception e) {
            log.error("Erro ao salvar com TTL no cache Redis (Key: {}): {}", key, e.getMessage());
        }
    }

    @Override
    public <T> T get(String key, Class<T> clazz) {
        try {
            Object value = redisTemplate.opsForValue().get(key);
            
            if (value == null) {
                return null;
            }

            // Se o RedisTemplate já retornou o objeto do tipo certo, retorna direto
            if (clazz.isInstance(value)) {
                return clazz.cast(value);
            }

            // Caso o Redis retorne um LinkedHashMap (comum com Jackson), converte para o Objeto
            return objectMapper.convertValue(value, clazz);

        } catch (Exception e) {
            log.error("Erro ao buscar do cache Redis (Key: {}): {}", key, e.getMessage());
            return null; // Retorna null para forçar a busca no banco de dados
        }
    }

    @Override
    public void delete(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.error("Erro ao deletar do cache Redis (Key: {}): {}", key, e.getMessage());
        }
    }

    @Override
    public boolean exists(String key) {
        try {
            Boolean hasKey = redisTemplate.hasKey(key);
            return Boolean.TRUE.equals(hasKey);
        } catch (Exception e) {
            log.error("Erro ao verificar existência no cache Redis (Key: {}): {}", key, e.getMessage());
            return false; // Na dúvida, diz que não existe para buscar no banco
        }
    }
}