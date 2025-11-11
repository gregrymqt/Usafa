package br.edu.fatecpg.usafa;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
// 1. Importe o 'exclude' do Redis
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
// import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;
// 2. Importe o 'include' do JPA
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Esta é a abordagem combinada:
 * 1. Excluímos a configuração de repositórios Redis.
 * 2. Habilitamos explicitamente os repositórios JPA no pacote 'features'.
 */
@SpringBootApplication(
    excludeName = "org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration" // <-- FORÇA a exclusão do Redis Repo
)
@EnableJpaRepositories(
    basePackages = "br.edu.fatecpg.usafa.features" // <-- FORÇA a inclusão do JPA aqui
)
@EnableAsync // <-- ISSO LIGA O SUPORTE ASSÍNCRONO
public class UsafaApplication implements CommandLineRunner {

    // Cria uma instância do logger para esta classe
    private static final Logger logger = LoggerFactory.getLogger(UsafaApplication.class);

    public static void main(String[] args) {
        try {
            SpringApplication.run(UsafaApplication.class, args);
        } catch (Exception e) {
            // Captura qualquer exceção fatal durante a inicialização
            logger.error("Falha catastrófica ao iniciar a aplicação. Causa: ", e);
        }
    }

    @Override
    public void run(String... args) throws Exception {
        // Usando o logger em vez de System.out
        logger.info("Aplicação iniciada com sucesso!");
    }
}