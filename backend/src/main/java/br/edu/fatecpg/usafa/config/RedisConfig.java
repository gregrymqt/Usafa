package br.edu.fatecpg.usafa.config; // (Verifique seu pacote)

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

     @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper;
    }

    private final tools.jackson.databind.ObjectMapper objectMapper;

    public RedisConfig(tools.jackson.databind.ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }
    /**
     * 2. Agora o redisTemplate RECEBE o ObjectMapper como parâmetro,
     * em vez de criar o seu próprio.
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(
            RedisConnectionFactory connectionFactory) { // CORREÇÃO: Recebemos o ObjectMapper por injeção de dependência
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        // Serializador para as chaves (String)
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // Serializador para os valores (JSON) - usa o Bean global
        template.setValueSerializer(new org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer(objectMapper));
        template.setHashValueSerializer(new org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer(objectMapper)); // CORREÇÃO: Usamos o Bean globalobjectMapper));

        template.afterPropertiesSet();
        return template;
    }
}