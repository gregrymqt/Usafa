package br.edu.fatecpg.usafa.config;

import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração de INFRAESTRUTURA do RabbitMQ.
 * Esta classe é 100% genérica e não sabe nada sobre filas específicas.
 * Ela apenas configura o RabbitTemplate para usar JSON.
 */
@Configuration
public class RabbitMQConfig {

    /**
     * Define o conversor de mensagens padrão como JSON.
     * Isso permite que você envie qualquer classe POJO (ex: ConsultaRequestDTO)
     * e o Spring irá serializá-la para JSON automaticamente.
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }

    /**
     * Cria o 'RabbitTemplate' (o que envia mensagens) e
     * o configura para USAR o conversor JSON que acabamos de criar.
     */
    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}