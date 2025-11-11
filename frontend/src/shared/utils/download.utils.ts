/**
 * Gera um arquivo .txt com o conteúdo fornecido e inicia o download.
 *
 * @param content O conteúdo de texto (string) a ser baixado.
 * @param filename O nome do arquivo (ex: 'dados.txt').
 */
export const downloadAsTxt = (content: string, filename: string): void => {
  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    
    // Cria um link temporário para o download
    const link = document.createElement('a');
    link.href = href;
    link.download = filename; // Usa o nome de arquivo genérico
    
    // Adiciona ao DOM, clica e remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpa a URL do objeto
    URL.revokeObjectURL(href);
    
  } catch (err) {
    console.error('Falha ao gerar download:', err);
  }
};