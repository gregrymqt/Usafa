/**
 * Tenta compartilhar dados usando a Web Share API.
 * Se falhar, copia o `shareData.text` para a área de transferência.
 *
 * @param shareData Objeto em conformidade com a API navigator.share
 * (ex: { title: '...', text: '...', url: '...' })
 */
export const shareContent = (shareData: ShareData): void => {

  if (navigator.share) {
    // Usa a API de Compartilhamento nativa
    navigator.share(shareData)
      .catch(err => console.error('Erro ao compartilhar:', err));
  } else {
    // Fallback: Copia para a área de transferência
    console.warn('API de compartilhamento não suportada. Copiando para a área de transferência...');
    try {
      // O fallback copia apenas o texto
      if (shareData.text) {
        navigator.clipboard.writeText(shareData.text);
        console.log('Texto copiado para a área de transferência.');
      }
    } catch (err) {
      console.error('Falha ao copiar texto para a área de transferência: ', err);
    }
  }
};