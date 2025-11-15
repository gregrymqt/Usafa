// (Caminho: src/shared/services/websocket.service.ts)

import { Client, type IMessage } from '@stomp/stompjs';
import type { ConsultaSummary } from '../../features/Consulta/types/consulta.types';

// URL do seu backend Spring Boot
const WS_URL = 'http://localhost:8080/ws';

let stompClient: Client | null = null;

// Armazena as funções (callbacks) que os componentes registraram
let onConsultaCallback: (summary: ConsultaSummary) => void = () => {};

/**
 * Conecta ao WebSocket (STOMP) e se inscreve nos tópicos.
 * @param userPublicId O ID do usuário para escutar no canal privado.
 */
export const connectWebSocket = (
  userPublicId: string,
  // O componente (ex: useConsulta) passa sua função de 'setter'
  onConsultaReceived: (summary: ConsultaSummary) => void
) => {
  if (stompClient?.active) {
    console.log('WebSocket já está conectado.');
    return;
  }

  // Define a função de callback
  onConsultaCallback = onConsultaReceived;

  stompClient = new Client({
    brokerURL: WS_URL, // Endpoint que definimos no Spring
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  stompClient.onConnect = () => {
    console.log('WebSocket Conectado!');
    
    // Se inscreve no destino PRIVADO do usuário
    // (O mesmo que definimos no NotificationService)
    stompClient?.subscribe(
      `/user/${userPublicId}/queue/consultas`, // O destino
      (message: IMessage) => {
        // Mensagem recebida!
        const summary = JSON.parse(message.body) as ConsultaSummary;
        console.log('Nova confirmação de consulta recebida:', summary);
        
        // Chama o callback (que vai atualizar o estado do React)
        onConsultaCallback(summary);
      }
    );
  };

  stompClient.onStompError = (frame) => {
    console.error('Erro no WebSocket:', frame.headers['message'], frame.body);
  };

  // Inicia a conexão
  stompClient.activate();
};

/**
 * Desconecta o WebSocket.
 */
export const disconnectWebSocket = () => {
  stompClient?.deactivate();
  console.log('WebSocket Desconectado.');
};