import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';

// A URL do backend continua a mesma [cite: 2]
const WS_URL = 'http://localhost:8080/ws';

let stompClient: Client | null = null;

/**
 * Armazena os callbacks que os componentes registraram.
 * Chave: o tópico (ex: '/user/123/queue/consultas')
 * Valor: a função de callback
 */
const componentCallbacks = new Map<string, (payload: unknown) => void>();

/**
 * Armazena as inscrições ativas do STOMP (para podermos cancelar).
 * Chave: o tópico
 * Valor: O objeto de inscrição
 */
const activeSubscriptions = new Map<string, StompSubscription>();

/**
 * Função interna para inicializar o cliente e seus handlers.
 * É um singleton: só cria o cliente uma vez.
 */
const getStompClient = (): Client => {
  if (stompClient) {
    return stompClient;
  }

  // Cria o cliente [cite: 8]
  stompClient = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  /**
   * O handler onConnect agora é genérico.
   * Quando reconecta, ele automaticamente se inscreve
   * em TODOS os tópicos que os componentes registraram.
   */
  stompClient.onConnect = () => {
    console.log('WebSocket Conectado!');

    // Itera sobre todos os callbacks que os componentes pediram
    componentCallbacks.forEach((callback, topic) => {
      // (Re)inscreve no tópico
      if (!activeSubscriptions.has(topic)) {
        const sub = stompClient!.subscribe(topic, (message: IMessage) => {
          handleMessage(topic, message, callback);
        });
        activeSubscriptions.set(topic, sub);
      }
    });
  };

  // Handler de erro [cite: 12]
  stompClient.onStompError = (frame) => {
    console.error('Erro no WebSocket:', frame.headers['message'], frame.body);
  };

  return stompClient;
};

/**
 * Função helper para tratar e parsear mensagens.
 */
const handleMessage = (
  topic: string,
  message: IMessage,
  callback: (payload: unknown) => void
) => {
  try {
    const payload = JSON.parse(message.body);
    // Chama o callback específico do componente com o payload
    callback(payload);
  } catch (e) {
    console.error(
      `Falha ao parsear JSON do tópico ${topic}:`,
      e,
      message.body
    );
  }
};

/**
 * Conecta ao WebSocket.
 * Esta função agora só "ativa" o cliente. 
 * Ela não recebe mais IDs ou callbacks. [cite: 5, 6]
 */
export const connectWebSocket = () => {
  const client = getStompClient();
  if (!client.active) {
    client.activate();
  }
};

/**
 * NOVA FUNÇÃO: Permite que qualquer componente se inscreva em um tópico.
 *
 * @param topic O destino completo (ex: /user/public-id/queue/consultas)
 * @param callback A função que o componente quer executar (ex: setConsulta)
 */
export const subscribe = <T>(
  topic: string,
  callback: (message: T) => void
) => {
  const client = getStompClient();

  // 1. Armazena o callback, para o caso de reconexão
  componentCallbacks.set(topic, callback as (payload: unknown) => void);

  // 2. Se o cliente já estiver ativo, se inscreve imediatamente.
  //    Se não estiver, o `onConnect` cuidará disso.
  if (client.active) {
    if (!activeSubscriptions.has(topic)) {
      const sub = client.subscribe(topic, (message: IMessage) => {
        handleMessage(topic, message, callback as (payload: unknown) => void);
      });
      activeSubscriptions.set(topic, sub);
    }
  }
};

/**
 * NOVA FUNÇÃO: Permite que um componente cancele sua inscrição.
 * (Ex: quando o componente é desmontado - useEffect cleanup)
 *
 * @param topic O tópico que não deve mais ser escutado.
 */
export const unsubscribe = (topic: string) => {
  // Remove da lista de callbacks
  componentCallbacks.delete(topic);

  // Cancela a inscrição ativa no STOMP
  const subscription = activeSubscriptions.get(topic);
  if (subscription) {
    subscription.unsubscribe();
    activeSubscriptions.delete(topic);
    console.log(`Inscrição cancelada para: ${topic}`);
  }
};

/**
 * Desconecta o WebSocket e limpa todos os registros. [cite: 14]
 */
export const disconnectWebSocket = () => {
  stompClient?.deactivate();
  stompClient = null;
  componentCallbacks.clear();
  activeSubscriptions.clear();
  console.log('WebSocket Desconectado e limpo.');
};