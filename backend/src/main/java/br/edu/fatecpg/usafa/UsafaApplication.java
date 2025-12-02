package br.edu.fatecpg.usafa;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(
    excludeName = "org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration"
)
@EnableJpaRepositories(
    basePackages = "br.edu.fatecpg.usafa.features"
)
@EnableAsync
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class UsafaApplication implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(UsafaApplication.class);

    public static void main(String[] args) {
        // REMOVIDO O TRY-CATCH. Deixe o Spring rodar livremente.
        SpringApplication.run(UsafaApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("Aplicação iniciada com sucesso!");
    }
}