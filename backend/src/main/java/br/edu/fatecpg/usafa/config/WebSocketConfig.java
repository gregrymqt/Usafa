package br.edu.fatecpg.usafa.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // Liga o servidor de WebSocket
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Habilita um "broker" simples para enviar mensagens
        // Os clientes (front-end) vão ouvir destinos que começam com "/user"
        config.enableSimpleBroker("/user");
        
        // Define o prefixo do seu aplicativo (ex: /app/chat)
        config.setApplicationDestinationPrefixes("/app");
        
        // Permite enviar mensagens para usuários específicos (ex: /user/ID_DO_USER/queue/...)
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Expõe o endpoint de conexão WebSocket que o front-end irá se conectar.
        // /ws é o endpoint de handshake
        registry.addEndpoint("/ws")
                .setAllowedOrigins("*"); // Permite conexões de qualquer origem
    }
}