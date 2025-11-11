package br.edu.fatecpg.usafa.features.caching;
import java.util.concurrent.TimeUnit;

public interface ICacheService {

    void save(String key, Object value);

    void saveWithTtl(String key, Object value, long timeout, TimeUnit timeUnit);

    <T> T get(String key, Class<T> clazz);

    void delete(String key);

    boolean exists(String key);
}
