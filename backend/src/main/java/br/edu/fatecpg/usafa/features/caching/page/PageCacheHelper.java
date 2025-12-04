package br.edu.fatecpg.usafa.features.caching.page;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import br.edu.fatecpg.usafa.features.caching.ICacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class PageCacheHelper {

    private final ICacheService cacheService;
    private final ObjectMapper objectMapper;

    /**
     * Método genérico para buscar páginas com cache (Redis).
     *
     * @param cacheKey   A chave única do cache (ex: "consultas:user:1:0:10")
     * @param dtoClass   A classe do DTO de retorno (ex: ConsultaDTO.class)
     * @param dbFetcher  A função que busca no banco se não houver cache (ex: () -> repository.find(...))
     * @param toDtoMapper A função que converte a Entidade do banco para DTO (ex: mapper::toDTO)
     * @param ttl        Tempo de vida do cache
     * @param timeUnit   Unidade de tempo
     * @param <E>        Tipo da Entidade (Entity do Banco)
     * @param <D>        Tipo do DTO (Objeto de Retorno)
     * @return Uma Page<D> populada (do cache ou do banco)
     */
    public <E, D> Page<D> getPageFromCacheOrDb(
            String cacheKey,
            Class<D> dtoClass,
            Supplier<Page<E>> dbFetcher,
            Function<E, D> toDtoMapper,
            long ttl,
            TimeUnit timeUnit
    ) {
        // 1. Tenta buscar no Cache
        try {
            @SuppressWarnings("unchecked")
            PageCacheWrapper<D> wrapper = cacheService.get(cacheKey, PageCacheWrapper.class);

            if (wrapper != null) {
                // Se achou, converte o conteúdo (LinkedHashMap -> DTO) e retorna
                List<D> content = wrapper.getContent().stream()
                        .map(obj -> objectMapper.convertValue(obj, dtoClass))
                        .collect(Collectors.toList());

                return new PageImpl<>(
                        content,
                        PageRequest.of(wrapper.getPageNumber(), wrapper.getPageSize()),
                        wrapper.getTotalElements()
                );
            }
        } catch (Exception e) {
            log.warn("Erro ao ler cache (Key: {}). Buscando no banco. Erro: {}", cacheKey, e.getMessage());
            // Se falhar o cache, não paramos o fluxo, apenas buscamos no banco.
        }

        // 2. Se não tem cache (ou falhou), busca no Banco de Dados
        Page<E> entityPage = dbFetcher.get();

        // 3. Converte Entidade -> DTO
        Page<D> dtoPage = entityPage.map(toDtoMapper);

        // 4. Salva no Cache (usando o Wrapper para não quebrar o Redis)
        try {
            PageCacheWrapper<D> cacheWrapper = new PageCacheWrapper<>(
                    dtoPage.getContent(),
                    dtoPage.getNumber(),
                    dtoPage.getSize(),
                    dtoPage.getTotalElements()
            );
            cacheService.saveWithTtl(cacheKey, cacheWrapper, ttl, timeUnit);
        } catch (Exception e) {
            log.error("Erro ao salvar no cache (Key: {}): {}", cacheKey, e.getMessage());
        }

        return dtoPage;
    }
}