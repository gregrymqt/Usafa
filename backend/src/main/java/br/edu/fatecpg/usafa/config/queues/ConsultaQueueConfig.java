package br.edu.fatecpg.usafa.config.queues;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração da TOPOLOGIA do RabbitMQ para a fila de Consultas.
 * Define a Fila, a Exchange e a Ligação (Binding) específicas
 * para a funcionalidade de solicitação de consulta.
 */
@Configuration
public class ConsultaQueueConfig {

    // Os 3 parâmetros (constantes) agora vivem aqui,
    // junto com a funcionalidade que os utiliza.
    public static final String EXCHANGE_NAME = "usafa_direct_exchange";
    public static final String CONSULTA_QUEUE_NAME = "consulta_request_queue";
    public static final String CONSULTA_ROUTING_KEY = "consulta.request";

    /**
     * Define a Fila (Queue) de solicitações de consulta.
     */
    @Bean
    public Queue consultaQueue() {
        return new Queue(CONSULTA_QUEUE_NAME, true); // Fila durável
    }

    /**
     * Define a Exchange (troca) que roteará as mensagens.
     * (Se outras filas usarem a mesma exchange, não há problema
     * em definir o @Bean de exchange em vários arquivos).
     */
    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE_NAME);
    }

    /**
     * Define o 'Binding' (ligação) entre a fila e a exchange.
     * O Spring injeta os beans 'consultaQueue' e 'exchange'
     * que definimos acima.
     */
    @Bean
    public Binding binding(Queue consultaQueue, DirectExchange exchange) {
        return BindingBuilder.bind(consultaQueue)
                             .to(exchange)
                             .with(CONSULTA_ROUTING_KEY);
    }
}
