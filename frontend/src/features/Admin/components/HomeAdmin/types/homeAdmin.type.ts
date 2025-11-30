export type ContentType = 'CAROUSEL_MAIN' | 'SERVICE_CARD' | 'ABOUT_SECTION' | 'GALLERY_PHOTO';

export interface HomeContent {
  id: number | string;
  type: ContentType;
  title: string;
  description: string;
  imageUrl?: string; // URL da imagem para preview/exibição
  imageFile?: File;  // Arquivo real para upload
  isActive: boolean;
}

// Usado para o Select de filtro e tipo
// Ajuste os valores para MAIÚSCULO conforme o Enum do Java
export const CONTENT_TYPES: { label: string; value: ContentType }[] = [
  { label: 'Banner Principal', value: 'CAROUSEL_MAIN' },
  { label: 'Seção de Serviços', value: 'SERVICE_CARD' },
  { label: 'Sobre Nós', value: 'ABOUT_SECTION' },
  { label: 'Galeria', value: 'GALLERY_PHOTO' }
];